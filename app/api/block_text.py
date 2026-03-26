from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update

from ..db.models import BlockOfText
from ..db.models import User
from ..core.dependencies import get_db, get_current_user
from ..schemas.text_schemas import CreateBlock, ResponseBlock
import uuid

router = APIRouter()

@router.post('/create_block', response_model=ResponseBlock)
async def crete_block(block: CreateBlock, session: AsyncSession = Depends(get_db), user: User = Depends(get_current_user)):
    post=BlockOfText(**block.model_dump())
    post.user=user
    session.add(post)
    await session.flush()
    post.url_block=f'http://153.80.251.221:80/blocks/{post.id}'
    await session.commit()

    return post

@router.get('/text_blocks', response_model=list[ResponseBlock])
async def get_blocks(user: User = Depends(get_current_user), session: AsyncSession = Depends(get_db)):
    stmt=await session.scalars(select(BlockOfText).where(BlockOfText.user_id==user.id,
                                                         BlockOfText.is_active==True))
    r=stmt.all()
    return r


@router.get('/text_block', response_model=ResponseBlock)
async def get_block_by_query(uuid: uuid.UUID = Query(...), session: AsyncSession = Depends(get_db)):
    stmt = select(BlockOfText).where(BlockOfText.id == uuid, BlockOfText.is_active == True)
    result = (await session.execute(stmt)).scalar_one_or_none()

    if not result:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND)

    return result

@router.get('/text_block/{uuid}', response_model=ResponseBlock)
async def get_block(uuid: uuid.UUID, session: AsyncSession = Depends(get_db)):
    stmt=select(BlockOfText).where(BlockOfText.id==uuid, BlockOfText.is_active==True)
    result=(await session.execute(stmt)).scalar_one_or_none()

    if not result:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND)

    return result


@router.get('/{uuid}', response_model=ResponseBlock)
async def get_block_by_front_path(uuid: uuid.UUID, session: AsyncSession = Depends(get_db)):
    stmt = select(BlockOfText).where(BlockOfText.id == uuid, BlockOfText.is_active == True)
    result = (await session.execute(stmt)).scalar_one_or_none()

    if not result:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND)

    return result

@router.put('/update_block', response_model=ResponseBlock)
async def update_block(id: uuid.UUID, block: CreateBlock, session: AsyncSession = Depends(get_db), user: User = Depends(get_current_user)):
    stmt=await session.execute(select(BlockOfText)
                               .where(BlockOfText.id==id,
                                      BlockOfText.is_active==True,
                                      BlockOfText.user_id==user.id))
    r=stmt.scalar_one_or_none()
    if not r:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND)

    await session.execute(update(BlockOfText)
                          .values(**block.model_dump())
                          .where(BlockOfText.id == id,
                                 BlockOfText.is_active == True,
                                 BlockOfText.user_id == user.id))
    await session.commit()
    return r


@router.delete('/delete_block')
async def delete_block(id: uuid.UUID, session: AsyncSession = Depends(get_db), user: User = Depends(get_current_user)):
    stmt=await session.execute(select(BlockOfText)
                               .where(BlockOfText.id==id,
                                      BlockOfText.is_active==True,
                                      BlockOfText.user_id==user.id))
    r=stmt.scalar_one_or_none()
    if not r:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND)

    await session.execute(update(BlockOfText)
                          .values(is_active=False)
                          .where(BlockOfText.id == id,
                                 BlockOfText.is_active == True,
                                 BlockOfText.user_id == user.id))

    await session.commit()
    return {'message': 'Ok'}
