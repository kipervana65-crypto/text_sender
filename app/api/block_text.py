from fastapi import APIRouter, Depends, HTTPException, Query, status
from ..db.models import User
from ..core.dependencies import get_current_user
from ..schemas.text_schemas import CreateBlock, ResponseBlock
import uuid
from ..service.block_service import BlockOfTextService
from ..core.dependencies import get_post_service

router = APIRouter()

@router.post('/create_block', response_model=ResponseBlock)
async def crete_block(block: CreateBlock, serv: BlockOfTextService = Depends(get_post_service), user: User = Depends(get_current_user)):
    post = await serv.crete_block_for_user(user, block)

    return post

@router.get('/text_blocks', response_model=list[ResponseBlock])
async def get_blocks(user: User = Depends(get_current_user), serv: BlockOfTextService = Depends(get_post_service)):
    r = await serv.get_blocks_by_user_id(user)
    return r


@router.get('/text_block', response_model=ResponseBlock)
async def get_block_by_query(uuid: uuid.UUID = Query(), serv: BlockOfTextService = Depends(get_post_service)):
    result = await serv.get_block_by_block_id(uuid)

    if not result:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND)

    return result

@router.get('/text_block/{uuid}', response_model=ResponseBlock)
async def get_block(uuid: uuid.UUID, serv: BlockOfTextService = Depends(get_post_service)):
    result = await serv.get_block_by_block_id(uuid)

    if not result:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND)

    return result

@router.put('/update_block', response_model=ResponseBlock)
async def update_block(id: uuid.UUID, block: CreateBlock, serv: BlockOfTextService = Depends(get_post_service), user: User = Depends(get_current_user)):
    r = await serv.get_block_by_block_id(id, user=user)
    if not r:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND)

    await serv.update_block_for_user(id, user, block)
    return r


@router.delete('/delete_block')
async def delete_block(id: uuid.UUID, serv: BlockOfTextService = Depends(get_post_service), user: User = Depends(get_current_user)):
    r = await serv.get_block_by_block_id(id, user=user)

    if not r:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND)

    await serv.delete_block_for_user(id, user)

    return {'message': 'Ok'}