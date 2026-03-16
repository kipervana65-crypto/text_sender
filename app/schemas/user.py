from pydantic import BaseModel, EmailStr, Field
from datetime import datetime

# Базовая схема с общими полями
class UserBase(BaseModel):
    email: EmailStr

# Схема для создания пользователя (Input DTO)
class UserCreate(UserBase):
    password: str
    username: str = Field(pattern=r'^[A-Za-z0-9_]{1,32}$')

# Схема для ответа (Output DTO) — клиент получает только «чистый» JSON
class UserResponse(UserBase):
    id: int
    is_active: bool
    created_at: datetime
    username: str

    # Настройка для Pydantic v2 — позволяет читать данные прямо из объектов SQLAlchemy
    class Config:
        from_attributes = True

# Дополнительная схема для обновления пользователя (если нужна частичная модификация)
class UserUpdate(UserBase):
    password: str | None = None
    is_active: bool | None = None
