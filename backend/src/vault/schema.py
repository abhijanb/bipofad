from datetime import datetime
from typing import Literal

from pydantic import BaseModel, Field

# Money is kept as integer paisa, matching models.PriceHistory.price, so the
# API never has to round rupee amounts.
MIN_COLLECTION_PAISA = 1_000  # Rs 10
MAX_COLLECTION_PAISA = 10_000_000  # Rs 1,00,000


class VaultCollection(BaseModel):
    id: int
    amount_paisa: int
    grams: float
    price_per_gram_paisa: int
    collected_at: datetime


class VaultSummary(BaseModel):
    product: Literal["SILVER"] = "SILVER"
    balance_paisa: int = 0
    balance_grams: float = 0.0
    price_per_gram_paisa: int | None = None
    value_paisa: int = 0
    currency: str = "NPR"
    collections: list[VaultCollection] = Field(default_factory=list)


class CollectSilverRequest(BaseModel):
    amount_paisa: int = Field(
        ...,
        ge=MIN_COLLECTION_PAISA,
        le=MAX_COLLECTION_PAISA,
        description="Amount to collect, in paisa. Rs 10 minimum.",
    )


class CollectSilverResponse(BaseModel):
    message: str
    collection: VaultCollection
    balance_grams: float
    balance_paisa: int
