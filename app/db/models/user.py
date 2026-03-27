from sqlalchemy import Column, Integer, String, Boolean, DateTime
from sqlalchemy.orm import relationship, Mapped
from sqlalchemy.sql import func
from .like_model import like_model
from ..session import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    username = Column(String, unique=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    blocks: Mapped[list['BlockOfText']] = relationship(back_populates='user')
    comments: Mapped[list['Comment']] = relationship(back_populates='user')
    block_likes: Mapped[list['BlockOfText']] = relationship(secondary=like_model, back_populates='user_likes')