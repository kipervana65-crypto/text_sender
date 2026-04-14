from fastapi import APIRouter, Depends, HTTPException, Query, status
import uuid

from ..core.dependencies import get_comment_service, get_current_user
from ..db.models import User
from ..schemas.comment_schemas import CreateComment, ResponseComment, CommentList
from ..service.comment_service import CommentService
from ..service.exceptions.except_for_block import BlockNotFound
from ..service.exceptions.except_for_comment import (
    CommentNotFound,
    ParentCommentNotFound,
    ParentCommentNotBelongToBlock,
)

router = APIRouter()


@router.post('/create', response_model=ResponseComment)
async def create_comment(
    com: CreateComment,
    id_block: uuid.UUID,
    parent_id: int = None,
    serv: CommentService = Depends(get_comment_service),
    user: User = Depends(get_current_user),
):
    try:
        comment = await serv.create_comment(
            block_id=id_block,
            text=com.comment,
            user=user,
            parent_id=parent_id,
        )
    except BlockNotFound:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail='block not found')
    except ParentCommentNotFound:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail='comment not found')
    except ParentCommentNotBelongToBlock:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail='parent comment does not belong to this block',
        )

    return {
        'id': comment.id,
        'comment': comment.comment,
        'created_at': comment.created_at,
        'is_active': comment.is_active,
        'username': user.username,
    }


@router.get('/get_comments', response_model=CommentList)
async def get_comments(
    id_block: uuid.UUID,
    parent_id: int = None,
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    serv: CommentService = Depends(get_comment_service),
):
    try:
        items, total = await serv.get_comments(
            block_id=id_block,
            parent_id=parent_id,
            page=page,
            page_size=page_size,
        )
    except BlockNotFound:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail='block not found')
    except ParentCommentNotFound:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail='comment not found')

    return {
        'items': items,
        'total': total,
        'page': page,
        'page_size': page_size,
    }


@router.put('/update', response_model=ResponseComment)
async def update_comment(
    com: CreateComment,
    id_comment: int,
    serv: CommentService = Depends(get_comment_service),
    user: User = Depends(get_current_user),
):
    try:
        comment = await serv.update_comment(id_comment, com.comment, user)
    except CommentNotFound:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND)

    return {
        'id': comment.id,
        'comment': comment.comment,
        'created_at': comment.created_at,
        'is_active': comment.is_active,
        'username': user.username,
    }


@router.delete('/delete')
async def delete_comment(
    id_comment: int,
    serv: CommentService = Depends(get_comment_service),
    user: User = Depends(get_current_user),
):
    try:
        await serv.delete_comment(id_comment, user)
    except CommentNotFound:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND)

    return {'message': 'Ok'}
