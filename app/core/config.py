from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    DATABASE_URL: str
    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7
    SMTP_SERVER: str
    SMTP_PORT: int
    SMTP_USER: str
    SMTP_PASSWORD: str

    model_config = SettingsConfigDict(
        env_file=".env",  # Pydantic будет искать файл .env
        env_file_encoding="utf-8"  # Указываем кодировку файла
    )


@lru_cache()  # Декоратор кэширует результат первого вызова
def get_settings() -> Settings:
    print("Загрузка настроек...")  # Это сообщение появится только один раз при первом запуске
    return Settings()

settings = get_settings()