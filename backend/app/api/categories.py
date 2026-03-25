from fastapi import APIRouter, Depends, HTTPException, Query, UploadFile, File
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, desc
from typing import Optional
from datetime import datetime
import os
import uuid

from app.core.database import get_db
from app.core.security import get_admin_user
from app.core.config import settings
from app.models.models import Category, Blogger, BloggerStatus
from app.schemas.schemas import CategoryCreate, CategoryResponse

router = APIRouter(prefix="/categories", tags=["Categories"])

# Ensure categories upload dir exists
CATEGORIES_UPLOAD_DIR = os.path.join(settings.UPLOAD_DIR, "categories")
os.makedirs(CATEGORIES_UPLOAD_DIR, exist_ok=True)


def serialize_datetime(dt):
    if isinstance(dt, datetime):
        return dt.isoformat()
    return dt


@router.get("", summary="List all categories")
async def list_categories(db: AsyncSession = Depends(get_db)):
    """Get all active categories with blogger counts."""
    result = await db.execute(
        select(Category).where(Category.is_active == True).order_by(Category.sort_order)
    )
    categories = result.scalars().all()

    response = []
    for cat in categories:
        count_result = await db.execute(
            select(func.count(Blogger.id)).where(
                Blogger.category_id == cat.id,
                Blogger.status == BloggerStatus.APPROVED,
            )
        )
        blogger_count = count_result.scalar() or 0
        response.append({
            "id": cat.id,
            "name": cat.name,
            "name_uz": cat.name_uz,
            "name_en": cat.name_en,
            "slug": cat.slug,
            "icon": cat.icon,
            "image_url": cat.image_url,
            "description": cat.description,
            "description_uz": cat.description_uz,
            "description_en": cat.description_en,
            "sort_order": cat.sort_order,
            "is_active": cat.is_active,
            "blogger_count": blogger_count,
            "created_at": serialize_datetime(cat.created_at),
        })

    return response


@router.get("/{slug}", summary="Get category by slug")
async def get_category(slug: str, db: AsyncSession = Depends(get_db)):
    """Get a specific category by its slug."""
    result = await db.execute(
        select(Category).where(Category.slug == slug, Category.is_active == True)
    )
    category = result.scalar_one_or_none()
    if not category:
        raise HTTPException(status_code=404, detail="Category not found")

    count_result = await db.execute(
        select(func.count(Blogger.id)).where(
            Blogger.category_id == category.id,
            Blogger.status == BloggerStatus.APPROVED,
        )
    )
    blogger_count = count_result.scalar() or 0

    return {
        "id": category.id,
        "name": category.name,
        "name_uz": category.name_uz,
        "name_en": category.name_en,
        "slug": category.slug,
        "icon": category.icon,
        "image_url": category.image_url,
        "description": category.description,
        "description_uz": category.description_uz,
        "description_en": category.description_en,
        "sort_order": category.sort_order,
        "is_active": category.is_active,
        "blogger_count": blogger_count,
        "created_at": serialize_datetime(category.created_at),
    }


@router.post("", status_code=201, summary="Create category (admin)")
async def create_category(
    name: str,
    slug: str,
    icon: Optional[str] = None,
    sort_order: Optional[int] = 0,
    name_uz: Optional[str] = None,
    name_en: Optional[str] = None,
    description: Optional[str] = None,
    description_uz: Optional[str] = None,
    description_en: Optional[str] = None,
    admin: dict = Depends(get_admin_user),
    db: AsyncSession = Depends(get_db),
):
    """Create a new category."""
    # Check slug uniqueness
    existing = await db.execute(
        select(Category).where(Category.slug == slug)
    )
    if existing.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="Category with this slug already exists")

    category = Category(
        name=name,
        name_uz=name_uz,
        name_en=name_en,
        slug=slug,
        icon=icon or "",
        sort_order=sort_order,
        description=description,
        description_uz=description_uz,
        description_en=description_en,
        is_active=True,
    )
    db.add(category)
    await db.flush()

    return {
        "message": "Category created",
        "id": category.id,
        "name": category.name,
        "slug": category.slug,
    }


