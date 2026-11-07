import json
from pathlib import Path
from typing import Annotated, Literal

from pydantic import Field, field_validator, model_validator
from pydantic_settings import BaseSettings, NoDecode, SettingsConfigDict

BASE_DIR = Path(__file__).resolve().parent

DEFAULT_SECRET_KEY = "dev-only-secret-key-change-me-in-production"
PLACEHOLDER_SECRET_KEYS = {
    DEFAULT_SECRET_KEY,
    "replace-with-a-long-random-string",
}
MIN_SECRET_KEY_BYTES = 32

DEFAULT_CORS_ORIGINS = [
    "http://localhost:3000",
    "http://localhost:5173",
    "http://127.0.0.1:3000",
    "http://127.0.0.1:5173",
]


class Settings(BaseSettings):
    environment: Literal["development", "test", "production"] = "development"
    database_url: str = "postgresql+asyncpg://postgres:abhijanb@localhost:5432/hbc"
    debug: bool = False
    # Comma-separated list of allowed browser origins, or a JSON array.
    cors_origins: Annotated[list[str], NoDecode] = Field(
        default_factory=lambda: list(DEFAULT_CORS_ORIGINS)
    )
    # Uploads
    upload_dir: str = "uploads"
    upload_max_bytes: int = 5 * 1024 * 1024  # 5MB global default
    upload_allowed_content_types: list[str] = [
        "image/jpeg",
        "image/png",
        "image/webp",
    ]
    upload_allowed_extensions: list[str] = [".jpg", ".jpeg", ".png", ".webp"]
    # Auth / JWT
    secret_key: str = DEFAULT_SECRET_KEY
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 60
    refresh_token_expire_days: int = 30
    # Login protection
    login_max_attempts: int = 5
    login_lockout_minutes: int = 15
    # Demo
    # Starting wallet balance in paisa, for demos only. 0 disables it.
    demo_balance_paisa: int = 0
    model_config = SettingsConfigDict(env_file=BASE_DIR / ".env", env_prefix="")

    @field_validator("cors_origins", mode="before")
    @classmethod
    def parse_cors_origins(cls, value: object) -> list[str]:
        """Accept `a,b` or `["a","b"]` from the environment."""
        if isinstance(value, str):
            raw = value.strip()
            if not raw:
                raise ValueError("CORS_ORIGINS must contain at least one origin")
            if raw.startswith("["):
                try:
                    parsed = json.loads(raw)
                except json.JSONDecodeError as exc:
                    raise ValueError(
                        "CORS_ORIGINS must be a JSON array or comma-separated list"
                    ) from exc
                if not isinstance(parsed, list):
                    raise ValueError(
                        "CORS_ORIGINS must be a JSON array or comma-separated list"
                    )
                value = parsed
            else:
                value = raw.split(",")

        if not isinstance(value, (list, tuple, set)):
            raise ValueError("CORS_ORIGINS must be a list of origins")

        origins = [
            str(origin).strip().rstrip("/")
            for origin in value
            if str(origin).strip()
        ]
        if not origins:
            raise ValueError("CORS_ORIGINS must contain at least one origin")
        return origins

    @model_validator(mode="after")
    def validate_production_settings(self) -> "Settings":
        """Refuse unsafe defaults when running in production."""
        if self.environment != "production":
            return self

        if self.secret_key in PLACEHOLDER_SECRET_KEYS:
            raise ValueError(
                "SECRET_KEY must be set to a unique value in production"
            )
        if not self.secret_key.strip():
            raise ValueError("SECRET_KEY must not be blank in production")
        if len(self.secret_key.encode("utf-8")) < MIN_SECRET_KEY_BYTES:
            raise ValueError(
                f"SECRET_KEY must be at least {MIN_SECRET_KEY_BYTES} bytes in production"
            )
        if "*" in self.cors_origins:
            raise ValueError(
                "CORS_ORIGINS cannot contain '*' in production because credentials are allowed"
            )
        if self.debug:
            raise ValueError("DEBUG must be false in production")
        return self


settings = Settings()
