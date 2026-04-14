import uuid

from sqlalchemy import select, insert, delete, func

from sqlalchemy.ext.asyncio import AsyncSession

from ..db.models import like_model

class LikeRepositories:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def get_like(self, block_id: uuid.UUID, user_id: int):
        stmt = await self.session.execute(select(like_model).where(like_model.c.block_id==block_id,
                                                                   like_model.c.user_id==user_id))
        result = stmt.scalar_one_or_none()
        return result

    async def create_like(self, block_id: uuid.UUID, user_id: int) -> None:
         await self.session.execute(
             insert(like_model)
             .values(user_id=user_id, block_id=block_id)
         )
         await self.session.commit()

    async def delete_like(self, block_id: uuid.UUID, user_id: int):
        await self.session.execute(delete(like_model).where((like_model.c.user_id==user_id) &
                                                       (like_model.c.block_id==block_id)))
        await self.session.commit()

    async def total_like(self, block_id: uuid.UUID) -> int:
        total = await self.session.scalar(
            select(func.count(like_model.c.block_id))
                   .where(like_model.c.block_id==block_id)
        )
        return total