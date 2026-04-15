from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from ..db.models import User, BlockOfText

class UserRepositories:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def get_user_by_block_id(self, block_id) -> User:
        stmt = await self.session.execute(
                select(User)
                .join(BlockOfText, BlockOfText.user_id==User.id)
                .where(BlockOfText.id==block_id)
        )
        user = stmt.scalar_one_or_none()
        return user