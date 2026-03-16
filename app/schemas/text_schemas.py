from pydantic import BaseModel, Field
from datetime import datetime
from uuid import UUID

class CreateBlock(BaseModel):
    title: str = Field(max_length=50, min_length=1)
    text: str

class ResponseBlock(CreateBlock):
    id: UUID
    url_block: str
    created_at: datetime