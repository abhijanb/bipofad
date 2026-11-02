from sqlalchemy import Boolean
from datetime import datetime
from decimal import Decimal
from sqlalchemy import String
from sqlalchemy.orm import mapped_column
from sqlalchemy.orm import Mapped
from database import Base
from sqlalchemy import BigInteger, CheckConstraint, DateTime, ForeignKey, Integer, Numeric, String, UniqueConstraint, func
from sqlalchemy.orm import Mapped, mapped_column, relationship
from database import Base
class User(Base):
     __tablename__ = "users"
 
     id: Mapped[int] = mapped_column(primary_key=True)
     username: Mapped[str] = mapped_column(String(50), unique=True, nullable=False)
     email: Mapped[str] = mapped_column(String(100), unique=True, nullable=False)
     hashed_password: Mapped[str] = mapped_column(String(255), nullable=False)
     is_active: Mapped[bool] = mapped_column(Boolean, default=True)
     is_superuser: Mapped[bool] = mapped_column(Boolean, default=False)
     # Wallet money available to buy metals, in paisa.
     balance_paisa: Mapped[int] = mapped_column(
         BigInteger, default=0, server_default="0", nullable=False
     )
     silver_grams: Mapped[Decimal] = mapped_column(
         Numeric(14, 3), default=Decimal("0"), server_default="0", nullable=False
     )
     failed_login_attempts: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
     locked_until: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
     created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
     updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

     __table_args__ = (
         CheckConstraint(
             "balance_paisa >= 0",
             name="ck_users_balance_paisa_non_negative",
         ),
         CheckConstraint(
             "silver_grams >= 0",
             name="ck_users_silver_grams_non_negative",
         ),
     )


class RefreshToken(Base):
    __tablename__ = "refresh_tokens"

    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True
    )
    # Only a SHA-256 hash of the token is stored, never the token itself.
    token_hash: Mapped[str] = mapped_column(String(64), unique=True, nullable=False, index=True)
    expires_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    revoked_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )

    user: Mapped["User"] = relationship()

class Product(Base):
    __tablename__ = "products"

    id: Mapped[int] = mapped_column(primary_key=True)
    code: Mapped[str] = mapped_column(String(20), unique=True, nullable=False)  # "SILVER", "GOLD"
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    unit: Mapped[str] = mapped_column(String(20), default="gram", nullable=False)
    description: Mapped[str | None] = mapped_column(String(255))
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )

    prices: Mapped[list["PriceHistory"]] = relationship(back_populates="product")


class PriceHistory(Base):
    __tablename__ = "price_history"

    id: Mapped[int] = mapped_column(primary_key=True)
    product_id: Mapped[int] = mapped_column(ForeignKey("products.id"), nullable=False)
    price: Mapped[int] = mapped_column(BigInteger, nullable=False)  # paisa per gram
    source: Mapped[str | None] = mapped_column(String(50))          # where the price came from
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    product: Mapped["Product"] = relationship(back_populates="prices")

    __table_args__ = (
        UniqueConstraint("product_id", "created_at", name="uix_product_created_at"),
    )


class VaultCollection(Base):
    __tablename__ = "vault_collections"

    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True
    )
    product_id: Mapped[int] = mapped_column(ForeignKey("products.id"), nullable=False)
    amount_paisa: Mapped[int] = mapped_column(BigInteger, nullable=False)
    # Three decimal places: the smallest unit the app exposes is 1 mg.
    grams: Mapped[Decimal] = mapped_column(Numeric(14, 3), nullable=False)
    price_per_gram_paisa: Mapped[int] = mapped_column(BigInteger, nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )

    user: Mapped["User"] = relationship()
    product: Mapped["Product"] = relationship()

    __table_args__ = (
        CheckConstraint("amount_paisa > 0", name="ck_vault_collections_amount_positive"),
        CheckConstraint("grams > 0", name="ck_vault_collections_grams_positive"),
        CheckConstraint(
            "price_per_gram_paisa > 0",
            name="ck_vault_collections_price_positive",
        ),
    )