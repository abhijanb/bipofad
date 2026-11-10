from typing import Annotated

from fastapi import APIRouter, Body, Depends, HTTPException, Path, status
from sqlalchemy.ext.asyncio.session import AsyncSession

from database import get_db
from models import User
from src.auth.dependencies import get_current_user
from src.goals.mutation import create_goal, delete_goal, update_goal
from src.goals.query import get_goal, list_goals
from src.goals.schema import (
    CreateSavingsGoalRequest,
    DeleteSavingsGoalResponse,
    SavingsGoalOut,
    SavingsGoalResponse,
    UpdateSavingsGoalRequest,
)

goals_router = APIRouter(prefix="/goals", tags=["goals"])


@goals_router.get("", response_model=list[SavingsGoalOut], status_code=200)
async def list_savings_goals(
    user: Annotated[User, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
) -> list[SavingsGoalOut]:
    """Return every savings goal for the signed-in user.

    Progress is derived from the current metal balance, so it is always fresh.
    """
    return await list_goals(db, user.id)


@goals_router.get(
    "/{goal_id}",
    response_model=SavingsGoalOut,
    status_code=200,
)
async def get_savings_goal(
    goal_id: Annotated[int, Path(ge=1)],
    user: Annotated[User, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
) -> SavingsGoalOut:
    """Return one savings goal owned by the signed-in user."""
    goal = await get_goal(db, user.id, goal_id)
    if goal is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Goal not found",
        )
    return goal


@goals_router.post("", response_model=SavingsGoalResponse, status_code=201)
async def create_savings_goal(
    body: Annotated[CreateSavingsGoalRequest, Body()],
    user: Annotated[User, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
) -> SavingsGoalResponse:
    """Create a goal for one metal. One goal per user per metal is allowed."""
    return await create_goal(db, user, body)


@goals_router.patch(
    "/{goal_id}",
    response_model=SavingsGoalResponse,
    status_code=200,
)
async def update_savings_goal(
    goal_id: Annotated[int, Path(ge=1)],
    body: Annotated[UpdateSavingsGoalRequest, Body()],
    user: Annotated[User, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
) -> SavingsGoalResponse:
    """Update the target weight of a goal."""
    return await update_goal(db, user, goal_id, body)


@goals_router.delete(
    "/{goal_id}",
    response_model=DeleteSavingsGoalResponse,
    status_code=200,
)
async def delete_savings_goal(
    goal_id: Annotated[int, Path(ge=1)],
    user: Annotated[User, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
) -> DeleteSavingsGoalResponse:
    """Delete a goal owned by the signed-in user."""
    return await delete_goal(db, user, goal_id)
