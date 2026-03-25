from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, desc, update, delete
from typing import Optional
from datetime import datetime

from app.core.database import get_db
from app.core.security import get_admin_user
from app.models.models import (
    User, Blogger, BloggerStatus, Vote, VoteType, Category,
    Payment, PaymentStatus, PromoCode, Sponsor, Banner, AdminLog,
    ContestSettings as ContestSettingsModel
)

router = APIRouter(prefix="/admin", tags=["Admin"])


def serialize_datetime(dt):
    """Serialize datetime to ISO string."""
    if isinstance(dt, datetime):
        return dt.isoformat()
    return dt


@router.get("/dashboard", summary="Admin dashboard stats")
async def dashboard(
    admin: dict = Depends(get_admin_user),
    db: AsyncSession = Depends(get_db),
):
    """Get dashboard statistics for the admin panel."""
    total_users = (await db.execute(select(func.count(User.id)))).scalar() or 0
    total_bloggers = (await db.execute(
        select(func.count(Blogger.id)).where(Blogger.status == BloggerStatus.APPROVED)
    )).scalar() or 0
    total_votes = (await db.execute(
        select(func.count(Vote.id)).where(Vote.is_cancelled == False)
    )).scalar() or 0
    total_revenue = (await db.execute(
        select(func.coalesce(func.sum(Payment.amount), 0)).where(
            Payment.status == PaymentStatus.COMPLETED
        )
    )).scalar() or 0
    pending_bloggers = (await db.execute(
        select(func.count(Blogger.id)).where(Blogger.status == BloggerStatus.PENDING)
    )).scalar() or 0

    return {
        "total_users": total_users,
        "total_bloggers": total_bloggers,
        "total_votes": total_votes,
        "total_revenue": total_revenue,
        "pending_bloggers": pending_bloggers,
    }


@router.get("/bloggers", summary="List all bloggers for admin")
async def admin_list_bloggers(
    status: Optional[str] = None,
    search: Optional[str] = None,
    page: int = Query(1, ge=1),
    per_page: int = Query(50, ge=1, le=100),
    admin: dict = Depends(get_admin_user),
    db: AsyncSession = Depends(get_db),
):
    """List all bloggers for admin management (including pending)."""
    query = select(Blogger)

    if status:
        try:
            status_enum = BloggerStatus(status)
            query = query.where(Blogger.status == status_enum)
        except ValueError:
            pass

    if search:
        query = query.where(
            Blogger.full_name.ilike(f"%{search}%") |
            Blogger.nickname.ilike(f"%{search}%")
        )

    count_query = select(func.count()).select_from(query.subquery())
    total = (await db.execute(count_query)).scalar() or 0

    query = query.order_by(desc(Blogger.created_at))
    query = query.offset((page - 1) * per_page).limit(per_page)
    result = await db.execute(query)
    bloggers = result.scalars().all()

    return {
        "bloggers": [
            {
                "id": b.id,
                "full_name": b.full_name,
                "nickname": b.nickname,
                "phone": b.phone or "",
                "country": b.country or "UZ",
                "status": b.status.value if b.status else "pending",
                "total_votes": b.total_votes or 0,
                "category_id": b.category_id,
                "avatar_url": b.avatar_url,
                "created_at": serialize_datetime(b.created_at),
            }
            for b in bloggers
        ],
        "total": total,
        "page": page,
        "per_page": per_page,
    }


@router.put("/bloggers/{blogger_id}/approve", summary="Approve blogger")
async def approve_blogger(
    blogger_id: int,
    admin: dict = Depends(get_admin_user),
    db: AsyncSession = Depends(get_db),
):
    """Approve a pending blogger application."""
    result = await db.execute(select(Blogger).where(Blogger.id == blogger_id))
    blogger = result.scalar_one_or_none()
    if not blogger:
        raise HTTPException(status_code=404, detail="Blogger not found")

    blogger.status = BloggerStatus.APPROVED
    blogger.is_active = True

    log = AdminLog(
        admin_id=int(admin["sub"]),
        action="approve_blogger",
        target_type="blogger",
        target_id=blogger_id,
    )
    db.add(log)

    return {"message": "Blogger approved", "id": blogger_id, "status": "approved"}


@router.put("/bloggers/{blogger_id}/reject", summary="Reject blogger")
async def reject_blogger(
    blogger_id: int,
    admin: dict = Depends(get_admin_user),
    db: AsyncSession = Depends(get_db),
):
    """Reject a pending blogger application."""
    result = await db.execute(select(Blogger).where(Blogger.id == blogger_id))
    blogger = result.scalar_one_or_none()
    if not blogger:
        raise HTTPException(status_code=404, detail="Blogger not found")

    blogger.status = BloggerStatus.REJECTED
    blogger.is_active = False

    log = AdminLog(
        admin_id=int(admin["sub"]),
        action="reject_blogger",
        target_type="blogger",
        target_id=blogger_id,
    )
    db.add(log)

    return {"message": "Blogger rejected", "id": blogger_id, "status": "rejected"}


