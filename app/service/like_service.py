import uuid
from ..db.models import User
from .exceptions.except_for_block import BlockNotFound
from .exceptions.except_for_like import LikeNotFound, LikeAlready
from ..repositories.block_repo import BlockOfTextRepository
from ..repositories.like_repo import LikeRepositories

class LikeService:
    def __init__(self, like_repo: LikeRepositories, block_repo: BlockOfTextRepository):
        self.like_repo=like_repo
        self.block_repo=block_repo

    async def add_like(self,block_id: uuid.UUID, user: User):
        block = await self.block_repo.get_one_block(block_id)

        if not block:
            raise BlockNotFound

        like = await self.like_repo.get_like(block_id, user.id)

        if like:
            raise LikeAlready

        await self.like_repo.create_like(block_id, user.id)

    async def remove_like(self,block_id: uuid.UUID, user: User):
        block = await self.block_repo.get_one_block(block_id)

        if not block:
            raise BlockNotFound

        like = await self.like_repo.get_like(block_id, user.id)

        if not like:
            raise LikeNotFound

        await self.like_repo.delete_like(block_id, user.id)

    async def get_total_like(self, block_id: uuid.UUID):
        block = await self.block_repo.get_one_block(block_id)

        if not block:
            raise BlockNotFound

        return await self.like_repo.total_like(block_id)