from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, and_
from datetime import datetime, timedelta

from app.core.database import get_db
from app.core.security import get_current_user
from app.core.config import settings
from app.models.models import Vote, VoteType, Blogger, BloggerStatus, PromoCode, User
from app.schemas.schemas import VoteCreate, VoteResponse

router = APIRouter(prefix="/votes", tags=["Voting"])


@router.post("", status_code=201, summary="Cast a vote")
async def cast_vote(
    data: VoteCreate,
    request: Request,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Cast a vote for a blogger. Handles free, VIP, coin, and promo votes."""
    user_id = int(current_user["sub"])
    ip_address = request.client.host if request.client else None
    device_id = request.headers.get("X-Device-ID")

    # Get user
    user_result = await db.execute(select(User).where(User.id == user_id))
    user = user_result.scalar_one_or_none()
    if not user or user.is_blocked:
        raise HTTPException(status_code=403, detail="Account blocked")

    # Get blogger
    blogger_result = await db.execute(
        select(Blogger).where(
            Blogger.id == data.blogger_id,
            Blogger.status == BloggerStatus.APPROVED,
            Blogger.is_active == True,
        )
    )
    blogger = blogger_result.scalar_one_or_none()
    if not blogger:
        raise HTTPException(status_code=404, detail="Blogger not found or not approved")

    # === Anti-fraud checks (ONLY for free votes) ===

    if data.vote_type == "free":
        # 1. Check daily free vote limit
        today_start = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)
        free_today = await db.execute(
            select(func.count()).where(
                Vote.user_id == user_id,
                Vote.vote_type == VoteType.FREE,
                Vote.created_at >= today_start,
                Vote.is_cancelled == False,
            )
        )
        if free_today.scalar() >= settings.DAILY_VOTE_LIMIT:
            raise HTTPException(
                status_code=429,
                detail=f"Daily free vote limit ({settings.DAILY_VOTE_LIMIT}) reached"
            )

        # 2. IP rate limiting (free votes only)
        if ip_address:
            ip_votes = await db.execute(
                select(func.count()).where(
                    Vote.ip_address == ip_address,
                    Vote.vote_type == VoteType.FREE,
                    Vote.created_at >= today_start,
                    Vote.is_cancelled == False,
                )
            )
            if ip_votes.scalar() >= settings.IP_VOTE_LIMIT:
                raise HTTPException(status_code=429, detail="IP vote limit reached")

        # 3. Device fingerprint check (free votes only)
        if device_id:
            device_accounts = await db.execute(
                select(func.count(func.distinct(Vote.user_id))).where(
                    Vote.device_id == device_id,
                )
            )
            if device_accounts.scalar() >= settings.DEVICE_LIMIT:
                raise HTTPException(status_code=429, detail="Device limit reached")

    # Handle specific vote types
    payment_id = None

    if data.vote_type == "promo":
        if not data.promo_code:
            raise HTTPException(status_code=400, detail="Promo code required")

        promo_result = await db.execute(
            select(PromoCode).where(
                PromoCode.code == data.promo_code,
                PromoCode.is_active == True,
            )
        )
        promo = promo_result.scalar_one_or_none()
        if not promo:
            raise HTTPException(status_code=400, detail="Invalid promo code")
        if promo.used_count >= promo.max_uses:
            raise HTTPException(status_code=400, detail="Promo code fully used")
        if promo.expires_at and promo.expires_at < datetime.utcnow():
            raise HTTPException(status_code=400, detail="Promo code expired")

        promo.used_count += 1

    elif data.vote_type == "coin":
        coin_cost = 10  # configurable
        if user.coins < coin_cost:
            raise HTTPException(status_code=400, detail="Not enough coins")
        user.coins -= coin_cost

    elif data.vote_type == "vip":
        # Payment processing would happen here
        # For now, mark as needing payment
        pass

    # Create vote
    vote_type_enum = {
        "free": VoteType.FREE,
        "vip": VoteType.VIP,
        "coin": VoteType.COIN,
        "promo": VoteType.PROMO,
    }.get(data.vote_type)

    if not vote_type_enum:
        raise HTTPException(status_code=400, detail="Invalid vote type")

    vote = Vote(
        user_id=user_id,
        blogger_id=data.blogger_id,
        vote_type=vote_type_enum,
        country=user.country,
        ip_address=ip_address,
        device_id=device_id,
        payment_id=payment_id,
    )
    db.add(vote)

    # Update blogger vote count
    blogger.total_votes += 1

    await db.flush()

    return {
        "message": "Vote cast successfully",
        "vote_id": vote.id,
        "blogger_id": blogger.id,
        "vote_type": data.vote_type,
        "total_votes": blogger.total_votes,
    }


@router.get("/my-votes", summary="Get user's vote history")
async def my_votes(
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Get the current user's voting history with blogger details."""
    user_id = int(current_user["sub"])
    result = await db.execute(
        select(Vote)
        .where(Vote.user_id == user_id)
        .order_by(Vote.created_at.desc())
        .limit(50)
    )
    votes = result.scalars().all()

    # Enrich with blogger data
    enriched = []
    for vote in votes:
        blogger_result = await db.execute(
            select(Blogger).where(Blogger.id == vote.blogger_id)
        )
        blogger = blogger_result.scalar_one_or_none()
        enriched.append({
            "id": vote.id,
            "blogger_id": vote.blogger_id,
            "blogger_name": blogger.full_name if blogger else "Удалён",
            "blogger_nickname": blogger.nickname if blogger else "",
            "blogger_avatar": blogger.avatar_url if blogger else None,
            "vote_type": vote.vote_type.value,
            "is_cancelled": vote.is_cancelled,
            "created_at": vote.created_at.isoformat() if vote.created_at else None,
        })
    return enriched


@router.get("/can-vote/{blogger_id}", summary="Check if user can vote")
async def can_vote(
    blogger_id: int,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Check if the current user can cast a free vote for a blogger today."""
    user_id = int(current_user["sub"])
    today_start = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)

    result = await db.execute(
        select(func.count()).where(
            Vote.user_id == user_id,
            Vote.vote_type == VoteType.FREE,
            Vote.created_at >= today_start,
            Vote.is_cancelled == False,
        )
    )
    free_votes_today = result.scalar()

    return {
        "can_vote_free": free_votes_today < settings.DAILY_VOTE_LIMIT,
        "free_votes_used": free_votes_today,
        "daily_limit": settings.DAILY_VOTE_LIMIT,
    }
