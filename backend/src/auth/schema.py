from pydantic import ConfigDict
from pydantic import Field
from pydantic import EmailStr
from pydantic import BaseModel
from pydantic import field_validator

class RegisterRequest(BaseModel):
    username: str = Field(..., min_length=3, max_length=50, pattern=r"^[A-Za-z0-9_]+$")
    email: EmailStr
    password: str = Field(..., min_length=6, max_length=72)
    @field_validator("email")
    @classmethod
    def normalize_email(cls, v: str) -> str:
        return v.lower()

    @field_validator("password")
    @classmethod
    def validate_password_bytes(cls, v: str) -> str:
        if len(v.encode("utf-8")) > 72:
            raise ValueError("Password must be at most 72 bytes")
        return v

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
    user: AuthUser | None = None

class LoginRequest(BaseModel):
    username: str = Field(..., min_length=3, max_length=50, pattern=r"^[A-Za-z0-9_]+$")
    password: str = Field(..., min_length=6, max_length=72)