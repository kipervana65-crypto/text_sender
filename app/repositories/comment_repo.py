import uuid

from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from ..db.models import BlockOfText, Comment, User


class CommentRepository:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def get_active_block(self, block_id: uuid.UUID) -> BlockOfText | None:
        stmt = await self.session.execute(
            select(BlockOfText).where(
                BlockOfText.id == block_id,
                BlockOfText.is_active == True,
            )
        )
        return stmt.scalar_one_or_none()

    async def get_active_comment(self, comment_id: int) -> Comment | None:
        stmt = await self.session.execute(
            select(Comment).where(
                Comment.id == comment_id,
                Comment.is_active == True,
            )
        )
        return stmt.scalar_one_or_none()

    async def get_user_comment(self, comment_id: int, user_id: int) -> Comment | None:
        stmt = await self.session.execute(
            select(Comment).where(
                Comment.id == comment_id,
                Comment.is_active == True,
                Comment.user_id == user_id,
            )
        )
        return stmt.scalar_one_or_none()

    async def create_comment(
        self,
        text: str,
        block_id: uuid.UUID,
        user_id: int,
        parent_id: int | None = None,
    ) -> Comment:
        comment = Comment(
            comment=text,
            block_id=block_id,
            user_id=user_id,
            parent_id=parent_id,
        )
        self.session.add(comment)
        await self.session.commit()
        await self.session.refresh(comment)
        return comment

    async def get_comments(
        self,
        block_id: uuid.UUID,
        parent_id: int | None,
        page: int,
        page_size: int,
    ) -> tuple[list[dict], int]:
        filters = [Comment.is_active == True]

        if parent_id is not None:
            filters.append(Comment.parent_id == parent_id)
        else:
            filters.append(Comment.block_id == block_id)
            filters.append(Comment.parent_id.is_(None))

        total = await self.session.scalar(select(func.count(Comment.id)).where(*filters))

        stmt = await self.session.execute(
            select(
                Comment.id.label("id"),
                Comment.comment.label("comment"),
                Comment.created_at.label("created_at"),
                Comment.is_active.label("is_active"),
                User.username.label("username"),
            )
            .join(User, Comment.user_id == User.id)
            .where(*filters)
            .order_by(Comment.id)
            .offset((page - 1) * page_size)
            .limit(page_size)
        )

        return stmt.mappings().all(), total or 0

    async def update_comment(self, comment: Comment, text: str) -> Comment:
        comment.comment = text
        await self.session.commit()
        await self.session.refresh(comment)
        return comment

    async def deactivate_comment(self, comment: Comment) -> None:
        comment.is_active = False
        await self.session.commit()
