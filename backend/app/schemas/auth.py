from pydantic import BaseModel, EmailStr, field_validator
from typing import Annotated
from pydantic import Field


class RegisterRequest(BaseModel):
    email: EmailStr
    password: Annotated[str, Field(min_length=8, description="Minimum 8 znaków, litera i cyfra")]

    @field_validator("password")
    @classmethod
    def validate_password_strength(cls, v: str) -> str:
        """Hasło musi zawierać co najmniej jedną literę i jedną cyfrę."""
        if not any(c.isalpha() for c in v):
            raise ValueError("Hasło musi zawierać co najmniej jedną literę")
        if not any(c.isdigit() for c in v):
            raise ValueError("Hasło musi zawierać co najmniej jedną cyfrę")
        return v


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class AuthResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"