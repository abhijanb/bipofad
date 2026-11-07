from datetime import datetime
from decimal import Decimal
from typing import Literal

from pydantic import BaseModel, Field, field_validator

# Money is kept as integer paisa, matching models.PriceHistory.price, so the
# API never has to round rupee amounts.
MIN_COLLECTION_PAISA = 1_000  # Rs 10
MAX_COLLECTION_PAISA = 10_000_000  # Rs 1,00,000

ProductCode = Literal["SILVER", "GOLD"]


class VaultCollection(BaseModel):
    id: int
    amount_paisa: int
    # Serialized as a decimal string (e.g. "1.234") so clients never lose
    # milligram precision to binary floating point.
    grams: Decimal
    price_per_gram_paisa: int
    collected_at: datetime


class VaultSale(BaseModel):
    id: int
    grams: Decimal
    amount_paisa: int
    price_per_gram_paisa: int
    sold_at: datetime


class VaultSummary(BaseModel):
    product: ProductCode = "SILVER"
    balance_paisa: int = 0
    balance_grams: Decimal = Decimal("0")
    price_per_gram_paisa: int | None = None
    price_updated_at: datetime | None = None
    value_paisa: int = 0
    min_cashout_grams: Decimal = Decimal("0")
    currency: str = "NPR"
    collections: list[VaultCollection] = Field(default_factory=list)
    sales: list[VaultSale] = Field(default_factory=list)


class PricePoint(BaseModel):
    price_per_gram_paisa: int
    source: str | None = None
    recorded_at: datetime


class SetPriceRequest(BaseModel):
    product: ProductCode = "SILVER"
    price_per_gram_paisa: int = Field(
        ...,
        gt=0,
        description="Price in paisa per gram.",
    )
    source: str | None = Field(default=None, max_length=50)


class CollectRequest(BaseModel):
    product: ProductCode = "SILVER"
    amount_paisa: int = Field(
        ...,
        ge=MIN_COLLECTION_PAISA,
        le=MAX_COLLECTION_PAISA,
        description="Amount to collect, in paisa. Rs 10 minimum.",
    )
    idempotency_key: str = Field(
        ...,
        min_length=1,
        max_length=128,
        description="Client-generated key that makes retries safe.",
    )


class CollectResponse(BaseModel):
    message: str
    collection: VaultCollection
    balance_grams: Decimal
    balance_paisa: int


class SellRequest(BaseModel):
    product: ProductCode = "SILVER"
    grams: Decimal = Field(
        ...,
        gt=0,
        max_digits=14,
        decimal_places=3,
        description="Amount of metal to cash out, in grams.",
    )
    idempotency_key: str = Field(
        ...,
        min_length=1,
        max_length=128,
        description="Client-generated key that makes retries safe.",
    )

    @field_validator("grams")
    @classmethod
    def validate_grams_precision(cls, value: Decimal) -> Decimal:
        if value != value.quantize(Decimal("0.001")):
            raise ValueError("Use at most three decimal places")
        return value


class SellResponse(BaseModel):
    message: str
    sale: VaultSale
    balance_grams: Decimal
    balance_paisa: int
