from sqlalchemy import Boolean
from datetime import datetime
from sqlalchemy import String
from sqlalchemy.orm import mapped_column
from sqlalchemy.orm import Mapped
from database import Base
from sqlalchemy import BigInteger, CheckConstraint, DateTime, ForeignKey, Index, Integer, String, UniqueConstraint, func
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
     silver_grams: Mapped[int] = mapped_column(
         Integer, default=0, server_default="0", nullable=False
     )
     gold_grams: Mapped[int] = mapped_column(
         Integer, default=0, server_default="0", nullable=False
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
         CheckConstraint(
             "gold_grams >= 0",
             name="ck_users_gold_grams_non_negative",
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
    # Smallest holding a user may cash out for this metal, in whole grams.
    min_cashout_grams: Mapped[int] = mapped_column(
        Integer, default=0, server_default="0", nullable=False
    )
    description: Mapped[str | None] = mapped_column(String(255))
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )

    prices: Mapped[list["PriceHistory"]] = relationship(back_populates="product")

    __table_args__ = (
        CheckConstraint(
            "min_cashout_grams >= 0",
            name="ck_products_min_cashout_non_negative",
        ),
    )


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
    # Whole grams: the app buys and sells in gram units only.
    grams: Mapped[int] = mapped_column(Integer, nullable=False)
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


class VaultSale(Base):
    """A user selling metal back to the vault.

    The wallet credit and the matching `wallet_transactions` row are written in
    the same transaction as this record.
    """

    __tablename__ = "vault_sales"

    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True
    )
    product_id: Mapped[int] = mapped_column(ForeignKey("products.id"), nullable=False)
    grams: Mapped[int] = mapped_column(Integer, nullable=False)
    amount_paisa: Mapped[int] = mapped_column(BigInteger, nullable=False)
    price_per_gram_paisa: Mapped[int] = mapped_column(BigInteger, nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )

    user: Mapped["User"] = relationship()
    product: Mapped["Product"] = relationship()

    __table_args__ = (
        CheckConstraint("grams > 0", name="ck_vault_sales_grams_positive"),
        CheckConstraint("amount_paisa > 0", name="ck_vault_sales_amount_positive"),
        CheckConstraint(
            "price_per_gram_paisa > 0",
            name="ck_vault_sales_price_positive",
        ),
    )


class SavingsGoal(Base):
    """A user's target weight for one metal.

    Progress is not stored here: it is derived from the cached metal balance on
    `users`, so a purchase moves the goal automatically.
    """

    __tablename__ = "savings_goals"

    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True
    )
    product_id: Mapped[int] = mapped_column(ForeignKey("products.id"), nullable=False)
    target_grams: Mapped[int] = mapped_column(Integer, nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )

    user: Mapped["User"] = relationship()
    product: Mapped["Product"] = relationship()

    __table_args__ = (
        # One active goal per user per metal keeps the "keep buying until..."
        # experience unambiguous.
        UniqueConstraint(
            "user_id",
            "product_id",
            name="uix_savings_goals_user_product",
        ),
        CheckConstraint(
            "target_grams > 0",
            name="ck_savings_goals_target_grams_positive",
        ),
    )


class WalletTransaction(Base):
    """Append-only wallet ledger.

    `users.balance_paisa` is a cached total; this table explains how it got
    there. Amounts are signed: credits are positive, debits are negative.
    """

    __tablename__ = "wallet_transactions"

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True)
    user_id: Mapped[int] = mapped_column(
        ForeignKey("users.id", ondelete="RESTRICT"), nullable=False
    )
    type: Mapped[str] = mapped_column(String(32), nullable=False)
    amount_paisa: Mapped[int] = mapped_column(BigInteger, nullable=False)
    balance_after_paisa: Mapped[int] = mapped_column(BigInteger, nullable=False)
    # Optional pointer to the row that caused this movement.
    reference_type: Mapped[str | None] = mapped_column(String(32))
    reference_id: Mapped[int | None] = mapped_column(BigInteger)
    description: Mapped[str | None] = mapped_column(String(255))
    # Unique per user so a retried top-up cannot credit twice.
    idempotency_key: Mapped[str | None] = mapped_column(String(128))
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )

    user: Mapped["User"] = relationship()

    __table_args__ = (
        CheckConstraint(
            "amount_paisa <> 0",
            name="ck_wallet_transactions_amount_non_zero",
        ),
        CheckConstraint(
            "balance_after_paisa >= 0",
            name="ck_wallet_transactions_balance_after_non_negative",
        ),
        CheckConstraint(
            "type IN ("
            "'demo_credit', 'admin_credit', 'deposit', "
            "'silver_purchase', 'silver_sale', "
            "'gold_purchase', 'gold_sale', 'refund', "
            "'opening_balance', 'reversal'"
            ")",
            name="ck_wallet_transactions_type",
        ),
        UniqueConstraint(
            "user_id",
            "idempotency_key",
            name="uix_wallet_transactions_user_idempotency",
        ),
        Index("ix_wallet_transactions_user_created", "user_id", "created_at"),
        Index(
            "ix_wallet_transactions_reference",
            "reference_type",
            "reference_id",
        ),
    )