@router.put("/bloggers/{blogger_id}/block", summary="Block blogger")
async def block_blogger(
    blogger_id: int,
    admin: dict = Depends(get_admin_user),
    db: AsyncSession = Depends(get_db),
):
    """Block an approved blogger."""
    result = await db.execute(select(Blogger).where(Blogger.id == blogger_id))
    blogger = result.scalar_one_or_none()
    if not blogger:
        raise HTTPException(status_code=404, detail="Blogger not found")

    blogger.status = BloggerStatus.BLOCKED
    blogger.is_active = False

    log = AdminLog(
        admin_id=int(admin["sub"]),
        action="block_blogger",
        target_type="blogger",
        target_id=blogger_id,
    )
    db.add(log)

    return {"message": "Blogger blocked", "id": blogger_id}


@router.delete("/bloggers/{blogger_id}", summary="Delete blogger")
async def delete_blogger(
    blogger_id: int,
    admin: dict = Depends(get_admin_user),
    db: AsyncSession = Depends(get_db),
):
    """Delete a blogger entirely."""
    result = await db.execute(select(Blogger).where(Blogger.id == blogger_id))
    blogger = result.scalar_one_or_none()
    if not blogger:
        raise HTTPException(status_code=404, detail="Blogger not found")

    await db.delete(blogger)

    log = AdminLog(
        admin_id=int(admin["sub"]),
        action="delete_blogger",
        target_type="blogger",
        target_id=blogger_id,
    )
    db.add(log)

    return {"message": "Blogger deleted", "id": blogger_id}


@router.delete("/votes/{vote_id}", summary="Cancel vote")
async def cancel_vote(
    vote_id: int,
    admin: dict = Depends(get_admin_user),
    db: AsyncSession = Depends(get_db),
):
    """Cancel a specific vote (anti-fraud)."""
    result = await db.execute(select(Vote).where(Vote.id == vote_id))
    vote = result.scalar_one_or_none()
    if not vote:
        raise HTTPException(status_code=404, detail="Vote not found")

    vote.is_cancelled = True

    blogger_result = await db.execute(select(Blogger).where(Blogger.id == vote.blogger_id))
    blogger = blogger_result.scalar_one_or_none()
    if blogger and blogger.total_votes > 0:
        blogger.total_votes -= 1

    log = AdminLog(
        admin_id=int(admin["sub"]),
        action="cancel_vote",
        target_type="vote",
        target_id=vote_id,
        details={"blogger_id": vote.blogger_id, "user_id": vote.user_id},
    )
    db.add(log)

    return {"message": "Vote cancelled"}


@router.get("/users", summary="List users for admin")
async def admin_list_users(
    search: Optional[str] = None,
    blocked: Optional[bool] = None,
    page: int = Query(1, ge=1),
    per_page: int = Query(50, ge=1, le=100),
    admin: dict = Depends(get_admin_user),
    db: AsyncSession = Depends(get_db),
):
    """List all users for admin management."""
    query = select(User)

    if search:
        query = query.where(User.phone.ilike(f"%{search}%"))
    if blocked is not None:
        query = query.where(User.is_blocked == blocked)

    count_query = select(func.count()).select_from(query.subquery())
    total = (await db.execute(count_query)).scalar() or 0

    query = query.order_by(desc(User.created_at))
    query = query.offset((page - 1) * per_page).limit(per_page)
    result = await db.execute(query)
    users = result.scalars().all()

    return {
        "users": [
            {
                "id": u.id,
                "phone": u.phone,
                "role": u.role.value if u.role else "user",
                "is_blocked": u.is_blocked,
                "coins": u.coins or 0,
                "created_at": serialize_datetime(u.created_at),
            }
            for u in users
        ],
        "total": total,
        "page": page,
    }


@router.put("/users/{user_id}/block", summary="Block user")
async def block_user(
    user_id: int,
    admin: dict = Depends(get_admin_user),
    db: AsyncSession = Depends(get_db),
):
    """Block a user account."""
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    user.is_blocked = True

    log = AdminLog(
        admin_id=int(admin["sub"]),
        action="block_user",
        target_type="user",
        target_id=user_id,
    )
    db.add(log)

    return {"message": "User blocked"}


@router.put("/users/{user_id}/unblock", summary="Unblock user")
async def unblock_user(
    user_id: int,
    admin: dict = Depends(get_admin_user),
    db: AsyncSession = Depends(get_db),
):
    """Unblock a user account."""
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    user.is_blocked = False

    log = AdminLog(
        admin_id=int(admin["sub"]),
        action="unblock_user",
        target_type="user",
        target_id=user_id,
    )
    db.add(log)

    return {"message": "User unblocked"}


