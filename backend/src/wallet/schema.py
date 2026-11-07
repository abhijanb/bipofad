from datetime import datetime

from pydantic import BaseModel, EmailStr, Field

MAX_ADMIN_CREDIT_PAISA = 100_000_000  # Rs 10,00,000


class WalletTransactionOut(BaseModel):
    id: int
    type: str
    amount_paisa: int
    balance_after_paisa: int
    reference_type: str | None = None
    reference_id: int | None = None
    description: str | None = None
    created_at: datetime


class AdminCreditRequest(BaseModel):
    user_email: EmailStr
    amount_paisa: int = Field(
        ...,
        gt=0,
        le=MAX_ADMIN_CREDIT_PAISA,
        description="Amount to credit, in paisa.",
    )
    description: str | None = Field(default=None, max_length=255)
    idempotency_key: str = Field(..., min_length=1, max_length=128)


class AdminCreditResponse(BaseModel):
    message: str
    transaction: WalletTransactionOut
    balance_paisa: int
