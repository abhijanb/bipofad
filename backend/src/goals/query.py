from typing import cast

from sqlalchemy import select
from sqlalchemy.ext.asyncio.session import AsyncSession

from models import Product, SavingsGoal
from src.goals.schema import SavingsGoalOut
from src.vault.query import get_latest_price, get_vault_balances
from src.vault.schema import ProductCode


def progress_percent(balance_grams: int, target_grams: int) -> int:
    """Return progress as a whole percentage, floored and capped at 100."""
    if target_grams <= 0:
        return 0
    return max(0, min(100, (balance_grams * 100) // target_grams))


async def goal_to_schema(
    db: AsyncSession,
    goal: SavingsGoal,
    product: ProductCode,
) -> SavingsGoalOut:
    """Attach the live balance and price to a stored goal.

    Progress is derived, never persisted, so a purchase or price change is
    reflected the next time the goal is read.
    """
    balance_grams, _ = await get_vault_balances(db, goal.user_id, product)
    price_row = await get_latest_price(db, product)
    price = price_row.price if price_row and price_row.price > 0 else None

    target_grams = int(goal.target_grams)
    remaining_grams = max(0, target_grams - balance_grams)
    value_paisa = balance_grams * price if price is not None else 0

    return SavingsGoalOut(
        id=goal.id,
        product=product,
        target_grams=target_grams,
        balance_grams=balance_grams,
        progress_percent=progress_percent(balance_grams, target_grams),
        remaining_grams=remaining_grams,
        is_complete=balance_grams >= target_grams,
        value_paisa=value_paisa,
        price_per_gram_paisa=price,
        created_at=goal.created_at,
        updated_at=goal.updated_at,
    )


async def list_goals(
    db: AsyncSession,
    user_id: int,
) -> list[SavingsGoalOut]:
    """Return every goal for one user, with derived progress."""
    result = await db.execute(
        select(SavingsGoal, Product.code)
        .join(Product, Product.id == SavingsGoal.product_id)
        .where(SavingsGoal.user_id == user_id)
        .order_by(Product.code)
    )
    return [
        await goal_to_schema(db, goal, cast(ProductCode, code))
        for goal, code in result.all()
    ]


async def get_goal(
    db: AsyncSession,
    user_id: int,
    goal_id: int,
) -> SavingsGoalOut | None:
    """Return one goal for one user, or None if it does not belong to them."""
    result = await db.execute(
        select(SavingsGoal, Product.code)
        .join(Product, Product.id == SavingsGoal.product_id)
        .where(
            SavingsGoal.id == goal_id,
            SavingsGoal.user_id == user_id,
        )
    )
    row = result.first()
    if row is None:
        return None
    goal, code = row
    return await goal_to_schema(db, goal, cast(ProductCode, code))
