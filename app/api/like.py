from fastapi import APIRouter, Depends, status, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from ..db.models import like_model, User, BlockOfText
from ..core.dependencies import get_db, get_current_user
from sqlalchemy import select, delete, func, insert
from uuid import UUID

router = APIRouter()

@router.post('/add_like')
async def add_like(block_id: UUID,
                   user: User = Depends(get_current_user),
                   session: AsyncSession = Depends(get_db)):
    stmt= await session.execute(select(BlockOfText).where(BlockOfText.id==block_id,
                                                          BlockOfText.is_active==True))
    block=stmt.scalar_one_or_none()

    if not block:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND)

    stmt=await session.execute(select(like_model).where((like_model.c.user_id==user.id) &
                                                        (like_model.c.block_id==block_id)))
    like=stmt.scalar_one_or_none()
    if like:
        raise HTTPException(status_code=400, detail="Already liked")

    await session.execute(
        insert(like_model).values(
            user_id=user.id,
            block_id=block_id
        )
    )
    await session.commit()
    return {'massage': 'like add'}


@router.delete('/delete_like')
async def add_like(block_id: UUID,
                   user: User = Depends(get_current_user),
                   session: AsyncSession = Depends(get_db)):
    stmt= await session.execute(select(BlockOfText).where(BlockOfText.id==block_id,
                                                          BlockOfText.is_active==True))
    block=stmt.scalar_one_or_none()

    if not block:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND)

    stmt=await session.execute(select(like_model).where((like_model.c.user_id==user.id) &
                                                        (like_model.c.block_id==block_id)))
    like=stmt.scalar_one_or_none()
    if not like:
        raise HTTPException(status_code=404, detail="not found liked")


    await session.execute(delete(like_model).where((like_model.c.user_id==user.id) &
                                                   (like_model.c.block_id==block_id)))
    await session.commit()
    return {'massage': 'like delete'}

@router.get('/get_total_like')
async def get_total_like(id_block: UUID, session: AsyncSession = Depends(get_db)):
    stmt=await session.execute(select(BlockOfText).where(BlockOfText.id==id_block,
                                                         BlockOfText.is_active==True))
    block=stmt.scalar_one_or_none()
    if not block:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND)

    like_total=await session.scalar(select(func.count(like_model.c.block_id)).where(like_model.c.block_id==id_block))
    return {'like_total': like_total}