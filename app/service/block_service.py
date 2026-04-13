import uuid

from sqlalchemy import Sequence
from ..repositories.block_repo import BlockOfTextRepository
from ..db.models.user import User
from ..schemas .text_schemas import CreateBlock
from ..db.models import BlockOfText

class BlockOfTextService:
    def __init__(self, repo: BlockOfTextRepository):
        self.repo=repo

    async def crete_block_for_user(self, user: User, block: CreateBlock) -> BlockOfText:
        return await self.repo.create_block(block.model_dump(), user)

    async def get_blocks_by_user_id(self, user: User) -> Sequence[BlockOfText]:
        return await self.repo.get_list_blocks(user)

    async def get_block_by_block_id(self, uuid: uuid.UUID, user: User|None = None) -> BlockOfText:
        result = await self.repo.get_one_block(uuid, user)

        return result

    async def update_block_for_user(self, uuid: uuid.UUID, user: User, block: CreateBlock):
        await self.repo.update_block(block.model_dump(), user, uuid)

    async def delete_block_for_user(self, uuid: uuid.UUID, user: User):

        await self.repo.delete_block(user, uuid)