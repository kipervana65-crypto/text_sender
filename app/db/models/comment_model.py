from ..session import Base
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy import ForeignKey, Text, DateTime, func
from datetime import datetime
import uuid

class Comment(Base):
    __tablename__ = 'comments'

    id: Mapped[int] = mapped_column(primary_key=True)
    comment: Mapped[str] = mapped_column(Text)
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())
    is_active: Mapped[bool] = mapped_column(default=True)
    block_id: Mapped[uuid.UUID] = mapped_column(ForeignKey('blocks_of_text.id'))
    user_id: Mapped[int] = mapped_column(ForeignKey('users.id'))

    block: Mapped['BlockOfText'] = relationship(back_populates='comments')
    user: Mapped['User'] = relationship(back_populates='comments')