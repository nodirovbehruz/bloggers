from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from datetime import datetime, timedelta
import random

from app.core.database import get_db
from app.core.security import create_access_token, get_current_user
from app.models.models import User, UserRole, Blogger, BloggerStatus, Category
from app.schemas.schemas import PhoneAuth, SMSVerify, TokenResponse

router = APIRouter(prefix="/auth", tags=["Authentication"])

# In-memory OTP storage (use Redis in production)
otp_store = {}


@router.post("/send-otp", summary="Send OTP to phone number")
async def send_otp(data: PhoneAuth, db: AsyncSession = Depends(get_db)):
    """Send SMS verification code to the provided phone number."""
    # Generate 6-digit OTP
    otp = str(random.randint(100000, 999999))
    otp_store[data.phone] = {
        "code": otp,
        "expires": datetime.utcnow() + timedelta(minutes=5),
        "attempts": 0,
    }

    # TODO: Send SMS via Eskiz API
    # In development, return OTP in response
    return {
        "message": "OTP sent successfully",
        "phone": data.phone,
        "otp_debug": otp,  # Remove in production
    }


@router.post("/verify-otp", response_model=TokenResponse, summary="Verify OTP and login")
async def verify_otp(data: SMSVerify, request: Request, db: AsyncSession = Depends(get_db)):
    """Verify SMS code and create/login user."""
    stored = otp_store.get(data.phone)
    
    if not stored:
        raise HTTPException(status_code=400, detail="OTP not found. Request a new one.")

    if stored["expires"] < datetime.utcnow():
        del otp_store[data.phone]
        raise HTTPException(status_code=400, detail="OTP expired")

    stored["attempts"] += 1
    if stored["attempts"] > 5:
        del otp_store[data.phone]
        raise HTTPException(status_code=429, detail="Too many attempts")

    if stored["code"] != data.code:
        raise HTTPException(status_code=400, detail="Invalid OTP")

    # Clean up
    del otp_store[data.phone]

    # Find or create user
    result = await db.execute(select(User).where(User.phone == data.phone))
    user = result.scalar_one_or_none()

    if not user:
        user = User(
            phone=data.phone,
            role=UserRole.USER,
        )
        db.add(user)
        await db.flush()

    if user.is_blocked:
        raise HTTPException(status_code=403, detail="Account is blocked")

    user.last_login = datetime.utcnow()

    # Create JWT
    token = create_access_token(data={
        "sub": str(user.id),
        "phone": user.phone,
        "role": user.role.value,
    })

    return TokenResponse(
        access_token=token,
        user_id=user.id,
    )


@router.get("/me", summary="Get current user profile")
async def get_me(
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Get the currently authenticated user's profile with blogger application info."""
    user_id = int(current_user["sub"])
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # Check if user has a blogger application
    blogger_result = await db.execute(
        select(Blogger).where(Blogger.user_id == user_id)
    )
    blogger = blogger_result.scalar_one_or_none()

    blogger_data = None
    if blogger:
        # Get category name
        cat_result = await db.execute(select(Category).where(Category.id == blogger.category_id))
        cat = cat_result.scalar_one_or_none()
        blogger_data = {
            "id": blogger.id,
            "full_name": blogger.full_name,
            "nickname": blogger.nickname,
            "phone": blogger.phone,
            "country": blogger.country,
            "category_id": blogger.category_id,
            "category_name": cat.name if cat else "",
            "description": blogger.description,
            "avatar_url": blogger.avatar_url,
            "instagram_url": blogger.instagram_url,
            "youtube_url": blogger.youtube_url,
            "tiktok_url": blogger.tiktok_url,
            "telegram_url": blogger.telegram_url,
            "status": blogger.status.value,
            "total_votes": blogger.total_votes,
            "created_at": blogger.created_at.isoformat() if blogger.created_at else None,
            "updated_at": blogger.updated_at.isoformat() if blogger.updated_at else None,
        }

    return {
        "id": user.id,
        "phone": user.phone,
        "country": user.country,
        "role": user.role.value,
        "is_active": user.is_active,
        "is_blocked": user.is_blocked,
        "coins": user.coins,
        "created_at": user.created_at.isoformat() if user.created_at else None,
        "last_login": user.last_login.isoformat() if user.last_login else None,
        "blogger_application": blogger_data,
    }


@router.post("/admin-login", summary="Admin login with username and password")
async def admin_login(
    request: Request,
    db: AsyncSession = Depends(get_db),
):
    """Authenticate admin user with username and password."""
    from app.core.security import verify_password

    body = await request.json()
    username = body.get("username", "").strip()
    password = body.get("password", "").strip()

    if not username or not password:
        raise HTTPException(status_code=400, detail="Username and password are required")

    # Find user by username
    result = await db.execute(
        select(User).where(User.username == username)
    )
    user = result.scalar_one_or_none()

    if not user:
        raise HTTPException(status_code=401, detail="Invalid username or password")

    if not user.password_hash:
        raise HTTPException(status_code=401, detail="Invalid username or password")

    if not verify_password(password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid username or password")

    if user.role != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Admin access required")

    if user.is_blocked:
        raise HTTPException(status_code=403, detail="Account is blocked")

    user.last_login = datetime.utcnow()

    # Create JWT
    token = create_access_token(data={
        "sub": str(user.id),
        "phone": user.phone,
        "username": user.username,
        "role": user.role.value,
    })

    return {
        "access_token": token,
        "token_type": "bearer",
        "user_id": user.id,
        "username": user.username,
        "role": user.role.value,
    }

