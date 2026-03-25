from pydantic_settings import BaseSettings
from typing import Optional


class Settings(BaseSettings):
    # Application
    APP_NAME: str = "Blogger Awards API"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = True

    # Database
    DATABASE_URL: str = "postgresql+asyncpg://postgres:postgres@localhost:5432/blogger_awards"

    # Redis
    REDIS_URL: str = "redis://localhost:6379/0"

    # JWT
    SECRET_KEY: str = "your-secret-key-change-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 24 hours

    # SMS
    SMS_PROVIDER: str = "eskiz"
    SMS_API_KEY: str = ""
    SMS_API_URL: str = "https://notify.eskiz.uz/api"

    # Contest
    CONTEST_START_DATE: str = "2026-03-01T00:00:00"
    CONTEST_END_DATE: str = "2026-04-15T00:00:00"
    DAILY_VOTE_LIMIT: int = 1
    VIP_VOTE_PRICE: int = 10000

    # Security
    IP_VOTE_LIMIT: int = 10
    DEVICE_LIMIT: int = 3
    RATE_LIMIT_PER_MINUTE: int = 30

    # Default Admin
    ADMIN_USERNAME: str = "admin"
    ADMIN_PASSWORD: str = "admin123"

    # Payments
    PAYME_MERCHANT_ID: str = ""
    PAYME_SECRET_KEY: str = ""
    CLICK_SERVICE_ID: str = ""
    CLICK_SECRET_KEY: str = ""

    # Uploads
    UPLOAD_DIR: str = "uploads"
    MAX_FILE_SIZE: int = 5 * 1024 * 1024  # 5MB

    # CORS
    CORS_ORIGINS: list = ["http://localhost:3000", "http://localhost:3001"]

    class Config:
        env_file = ".env"
        case_sensitive = True


settings = Settings()
