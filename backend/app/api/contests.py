from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, desc, update
from typing import Optional, List
from datetime import datetime

from app.core.database import get_db
from app.models.models import (
    ContestSession, Winner, Blogger, Category, BloggerStatus
)

router = APIRouter(prefix="/contests", tags=["Contests"])


@router.get("/sessions", summary="Get all past contest sessions")
async def list_sessions(
    db: AsyncSession = Depends(get_db),
):
    """List all completed contest sessions."""
    result = await db.execute(
        select(ContestSession).order_by(desc(ContestSession.end_date))
    )
    sessions = result.scalars().all()
    return sessions


@router.get("/winners", summary="Get winners for all or specific session")
async def get_winners(
    session_id: Optional[int] = None,
    db: AsyncSession = Depends(get_db),
):
    """Get winners. If no session_id provided, returns winners of the latest completed session."""
    if not session_id:
        # Find latest completed session
        latest_res = await db.execute(
            select(ContestSession).where(ContestSession.status == "completed").order_by(desc(ContestSession.end_date)).limit(1)
        )
        latest_session = latest_res.scalar_one_or_none()
        if not latest_session:
            return []
        session_id = latest_session.id

    query = select(Winner).where(Winner.session_id == session_id).order_by(Winner.rank)
    result = await db.execute(query)
    winners = result.scalars().all()

    response = []
    for w in winners:
        # We need to load blogger and category details
        blogger_res = await db.execute(select(Blogger).where(Blogger.id == w.blogger_id))
        blogger = blogger_res.scalar_one_or_none()
        
        cat_res = await db.execute(select(Category).where(Category.id == w.category_id))
        category = cat_res.scalar_one_or_none()
        
        response.append({
            "id": w.id,
            "session_id": w.session_id,
            "blogger_id": w.blogger_id,
            "blogger_name": blogger.full_name if blogger else "Unknown",
            "blogger_nickname": blogger.nickname if blogger else "unknown",
            "blogger_avatar": blogger.avatar_url if blogger else None,
            "category_id": w.category_id,
            "category_name": category.name if category else "Unknown",
            "total_votes": w.total_votes,
            "rank": w.rank,
            "created_at": w.created_at,
        })

    return response
