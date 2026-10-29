from sqlalchemy import Boolean
from datetime import datetime
from sqlalchemy import String
from sqlalchemy.orm import mapped_column
from sqlalchemy.orm import Mapped
from database import Base
from sqlalchemy import BigInteger, DateTime, ForeignKey, String, UniqueConstraint, func
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
     created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
     updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

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