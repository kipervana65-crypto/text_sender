from fastapi import APIRouter, Depends, status, HTTPException
from ..db.models import User
from ..core.dependencies import get_like_service, get_current_user
from uuid import UUID
from ..service.like_service import LikeService
from ..service.exceptions.except_for_like import LikeAlready, LikeNotFound
from ..service.exceptions.except_for_block import BlockNotFound

router = APIRouter()

@router.post('/add_like')
async def add_like(block_id: UUID,
                   user: User = Depends(get_current_user),
                   serv: LikeService = Depends(get_like_service)):
    try:
        await serv.add_like(
            user=user,
            block_id=block_id
        )
    except BlockNotFound:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND)
    except LikeAlready:
        raise HTTPException(status_code=400, detail="Already liked")

    return {'massage': 'like add'}


@router.delete('/delete_like')
async def delete_like(block_id: UUID,
                      user: User = Depends(get_current_user),
                      serv: LikeService = Depends(get_like_service)):
    try:
        await serv.remove_like(
            user=user,
            block_id=block_id
        )
    except BlockNotFound:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND)
    except LikeNotFound:
        raise HTTPException(status_code=404, detail="not found liked")

    return {'massage': 'like delete'}

@router.get('/get_total_like')
async def get_total_like(id_block: UUID,
                         serv: LikeService = Depends(get_like_service)):
    try:
        like_total = await serv.get_total_like(id_block)
    except BlockNotFound:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND)
    return {'like_total': like_total}