@router.get("/votes", summary="List all votes with filters")
async def list_votes(
    voter_ip: Optional[str] = None,
    country: Optional[str] = None,
    vote_type: Optional[str] = None,
    blogger_id: Optional[int] = None,
    page: int = Query(1, ge=1),
    per_page: int = Query(50, ge=1, le=100),
    admin: dict = Depends(get_admin_user),
    db: AsyncSession = Depends(get_db),
):
    """List all votes with filtering options for fraud detection."""
    query = select(Vote).order_by(desc(Vote.created_at))

    if voter_ip:
        query = query.where(Vote.ip_address == voter_ip)
    if country:
        query = query.where(Vote.country == country)
    if vote_type:
        query = query.where(Vote.vote_type == vote_type)
    if blogger_id:
        query = query.where(Vote.blogger_id == blogger_id)

    count_query = select(func.count()).select_from(query.subquery())
    total = (await db.execute(count_query)).scalar() or 0

    query = query.offset((page - 1) * per_page).limit(per_page)
    result = await db.execute(query)
    votes = result.scalars().all()

    return {
        "votes": [
            {
                "id": v.id,
                "user_id": v.user_id,
                "blogger_id": v.blogger_id,
                "vote_type": v.vote_type.value if v.vote_type else "free",
                "ip_address": v.ip_address or "",
                "country": v.country or "",
                "device_id": v.device_id or "",
                "is_cancelled": v.is_cancelled,
                "created_at": serialize_datetime(v.created_at),
            }
            for v in votes
        ],
        "total": total,
        "page": page,
    }


@router.get("/payments", summary="List payments")
async def list_payments(
    status: Optional[str] = None,
    page: int = Query(1, ge=1),
    per_page: int = Query(50, ge=1, le=100),
    admin: dict = Depends(get_admin_user),
    db: AsyncSession = Depends(get_db),
):
    """List all payment transactions."""
    query = select(Payment).order_by(desc(Payment.created_at))
    if status:
        query = query.where(Payment.status == status)

    count_query = select(func.count()).select_from(query.subquery())
    total = (await db.execute(count_query)).scalar() or 0

    query = query.offset((page - 1) * per_page).limit(per_page)
    result = await db.execute(query)
    payments = result.scalars().all()

    return {
        "payments": [
            {
                "id": p.id,
                "user_id": p.user_id,
                "amount": float(p.amount) if p.amount else 0,
                "method": p.method.value if p.method else "",
                "status": p.status.value if p.status else "",
                "created_at": serialize_datetime(p.created_at),
            }
            for p in payments
        ],
        "total": total,
    }


@router.get("/logs", summary="Admin action logs")
async def admin_logs(
    page: int = Query(1, ge=1),
    per_page: int = Query(50, ge=1, le=100),
    admin: dict = Depends(get_admin_user),
    db: AsyncSession = Depends(get_db),
):
    """Get admin action audit logs."""
    query = select(AdminLog).order_by(desc(AdminLog.created_at))

    count_query = select(func.count()).select_from(query.subquery())
    total = (await db.execute(count_query)).scalar() or 0

    query = query.offset((page - 1) * per_page).limit(per_page)
    result = await db.execute(query)
    logs = result.scalars().all()

    return {
        "logs": [
            {
                "id": l.id,
                "admin_id": l.admin_id,
                "action": l.action,
                "target_type": l.target_type,
                "target_id": l.target_id,
                "created_at": serialize_datetime(l.created_at),
            }
            for l in logs
        ],
        "total": total,
    }


@router.get("/settings", summary="Get contest settings")
async def get_settings(
    admin: dict = Depends(get_admin_user),
    db: AsyncSession = Depends(get_db),
):
    """Get current contest settings."""
    result = await db.execute(select(ContestSettingsModel).where(ContestSettingsModel.id == 1))
    settings = result.scalar_one_or_none()

    if not settings:
        settings = ContestSettingsModel(id=1)
        db.add(settings)
        await db.flush()

    return {
        "contest_active": settings.contest_active,
        "start_date": settings.start_date,
        "end_date": settings.end_date,
        "daily_vote_limit": settings.daily_vote_limit,
        "vip_vote_price": settings.vip_vote_price,
        "ip_limit": settings.ip_limit,
        "device_limit": settings.device_limit,
        "rate_limit_per_minute": settings.rate_limit_per_minute,
        "sms_enabled": settings.sms_enabled,
        "sms_provider": settings.sms_provider,
        "bot_protection": settings.bot_protection,
        "updated_at": serialize_datetime(settings.updated_at),
    }


@router.put("/settings", summary="Update contest settings")
async def update_settings(
    data: dict,
    admin: dict = Depends(get_admin_user),
    db: AsyncSession = Depends(get_db),
):
    """Update contest settings."""
    result = await db.execute(select(ContestSettingsModel).where(ContestSettingsModel.id == 1))
    settings = result.scalar_one_or_none()

    if not settings:
        settings = ContestSettingsModel(id=1)
        db.add(settings)
        await db.flush()

    allowed_fields = [
        "contest_active", "start_date", "end_date", "daily_vote_limit",
        "vip_vote_price", "ip_limit", "device_limit", "rate_limit_per_minute",
        "sms_enabled", "sms_provider", "bot_protection",
    ]

    changes = {}
    for field in allowed_fields:
        if field in data:
            old_val = getattr(settings, field)
            setattr(settings, field, data[field])
            changes[field] = {"old": old_val, "new": data[field]}

    log = AdminLog(
        admin_id=int(admin["sub"]),
        action="update_settings",
        target_type="settings",
        target_id=1,
        details=changes,
    )
    db.add(log)

    return {"message": "Settings updated", "changes": changes}
