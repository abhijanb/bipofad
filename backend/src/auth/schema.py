from typing import Annotated

from pydantic import AfterValidator
from pydantic import ConfigDict
from pydantic import Field
from pydantic import EmailStr
from pydantic import BaseModel
from pydantic import field_validator


def _validate_password_bytes(value: str) -> str:
    # bcrypt raises ValueError above 72 bytes, and max_length counts
    # characters, not UTF-8 bytes.
    if len(value.encode("utf-8")) > 72:
        raise ValueError("Password must be at most 72 bytes")
    return value


Password = Annotated[str, AfterValidator(_validate_password_bytes)]


class RegisterRequest(BaseModel):
    username: str = Field(..., min_length=3, max_length=50, pattern=r"^[A-Za-z0-9_]+$")
    email: EmailStr
    password: Password = Field(..., min_length=6, max_length=72)
    @field_validator("email")
    @classmethod
    def normalize_email(cls, v: str) -> str:
        return v.lower()

class RegisterResponse(BaseModel):
    message: str

class UsernameConflictResponse(BaseModel):
    detail: str
    suggested_usernames: list[str]

class EmailConflictResponse(BaseModel):
    detail: str
    suggested_email: list[str]

class AuthUser(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    username: str
    email: EmailStr
    is_superuser: bool = Field(default=False, alias="isSuperuser")


class LoginResponse(BaseModel):
    message: str
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    user: AuthUser | None = None


class RefreshRequest(BaseModel):
    refresh_token: str = Field(..., min_length=1)


class LogoutRequest(BaseModel):
    refresh_token: str = Field(..., min_length=1)


class MeResponse(BaseModel):
    message: str
    user: AuthUser

class LoginRequest(BaseModel):
    email: EmailStr
    password: Password = Field(..., min_length=6, max_length=72)

    @field_validator("email")
    @classmethod
    def normalize_email(cls, v: str) -> str:
        return v.lower()