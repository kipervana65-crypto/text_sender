import uuid

from ..db.models import User, Comment
from ..repositories.comment_repo import CommentRepository
from .exceptions.except_for_block import BlockNotFound
from .exceptions.except_for_comment import (
    CommentNotFound,
    ParentCommentNotFound,
    ParentCommentNotBelongToBlock,
)


class CommentService:
    def __init__(self, repo: CommentRepository):
        self.repo = repo

    async def create_comment(
        self,
        block_id: uuid.UUID,
        text: str,
        user: User,
        parent_id: int | None = None,
    ) -> Comment:
        block = await self.repo.get_active_block(block_id)
        if not block:
            raise BlockNotFound

        if parent_id is not None:
            parent_comment = await self.repo.get_active_comment(parent_id)
            if not parent_comment:
                raise ParentCommentNotFound

            if parent_comment.block_id != block_id:
                raise ParentCommentNotBelongToBlock

        return await self.repo.create_comment(text, block_id, user.id, parent_id)

    async def get_comments(
        self,
        block_id: uuid.UUID,
        parent_id: int | None,
        page: int,
        page_size: int,
    ) -> tuple[list[dict], int]:
        block = await self.repo.get_active_block(block_id)
        if not block:
            raise BlockNotFound

        if parent_id is not None:
            parent_comment = await self.repo.get_active_comment(parent_id)
            if not parent_comment:
                raise ParentCommentNotFound

        return await self.repo.get_comments(block_id, parent_id, page, page_size)

    async def update_comment(self, comment_id: int, text: str, user: User) -> Comment:
        comment = await self.repo.get_user_comment(comment_id, user.id)
        if not comment:
            raise CommentNotFound

        return await self.repo.update_comment(comment, text)

    async def delete_comment(self, comment_id: int, user: User) -> None:
        comment = await self.repo.get_user_comment(comment_id, user.id)
        if not comment:
            raise CommentNotFound

        await self.repo.deactivate_comment(comment)
