from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    database_url: str = "postgresql+asyncpg://user:pass@localhost:5432/abhijanfastapi"
    debug: bool = False

    # Uploads
    upload_dir: str = "uploads"
    upload_max_bytes: int = 5 * 1024 * 1024  # 5MB global default
    upload_allowed_content_types: list[str] = [
        "image/jpeg",
        "image/png",
        "image/webp",
    ]
    upload_allowed_extensions: list[str] = [".jpg", ".jpeg", ".png", ".webp"]
    model_config = SettingsConfigDict(env_file=".env", env_prefix="")


settings = Settings()