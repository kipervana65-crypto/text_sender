from ..session import Base
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy import ForeignKey, Text, DateTime, String, func, UUID
from datetime import datetime
from .like_model import like_model
import uuid

class BlockOfText(Base):
    __tablename__ = 'blocks_of_text'

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,)
    title: Mapped[str] = mapped_column(String(50))
    text: Mapped[str] = mapped_column(Text)
    url_block: Mapped[str|None] = mapped_column(String(100))
    is_active: Mapped[bool] = mapped_column(default=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())
    user_id: Mapped[int] = mapped_column(ForeignKey('users.id'))

    user: Mapped['User'] = relationship(back_populates='blocks')
    comments: Mapped[list['Comment']] = relationship(back_populates='block')
    user_likes: Mapped[list['User']] = relationship(secondary=like_model, back_populates='block_likes')