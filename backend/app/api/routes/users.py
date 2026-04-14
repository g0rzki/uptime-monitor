from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel, field_validator
from app.db.session import get_db
from app.api.deps import get_current_user, require_non_demo
from app.models.user import User
from app.core.security import hash_password, verify_password

router = APIRouter(prefix="/users", tags=["users"])


class ChangePasswordRequest(BaseModel):
    current_password: str
    new_password: str

    @field_validator("new_password")
    @classmethod
    def validate_length(cls, v: str) -> str:
        if len(v) < 8:
            raise ValueError("Password must be at least 8 characters")
        return v


class DeleteAccountRequest(BaseModel):
    password: str


@router.patch("/me/password", status_code=status.HTTP_200_OK)
def change_password(
    body: ChangePasswordRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_non_demo),
):
    """
    Zmiana hasła zalogowanego użytkownika.
    Wymaga podania aktualnego hasła — weryfikacja przed zmianą.
    Zablokowane dla konta demo.
    """
    if not verify_password(body.current_password, current_user.password):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Current password is incorrect"
        )
    current_user.password = hash_password(body.new_password)
    db.commit()
    return {"message": "Password changed"}


@router.delete("/me", status_code=status.HTTP_204_NO_CONTENT)
def delete_account(
    body: DeleteAccountRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_non_demo),
):
    """
    Trwałe usunięcie konta użytkownika.
    Wymaga potwierdzenia hasłem. Cascade delete usuwa monitory,
    historię checków i alerty. Zablokowane dla konta demo.
    """
    if not verify_password(body.password, current_user.password):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Password is incorrect"
        )
    db.delete(current_user)
    db.commit()