@router.put("/{category_id}", summary="Update category (admin)")
async def update_category(
    category_id: int,
    name: Optional[str] = None,
    slug: Optional[str] = None,
    icon: Optional[str] = None,
    sort_order: Optional[int] = None,
    is_active: Optional[bool] = None,
    name_uz: Optional[str] = None,
    name_en: Optional[str] = None,
    description: Optional[str] = None,
    description_uz: Optional[str] = None,
    description_en: Optional[str] = None,
    admin: dict = Depends(get_admin_user),
    db: AsyncSession = Depends(get_db),
):
    """Update an existing category."""
    result = await db.execute(select(Category).where(Category.id == category_id))
    category = result.scalar_one_or_none()
    if not category:
        raise HTTPException(status_code=404, detail="Category not found")

    if name is not None:
        category.name = name
    if slug is not None:
        # Check slug uniqueness for other categories
        existing = await db.execute(
            select(Category).where(Category.slug == slug, Category.id != category_id)
        )
        if existing.scalar_one_or_none():
            raise HTTPException(status_code=400, detail="Category with this slug already exists")
        category.slug = slug
    if icon is not None:
        category.icon = icon
    if sort_order is not None:
        category.sort_order = sort_order
    if is_active is not None:
        category.is_active = is_active
    if name_uz is not None:
        category.name_uz = name_uz
    if name_en is not None:
        category.name_en = name_en
    if description is not None:
        category.description = description
    if description_uz is not None:
        category.description_uz = description_uz
    if description_en is not None:
        category.description_en = description_en

    return {
        "message": "Category updated",
        "id": category.id,
        "name": category.name,
        "slug": category.slug,
    }


@router.delete("/{category_id}", summary="Delete category (admin)")
async def delete_category(
    category_id: int,
    admin: dict = Depends(get_admin_user),
    db: AsyncSession = Depends(get_db),
):
    """Delete a category. Will fail if bloggers are assigned to it."""
    result = await db.execute(select(Category).where(Category.id == category_id))
    category = result.scalar_one_or_none()
    if not category:
        raise HTTPException(status_code=404, detail="Category not found")

    # Check if any bloggers use this category
    blogger_count = await db.execute(
        select(func.count(Blogger.id)).where(Blogger.category_id == category_id)
    )
    count = blogger_count.scalar() or 0
    if count > 0:
        raise HTTPException(
            status_code=400,
            detail=f"Cannot delete: {count} bloggers are assigned to this category"
        )

    await db.delete(category)

    return {"message": "Category deleted", "id": category_id}


@router.post("/{category_id}/image", summary="Upload category image (admin)")
async def upload_category_image(
    category_id: int,
    file: UploadFile = File(...),
    admin: dict = Depends(get_admin_user),
    db: AsyncSession = Depends(get_db),
):
    """Upload an image for a category."""
    allowed = {"image/jpeg", "image/png", "image/webp", "image/gif"}
    if file.content_type not in allowed:
        raise HTTPException(status_code=400, detail="Only JPEG, PNG, WebP, GIF allowed")

    content = await file.read()
    if len(content) > settings.MAX_FILE_SIZE:
        raise HTTPException(status_code=400, detail="File too large (max 5MB)")

    result = await db.execute(select(Category).where(Category.id == category_id))
    category = result.scalar_one_or_none()
    if not category:
        raise HTTPException(status_code=404, detail="Category not found")

    ext = file.filename.rsplit(".", 1)[-1].lower() if "." in file.filename else "png"
    filename = f"cat_{category_id}_{uuid.uuid4().hex[:8]}.{ext}"
    filepath = os.path.join(CATEGORIES_UPLOAD_DIR, filename)

    with open(filepath, "wb") as f:
        f.write(content)

    category.image_url = f"/uploads/categories/{filename}"
    await db.commit()

    return {"message": "Image uploaded", "image_url": category.image_url}
