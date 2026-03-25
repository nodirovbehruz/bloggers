from fastapi import APIRouter, Depends, HTTPException, Query, UploadFile, File
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, desc, asc
from typing import Optional
import os
import uuid

from app.core.database import get_db
from app.core.security import get_current_user
from app.core.config import settings
from app.models.models import Blogger, BloggerStatus, Category
from app.schemas.schemas import BloggerCreate, BloggerResponse, BloggerListResponse

router = APIRouter(prefix="/bloggers", tags=["Bloggers"])

# Ensure bloggers upload dir exists
BLOGGERS_UPLOAD_DIR = os.path.join(settings.UPLOAD_DIR, "bloggers")
os.makedirs(BLOGGERS_UPLOAD_DIR, exist_ok=True)


@router.get("", summary="List bloggers")
async def list_bloggers(
    category: Optional[str] = None,
    country: Optional[str] = None,
    search: Optional[str] = None,
    sort: str = Query("votes", enum=["votes", "name", "newest"]),
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
):
    """List approved bloggers with filtering, search, and sorting."""
    query = select(Blogger).where(
        Blogger.status == BloggerStatus.APPROVED,
        Blogger.is_active == True,
    )

    if category:
        query = query.join(Category).where(Category.slug == category)
    if country:
        query = query.where(Blogger.country == country)
    if search:
        query = query.where(
            Blogger.full_name.ilike(f"%{search}%") |
            Blogger.nickname.ilike(f"%{search}%")
        )

    # Count total
    count_query = select(func.count()).select_from(query.subquery())
    total_result = await db.execute(count_query)
    total = total_result.scalar()

    # Sort
    if sort == "votes":
        query = query.order_by(desc(Blogger.total_votes))
    elif sort == "name":
        query = query.order_by(asc(Blogger.full_name))
    elif sort == "newest":
        query = query.order_by(desc(Blogger.created_at))

    # Paginate
    query = query.offset((page - 1) * per_page).limit(per_page)

    result = await db.execute(query)
    bloggers = result.scalars().all()

    return {
        "bloggers": bloggers,
        "total": total,
        "page": page,
        "per_page": per_page,
    }


@router.get("/leaderboard/top", summary="Get leaderboard")
async def get_leaderboard(
    category: Optional[str] = None,
    country: Optional[str] = None,
    limit: int = Query(50, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
):
    """Get the top bloggers leaderboard."""
    query = select(Blogger).where(
        Blogger.status == BloggerStatus.APPROVED,
        Blogger.is_active == True,
    )

    if category:
        query = query.join(Category).where(Category.slug == category)
    if country:
        query = query.where(Blogger.country == country)

    query = query.order_by(desc(Blogger.total_votes)).limit(limit)

    result = await db.execute(query)
    bloggers = result.scalars().all()

    leaderboard = []
    for i, blogger in enumerate(bloggers):
        leaderboard.append({
            "rank": i + 1,
            "blogger_id": blogger.id,
            "full_name": blogger.full_name,
            "nickname": blogger.nickname,
            "avatar_url": blogger.avatar_url,
            "category_name": "",
            "total_votes": blogger.total_votes,
        })

    return leaderboard


@router.get("/{blogger_id}", summary="Get blogger details")
async def get_blogger(blogger_id: int, db: AsyncSession = Depends(get_db)):
    """Get detailed information about a specific blogger."""
    result = await db.execute(
        select(Blogger).where(Blogger.id == blogger_id)
    )
    blogger = result.scalar_one_or_none()
    if not blogger:
        raise HTTPException(status_code=404, detail="Blogger not found")

    # Get rank
    rank_query = select(func.count()).where(
        Blogger.total_votes > blogger.total_votes,
        Blogger.status == BloggerStatus.APPROVED,
    )
    rank_result = await db.execute(rank_query)
    rank = rank_result.scalar() + 1

    return {
        **blogger.__dict__,
        "rank": rank,
    }


@router.post("", status_code=201, summary="Register as blogger")
async def register_blogger(
    data: BloggerCreate,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Submit a blogger registration application. Requires authentication."""
    user_id = int(current_user["sub"])

    # Check if user already has an application
    existing_app = await db.execute(
        select(Blogger).where(Blogger.user_id == user_id)
    )
    existing_blogger = existing_app.scalar_one_or_none()

    if existing_blogger:
        # If rejected or pending, allow resubmission by updating
        if existing_blogger.status in (BloggerStatus.REJECTED, BloggerStatus.PENDING):
            existing_blogger.full_name = data.full_name
            existing_blogger.nickname = data.nickname
            existing_blogger.phone = data.phone
            existing_blogger.country = data.country
            existing_blogger.category_id = data.category_id
            existing_blogger.description = data.description
            existing_blogger.avatar_url = data.avatar_url
            existing_blogger.instagram_url = data.instagram_url
            existing_blogger.youtube_url = data.youtube_url
            existing_blogger.tiktok_url = data.tiktok_url
            existing_blogger.telegram_url = data.telegram_url
            existing_blogger.status = BloggerStatus.PENDING
            await db.flush()
            return {"message": "Application resubmitted", "id": existing_blogger.id, "status": "pending"}
        else:
            raise HTTPException(status_code=400, detail="You already have an approved blogger profile")

    # Check nickname uniqueness
    existing = await db.execute(
        select(Blogger).where(Blogger.nickname == data.nickname)
    )
    if existing.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="Nickname already taken")

    # Check category exists
    cat_result = await db.execute(
        select(Category).where(Category.id == data.category_id)
    )
    if not cat_result.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="Invalid category")

    blogger = Blogger(
        user_id=user_id,
        full_name=data.full_name,
        nickname=data.nickname,
        phone=data.phone,
        country=data.country,
        category_id=data.category_id,
        description=data.description,
        avatar_url=data.avatar_url,
        instagram_url=data.instagram_url,
        youtube_url=data.youtube_url,
        tiktok_url=data.tiktok_url,
        telegram_url=data.telegram_url,
        status=BloggerStatus.PENDING,
    )
    db.add(blogger)
    await db.flush()

    return {"message": "Application submitted", "id": blogger.id, "status": "pending"}


@router.post("/{blogger_id}/avatar", summary="Upload blogger avatar")
async def upload_avatar(
    blogger_id: int,
    file: UploadFile = File(...),
    db: AsyncSession = Depends(get_db),
):
    """Upload an avatar image for a blogger."""
    # Validate file type
    allowed = {"image/jpeg", "image/png", "image/webp", "image/gif"}
    if file.content_type not in allowed:
        raise HTTPException(status_code=400, detail="Only JPEG, PNG, WebP, GIF allowed")

    # Read and validate size
    content = await file.read()
    if len(content) > settings.MAX_FILE_SIZE:
        raise HTTPException(status_code=400, detail="File too large (max 5MB)")

    # Get blogger
    result = await db.execute(select(Blogger).where(Blogger.id == blogger_id))
    blogger = result.scalar_one_or_none()
    if not blogger:
        raise HTTPException(status_code=404, detail="Blogger not found")

    # Save file
    ext = file.filename.rsplit(".", 1)[-1].lower() if "." in file.filename else "png"
    filename = f"{blogger_id}_{uuid.uuid4().hex[:8]}.{ext}"
    filepath = os.path.join(BLOGGERS_UPLOAD_DIR, filename)

    with open(filepath, "wb") as f:
        f.write(content)

    # Update blogger avatar_url
    avatar_url = f"/uploads/bloggers/{filename}"
    blogger.avatar_url = avatar_url
    await db.commit()

    return {"message": "Avatar uploaded", "avatar_url": avatar_url}
