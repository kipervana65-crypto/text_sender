from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import or_, select
from ..schemas.auth import Token
from ..schemas.user import UserResponse, UserCreate
from jose import jwt, JWTError


from ..db.models.user import User
from ..services.email_service import EmailSender
from ..core.security import (
    verify_password,
    get_password_hash,
    create_access_token,
    create_refresh_token
)
from ..db.session import get_db
from datetime import timedelta
import random
from ..core.config import settings
from ..core.dependencies import get_current_user

router = APIRouter()

@router.post("/register", response_model=UserResponse)
async def register(
    user_data: UserCreate,
    db: AsyncSession = Depends(get_db)
):
    # Проверяем, существует ли пользователь
    result = await db.execute(select(User).where(User.email == user_data.email))
    existing_user = result.scalar_one_or_none()
    if existing_user:
        raise HTTPException(
            status_code=400,
            detail="Email already registered"
        )


    result = await db.execute(select(User).where(User.username == user_data.username))
    existing_user = result.scalar_one_or_none()


    if existing_user:
        raise HTTPException(
            status_code=400,
            detail="Username already registered"
        )

    # Хэшируем пароль
    hashed_password = get_password_hash(user_data.password)


    # Создаём пользователя
    db_user = User(
        email=user_data.email,
        hashed_password=hashed_password,
        username=user_data.username,
    )
    db.add(db_user)
    await db.commit()
    await db.refresh(db_user)
    return db_user

@router.post("/send_code")
async def send_code(email: str,
                    session: AsyncSession = Depends(get_db)):
    stmt=await session.execute(select(User).where(User.email==email, User.is_active==True))
    user=stmt.scalar_one_or_none()

    if not user:
        raise HTTPException(status_code=404, detail='user not found')

    if user.is_verified:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already verified"
        )

    # Отправляем код
    code=random.randint(100000, 999999)
    email_sender=EmailSender()
    email_sender.send_email_code(to_email=str(user.email), code=str(code))

    user.code=code
    await session.commit()

    return {'message': 'the code was sent to the email'}

@router.post('/verify_email')
async def verify_email(email: str,
                       code: int,
                       session: AsyncSession = Depends(get_db)):
    stmt=await session.execute(select(User).where(User.email==email, User.is_active==True))
    user=stmt.scalar_one_or_none()

    if not user:
        raise HTTPException(status_code=404, detail='user not found')

    if user.is_verified:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already verified"
        )

    if user.code!=code:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid verification code"
        )

    user.is_verified=True
    user.code=None
    await session.commit()
    return {'message': 'email confirmed'}

@router.post("/token", response_model=Token)
async def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(
        select(User).where(
            or_(
                User.email == form_data.username,
                User.username == form_data.username
            )
        )
    )
    user = result.scalar_one_or_none()

    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)

    access_token = create_access_token(
        data={"sub": user.email},
        expires_delta=access_token_expires
    )

    refresh_token = create_refresh_token(
        data={"sub": user.email}
    )

    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer"
    }

@router.post("/refresh", response_model=Token)
async def refresh_token(
    refresh_token: str,
    db: AsyncSession = Depends(get_db)
):
    try:
        payload = jwt.decode(refresh_token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise HTTPException(status_code=400, detail="Invalid refresh token")
    except JWTError:
        raise HTTPException(status_code=400, detail="Invalid refresh token")

    # Проверяем, что пользователь существует и активен
    result = await db.execute(
        select(User).where(User.email == email, User.is_active == True)
    )
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=400, detail="User not found or inactive")

    # Выдаём новый access token
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.email},
        expires_delta=access_token_expires
    )

    # Выдаём новый refresh token (чтобы продлить сессию)
    new_refresh_token = create_refresh_token(data={"sub": user.email})

    return {
        "access_token": access_token,
        "refresh_token": new_refresh_token,
        "token_type": "bearer"
    }

@router.get('/me', response_model=UserResponse)
async def me(user: User = Depends(get_current_user)):
    return user
