from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update, func

from ..db.models import BlockOfText
from ..db.models import User
from ..db.models import Comment
from ..core.dependencies import get_db, get_current_user
from ..schemas.comment_schemas import CreateComment, ResponseComment, CommentList
import uuid

router = APIRouter()

@router.post('/create', response_model=ResponseComment)
async def create_comment(com: CreateComment,
                         id_block: uuid.UUID,
                         session: AsyncSession = Depends(get_db),
                         user: User = Depends(get_current_user)):
    stmt=await session.execute(select(BlockOfText).where(BlockOfText.id==id_block, BlockOfText.is_active==True))
    block=stmt.scalar_one_or_none()

    if not block:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND)

    comment=Comment(comment=com.comment, block_id=id_block, user_id=user.id)
    session.add(comment)
    await session.commit()
    await session.refresh(comment)
    return {'id': comment.id,
            'comment': comment.comment,
            'created_at': comment.created_at,
            'is_active': comment.is_active,
            'username': user.username}

@router.get('/get_comments', response_model=CommentList)
async def get_comments(
        id_block: uuid.UUID,
        page: int = Query(1, ge=1),
        page_size: int = Query(20, ge=1, le=100),
        session: AsyncSession = Depends(get_db)):


    stmt=await session.execute(select(BlockOfText).where(BlockOfText.id==id_block, BlockOfText.is_active==True))
    block=stmt.scalar_one_or_none()

    if not block:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND)

    total=await session.scalar(select(func.count(Comment.id))
                               .where(Comment.block_id == id_block, Comment.is_active == True)
                               )

    stmt=await session.execute(
        select(Comment.id.label('id'),
               Comment.comment.label('comment'),
               Comment.created_at.label('created_at'),
               Comment.is_active.label('is_active'),
     User.username.label("username"),
    )
    .join(User, Comment.user_id == User.id)
        .where(Comment.block_id==id_block, Comment.is_active==True)
        .order_by(Comment.id)
        .offset((page - 1) * page_size)
        .limit(page_size)
    )

    items = stmt.mappings().all()
    return {
        "items": items,
        "total": total,
        "page": page,
        "page_size": page_size,
    }

@router.put('/update', response_model=ResponseComment)
async def update_comment(com: CreateComment,
                         id_comment: int,
                         session: AsyncSession = Depends(get_db),
                         user: User = Depends(get_current_user)):
    stmt=await session.execute(select(Comment).where(Comment.id==id_comment,
                                                         Comment.is_active==True,
                                                        Comment.user_id==user.id))

    comment=stmt.scalar_one_or_none()

    if not comment:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND)


    comment.comment=com.comment

    await session.commit()
    await session.refresh(comment)
    return {'id': comment.id,
            'comment': comment.comment,
            'created_at': comment.created_at,
            'is_active': comment.is_active,
            'username': user.username}

@router.delete('/delete')
async def delete_comment(id_comment: int,
                         session: AsyncSession = Depends(get_db),
                         user: User = Depends(get_current_user)):

    stmt=await session.execute(select(Comment).where(Comment.id==id_comment,
                                                         Comment.is_active==True,
                                                        Comment.user_id==user.id))

    comment=stmt.scalar_one_or_none()

    if not comment:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND)

    await session.execute(update(Comment).values(is_active=False).where(Comment.id==id_comment,
                                                         Comment.is_active==True,
                                                        Comment.user_id==user.id))
    await session.commit()

    return {'message': 'Ok'}