import uuid

from sqlalchemy import select, update, Sequence
from sqlalchemy.ext.asyncio import AsyncSession
from ..db.models import BlockOfText, User

class BlockOfTextRepository:
    def __init__(self, session: AsyncSession):
        self.session=session

    async def create_block(self, block: dict, user: User) -> BlockOfText:
        post = BlockOfText(**block)
        post.user = user
        self.session.add(post)
        await self.session.flush()
        post.url_block = f'http://153.80.251.221:80/blocks/text_block/{post.id}'
        await self.session.commit()

        return post

    async def get_list_blocks(self, user: User) -> Sequence[BlockOfText]:
        stmt = await self.session.scalars(select(BlockOfText).where(BlockOfText.user_id == user.id,
                                                               BlockOfText.is_active == True))
        return stmt.all()

    async def get_one_block(self, uuid: uuid.UUID, user: User|None) -> BlockOfText:
        filters=[BlockOfText.id == uuid, BlockOfText.is_active == True]

        if not user is None:
            filters.append(BlockOfText.user_id==user.id)

        stmt = select(BlockOfText).where(*filters)
        result = (await self.session.execute(stmt)).scalar_one_or_none()

        return result

    async def update_block(self, block: dict, user: User, uuid: uuid.UUID):
        await self.session.execute(update(BlockOfText)
                              .values(**block)
                              .where(BlockOfText.id == uuid,
                                     BlockOfText.is_active == True,
                                     BlockOfText.user_id == user.id))
        await self.session.commit()


    async def delete_block(self, user: User, uuid: uuid.UUID):
        await self.session.execute(update(BlockOfText)
                              .values(is_active=False)
                              .where(BlockOfText.id == uuid,
                                     BlockOfText.is_active == True,
                                     BlockOfText.user_id == user.id))
        await self.session.commit()