import uuid
from datetime import datetime
from pydantic import BaseModel, Field


class CreateComment(BaseModel):
    comment: str


class ResponseComment(CreateComment):
    id: int
    created_at: datetime
    is_active: bool
    username: str

class ResponseCommentAndUUID(CreateComment):
    block_id: uuid.UUID
    user_id: int
    id: int
    created_at: datetime
    is_active: bool


class CommentList(BaseModel):
    items: list[ResponseComment] = Field(description="Комментарии для текущей страницы")
    total: int = Field(ge=0, description="Общее количество комментариев")
    page: int = Field(ge=1, description="Номер текущей страницы")
    page_size: int = Field(ge=1, description="Количество элементов на странице")

