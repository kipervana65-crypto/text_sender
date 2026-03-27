from sqlalchemy import Table, Column, ForeignKey
from ..session import Base

like_model=Table(
    'likes',
    Base.metadata,
    Column('user_id',ForeignKey('users.id'), primary_key=True),
    Column('block_id', ForeignKey('blocks_of_text.id'), primary_key=True)
)