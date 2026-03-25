from fastapi import APIRouter, Depends, HTTPException, Query, UploadFile, File
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc
from datetime import datetime
import os
import uuid

from app.core.database import get_db
from app.core.security import get_admin_user
from app.core.config import settings
from app.models.models import Sponsor

router = APIRouter(prefix="/sponsors", tags=["Sponsors"])

# Ensure sponsors upload dir exists
SPONSORS_UPLOAD_DIR = os.path.join(settings.UPLOAD_DIR, "sponsors")
os.makedirs(SPONSORS_UPLOAD_DIR, exist_ok=True)


def serialize_datetime(dt):
    return dt.isoformat() if dt else None


@router.get("", summary="List all active sponsors")
async def list_sponsors(db: AsyncSession = Depends(get_db)):
    """Public endpoint: returns all active sponsors."""
    result = await db.execute(
        select(Sponsor).where(Sponsor.is_active == True).order_by(Sponsor.name)
    )
    sponsors = result.scalars().all()
    return [
        {
            "id": s.id,
            "name": s.name,
            "name_uz": s.name_uz,
            "name_en": s.name_en,
            "logo_url": s.logo_url,
            "website_url": s.website_url,
            "is_active": s.is_active,
            "created_at": serialize_datetime(s.created_at),
        }
        for s in sponsors
    ]


@router.get("/all", summary="List all sponsors (admin)")
async def list_all_sponsors(
    admin: dict = Depends(get_admin_user),
    db: AsyncSession = Depends(get_db),
):
    """Admin endpoint: returns all sponsors including inactive."""
    result = await db.execute(
        select(Sponsor).order_by(desc(Sponsor.created_at))
    )
    sponsors = result.scalars().all()
    return [
        {
            "id": s.id,
            "name": s.name,
            "name_uz": s.name_uz,
            "name_en": s.name_en,
            "logo_url": s.logo_url,
            "website_url": s.website_url,
            "is_active": s.is_active,
            "created_at": serialize_datetime(s.created_at),
        }
        for s in sponsors
    ]


@router.post("", summary="Create sponsor (admin)")
async def create_sponsor(
    name: str = Query(..., min_length=1),
    website_url: str = Query(None),
    logo_url: str = Query(None),
    admin: dict = Depends(get_admin_user),
    db: AsyncSession = Depends(get_db),
):
    """Create a new sponsor."""
    sponsor = Sponsor(
        name=name,
        website_url=website_url,
        logo_url=logo_url,
        is_active=True,
    )
    db.add(sponsor)
    await db.flush()
    await db.commit()
    return {"message": "Sponsor created", "id": sponsor.id, "name": sponsor.name}


@router.put("/{sponsor_id}", summary="Update sponsor (admin)")
async def update_sponsor(
    sponsor_id: int,
    name: str = Query(None),
    website_url: str = Query(None),
    logo_url: str = Query(None),
    is_active: bool = Query(None),
    admin: dict = Depends(get_admin_user),
    db: AsyncSession = Depends(get_db),
):
    """Update an existing sponsor."""
    result = await db.execute(select(Sponsor).where(Sponsor.id == sponsor_id))
    sponsor = result.scalar_one_or_none()
    if not sponsor:
        raise HTTPException(status_code=404, detail="Sponsor not found")

    if name is not None:
        sponsor.name = name
    if website_url is not None:
        sponsor.website_url = website_url
    if logo_url is not None:
        sponsor.logo_url = logo_url
    if is_active is not None:
        sponsor.is_active = is_active

    await db.commit()
    return {
        "message": "Sponsor updated",
        "id": sponsor.id,
        "name": sponsor.name,
        "is_active": sponsor.is_active,
    }


@router.delete("/{sponsor_id}", summary="Delete sponsor (admin)")
async def delete_sponsor(
    sponsor_id: int,
    admin: dict = Depends(get_admin_user),
    db: AsyncSession = Depends(get_db),
):
    """Delete a sponsor."""
    result = await db.execute(select(Sponsor).where(Sponsor.id == sponsor_id))
    sponsor = result.scalar_one_or_none()
    if not sponsor:
        raise HTTPException(status_code=404, detail="Sponsor not found")

    await db.delete(sponsor)
    await db.commit()
    return {"message": "Sponsor deleted", "id": sponsor_id}


@router.post("/{sponsor_id}/logo", summary="Upload sponsor logo")
async def upload_logo(
    sponsor_id: int,
    file: UploadFile = File(...),
    admin: dict = Depends(get_admin_user),
    db: AsyncSession = Depends(get_db),
):
    """Upload a logo image for a sponsor."""
    allowed = {"image/jpeg", "image/png", "image/webp", "image/gif", "image/svg+xml"}
    if file.content_type not in allowed:
        raise HTTPException(status_code=400, detail="Only JPEG, PNG, WebP, GIF, SVG allowed")

    content = await file.read()
    if len(content) > settings.MAX_FILE_SIZE:
        raise HTTPException(status_code=400, detail="File too large (max 5MB)")

    result = await db.execute(select(Sponsor).where(Sponsor.id == sponsor_id))
    sponsor = result.scalar_one_or_none()
    if not sponsor:
        raise HTTPException(status_code=404, detail="Sponsor not found")

    ext = file.filename.rsplit(".", 1)[-1].lower() if "." in file.filename else "png"
    filename = f"sponsor_{sponsor_id}_{uuid.uuid4().hex[:8]}.{ext}"
    filepath = os.path.join(SPONSORS_UPLOAD_DIR, filename)

    with open(filepath, "wb") as f:
        f.write(content)

    sponsor.logo_url = f"/uploads/sponsors/{filename}"
    await db.commit()

    return {"message": "Logo uploaded", "logo_url": sponsor.logo_url}
