from datetime import datetime

from pydantic import BaseModel, Field

from src.vault.schema import ProductCode


class SavingsGoalOut(BaseModel):
    """A goal plus the progress derived from the user's current holding."""

    id: int
    product: ProductCode
    target_grams: int
    balance_grams: int
    # 0-100, floored, and capped so a completed goal never shows >100%.
    progress_percent: int
    remaining_grams: int
    is_complete: bool
    value_paisa: int
    price_per_gram_paisa: int | None = None
    created_at: datetime
    updated_at: datetime


class CreateSavingsGoalRequest(BaseModel):
    product: ProductCode = "SILVER"
    target_grams: int = Field(
        ...,
        ge=1,
        description="Target holding, in whole grams.",
    )


class UpdateSavingsGoalRequest(BaseModel):
    target_grams: int = Field(
        ...,
        ge=1,
        description="New target holding, in whole grams.",
    )


class SavingsGoalResponse(BaseModel):
    message: str
    goal: SavingsGoalOut


class DeleteSavingsGoalResponse(BaseModel):
    message: str
