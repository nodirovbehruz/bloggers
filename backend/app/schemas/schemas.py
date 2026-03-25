from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, Field


# ===== Auth =====
class PhoneAuth(BaseModel):
    phone: str = Field(..., pattern=r"^\+998\d{9}$")

class SMSVerify(BaseModel):
    phone: str
    code: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user_id: int


# ===== User =====
class UserResponse(BaseModel):
    id: int
    phone: str
    country: Optional[str] = None
    role: str
    is_active: bool
    is_blocked: bool
    coins: int
    created_at: datetime

    class Config:
        from_attributes = True

class UserUpdate(BaseModel):
    country: Optional[str] = None


# ===== Category =====
class CategoryCreate(BaseModel):
    name: str
    slug: str
    description: Optional[str] = None
    sponsor_id: Optional[int] = None

class CategoryResponse(BaseModel):
    id: int
    name: str
    slug: str
    description: Optional[str] = None
    image_url: Optional[str] = None
    blogger_count: int = 0
    is_active: bool

    class Config:
        from_attributes = True


# ===== Blogger =====
class BloggerCreate(BaseModel):
    full_name: str = Field(..., min_length=2, max_length=200)
    nickname: str = Field(..., min_length=2, max_length=100)
    phone: str
    country: str = "UZ"
    category_id: int
    description: Optional[str] = None
    avatar_url: Optional[str] = None
    instagram_url: Optional[str] = None
    youtube_url: Optional[str] = None
    tiktok_url: Optional[str] = None
    telegram_url: Optional[str] = None

class BloggerResponse(BaseModel):
    id: int
    full_name: str
    nickname: str
    country: str
    category_id: int
    category_name: Optional[str] = None
    description: Optional[str] = None
    avatar_url: Optional[str] = None
    instagram_url: Optional[str] = None
    youtube_url: Optional[str] = None
    tiktok_url: Optional[str] = None
    telegram_url: Optional[str] = None
    status: str
    total_votes: int
    rank: Optional[int] = None
    created_at: datetime

    class Config:
        from_attributes = True

class BloggerListResponse(BaseModel):
    bloggers: List[BloggerResponse]
    total: int
    page: int
    per_page: int


# ===== Vote =====
class VoteCreate(BaseModel):
    blogger_id: int
    vote_type: str  # "free", "vip", "coin", "promo"
    promo_code: Optional[str] = None
    payment_method: Optional[str] = None  # "payme", "click", "uzum"

class VoteResponse(BaseModel):
    id: int
    user_id: int
    blogger_id: int
    vote_type: str
    country: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True


# ===== Payment =====
class PaymentCreate(BaseModel):
    method: str
    amount: int

class PaymentResponse(BaseModel):
    id: int
    transaction_id: Optional[str] = None
    method: str
    amount: int
    status: str
    created_at: datetime

    class Config:
        from_attributes = True


# ===== Sponsor =====
class SponsorCreate(BaseModel):
    name: str
    website_url: Optional[str] = None

class SponsorResponse(BaseModel):
    id: int
    name: str
    logo_url: Optional[str] = None
    website_url: Optional[str] = None
    is_active: bool

    class Config:
        from_attributes = True


# ===== Banner =====
class BannerCreate(BaseModel):
    sponsor_id: int
    title: Optional[str] = None
    image_url: str
    link_url: Optional[str] = None
    position: str
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None

class BannerResponse(BaseModel):
    id: int
    sponsor_id: int
    title: Optional[str] = None
    image_url: str
    position: str
    clicks: int
    is_active: bool

    class Config:
        from_attributes = True


# ===== PromoCode =====
class PromoCodeCreate(BaseModel):
    code: str
    sponsor_id: Optional[int] = None
    max_uses: int = 100
    expires_at: Optional[datetime] = None

class PromoCodeResponse(BaseModel):
    id: int
    code: str
    max_uses: int
    used_count: int
    is_active: bool
    expires_at: Optional[datetime] = None

    class Config:
        from_attributes = True


# ===== Contest =====
class ContestStats(BaseModel):
    total_users: int
    total_bloggers: int
    total_votes: int
    total_revenue: int
    is_active: bool

class ContestSettings(BaseModel):
    start_date: Optional[str] = None
    end_date: Optional[str] = None
    daily_vote_limit: Optional[int] = None
    vip_vote_price: Optional[int] = None
    sms_enabled: Optional[bool] = None
    contest_active: Optional[bool] = None
    ip_limit: Optional[int] = None
    device_limit: Optional[int] = None
    rate_limit: Optional[int] = None


# ===== Admin =====
class AdminLogResponse(BaseModel):
    id: int
    admin_id: int
    action: str
    target_type: Optional[str] = None
    target_id: Optional[int] = None
    details: Optional[dict] = None
    created_at: datetime

    class Config:
        from_attributes = True


# ===== Leaderboard =====
class LeaderboardEntry(BaseModel):
    rank: int
    blogger_id: int
    full_name: str
    nickname: str
    avatar_url: Optional[str] = None
    category_name: str
    total_votes: int
    change: int = 0  # vote change in last 24h
