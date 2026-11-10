from typing import cast

from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio.session import AsyncSession

from models import Product, SavingsGoal, User
from src.goals.query import goal_to_schema
from src.goals.schema import (
    CreateSavingsGoalRequest,
    DeleteSavingsGoalResponse,
    SavingsGoalResponse,
    UpdateSavingsGoalRequest,
)
from src.vault.query import get_product, product_label
from src.vault.schema import ProductCode


async def _owned_goal(
    db: AsyncSession,
    user_id: int,
    goal_id: int,
) -> tuple[SavingsGoal, ProductCode] | None:
    """Load a goal only if it belongs to the given user."""
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
    return goal, cast(ProductCode, code)


async def create_goal(
    db: AsyncSession,
    user: User,
    data: CreateSavingsGoalRequest,
) -> SavingsGoalResponse:
    """Create the one active goal a user may have per metal."""
    product = await get_product(db, data.product)
    if product is None:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"{product_label(data.product)} is not available right now",
        )

    existing = await db.execute(
        select(SavingsGoal.id).where(
            SavingsGoal.user_id == user.id,
            SavingsGoal.product_id == product.id,
        )
    )
    if existing.scalar_one_or_none() is not None:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"You already have a {product_label(data.product).lower()} goal",
        )

    goal = SavingsGoal(
        user_id=user.id,
        product_id=product.id,
        target_grams=data.target_grams,
    )
    db.add(goal)
    try:
        await db.flush()
    except IntegrityError:
        # A concurrent request created the same goal first.
        await db.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"You already have a {product_label(data.product).lower()} goal",
        ) from None

    await db.refresh(goal)
    return SavingsGoalResponse(
        message=f"{product_label(data.product)} goal created",
        goal=await goal_to_schema(db, goal, data.product),
    )


async def update_goal(
    db: AsyncSession,
    user: User,
    goal_id: int,
    data: UpdateSavingsGoalRequest,
) -> SavingsGoalResponse:
    """Change the target weight of an existing goal."""
    row = await _owned_goal(db, user.id, goal_id)
    if row is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Goal not found",
        )

    goal, product = row
    goal.target_grams = data.target_grams
    await db.flush()
    await db.refresh(goal)

    return SavingsGoalResponse(
        message=f"{product_label(product)} goal updated",
        goal=await goal_to_schema(db, goal, product),
    )


async def delete_goal(
    db: AsyncSession,
    user: User,
    goal_id: int,
) -> DeleteSavingsGoalResponse:
    """Delete a goal owned by the signed-in user."""
    row = await _owned_goal(db, user.id, goal_id)
    if row is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Goal not found",
        )

    goal, product = row
    await db.delete(goal)
    await db.flush()

    return DeleteSavingsGoalResponse(
        message=f"{product_label(product)} goal deleted",
    )
