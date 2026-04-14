from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.ext.asyncio import AsyncSession
from ..db.session import get_db
from ..core.security import jwt, JWTError
from ..core.config import settings
from ..schemas.auth import TokenData
from ..db.models.user import User
from sqlalchemy import select
from ..repositories.block_repo import BlockOfTextRepository
from ..service.block_service import BlockOfTextService
from ..repositories.like_repo import LikeRepositories
from ..service.like_service import LikeService
from ..repositories.comment_repo import CommentRepository
from ..service.comment_service import CommentService


oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/token")

async def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: AsyncSession = Depends(get_db)
):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise credentials_exception
        token_data = TokenData(email=email)
    except JWTError:
        raise credentials_exception

    result = await db.execute(select(User).where(User.email == email,
                                                 User.is_active==True))

    user = result.scalar_one_or_none()
    if user is None:
        raise credentials_exception

    if not user.is_verified:
        raise HTTPException(
        status_code=status.HTTP_403_FORBIDDEN,
        detail="Email is not verified",
            headers={"X-Error-Code": "EMAIL_NOT_VERIFIED"}
        )


    return user

def get_post_repo(session: AsyncSession = Depends(get_db)):
    return BlockOfTextRepository(session)

def get_post_service(repo: BlockOfTextRepository = Depends(get_post_repo)):
    return BlockOfTextService(repo)

def get_like_repo(session: AsyncSession = Depends(get_db)):
    return LikeRepositories(session)

def get_like_service(block_repo: BlockOfTextRepository = Depends(get_post_repo),
                     like_repo: LikeRepositories = Depends(get_like_repo)):
    return LikeService(like_repo, block_repo)


def get_comment_repo(session: AsyncSession = Depends(get_db)):
    return CommentRepository(session)


def get_comment_service(repo: CommentRepository = Depends(get_comment_repo)):
    return CommentService(repo)
