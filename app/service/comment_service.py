import uuid

from ..db.models import User, Comment
from ..repositories.comment_repo import CommentRepository
from ..repositories.user_repo import UserRepositories
from ..service.email_service import EmailSender
from .exceptions.except_for_block import BlockNotFound
from .exceptions.except_for_comment import (
    CommentNotFound,
    ParentCommentNotFound,
    ParentCommentNotBelongToBlock,
)
from ..celery_task import send_notification_email


class CommentService:
    def __init__(self, comment_repo: CommentRepository,
                 user_repo: UserRepositories):
        self.comment_repo = comment_repo
        self.user_repo = user_repo
        self.email_service = EmailSender()

    async def create_comment(
        self,
        block_id: uuid.UUID,
        text: str,
        user: User,
        parent_id: int | None = None,
    ) -> Comment:
        block = await self.comment_repo.get_active_block(block_id)
        if not block:
            raise BlockNotFound

        if parent_id is not None:
            parent_comment = await self.comment_repo.get_active_comment(parent_id)
            if not parent_comment:
                raise ParentCommentNotFound

            if parent_comment.block_id != block_id:
                raise ParentCommentNotBelongToBlock

        comment = await self.comment_repo.create_comment(text, block_id, user.id, parent_id)
        user_by_block = await self.user_repo.get_user_by_block_id(block_id)
        if user.id!=user_by_block.id:
            send_notification_email.delay(str(user_by_block.email), comment.id)
        return comment

    async def get_comments(
        self,
        block_id: uuid.UUID,
        parent_id: int | None,
        page: int,
        page_size: int,
    ) -> tuple[list[dict], int]:
        block = await self.comment_repo.get_active_block(block_id)
        if not block:
            raise BlockNotFound

        if parent_id is not None:
            parent_comment = await self.comment_repo.get_active_comment(parent_id)
            if not parent_comment:
                raise ParentCommentNotFound

        return await self.comment_repo.get_comments(block_id, parent_id, page, page_size)

    async def get_one_comment(self, comment_id: int) -> Comment:
        comment = await self.comment_repo.get_active_comment(comment_id)
        if not comment:
            raise CommentNotFound
        return comment

    async def update_comment(self, comment_id: int, text: str, user: User) -> Comment:
        comment = await self.comment_repo.get_user_comment(comment_id, user.id)
        if not comment:
            raise CommentNotFound

        return await self.comment_repo.update_comment(comment, text)

    async def delete_comment(self, comment_id: int, user: User) -> None:
        comment = await self.comment_repo.get_user_comment(comment_id, user.id)
        if not comment:
            raise CommentNotFound

        await self.comment_repo.deactivate_comment(comment)
