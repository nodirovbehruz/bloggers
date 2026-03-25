import enum
from datetime import datetime
from sqlalchemy import (
    Column, Integer, String, Text, Boolean, DateTime, Enum, ForeignKey,
    BigInteger, Float, JSON, UniqueConstraint, Index
)
from sqlalchemy.orm import relationship
from app.core.database import Base


class UserRole(str, enum.Enum):
    USER = "user"
    ADMIN = "admin"


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    phone = Column(String(20), unique=True, nullable=False, index=True)
    username = Column(String(100), unique=True, nullable=True, index=True)
    password_hash = Column(String(255), nullable=True)
    country = Column(String(5), nullable=True)
    role = Column(Enum(UserRole), default=UserRole.USER)
    is_active = Column(Boolean, default=True)
    is_blocked = Column(Boolean, default=False)
    device_id = Column(String(255), nullable=True)
    coins = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    last_login = Column(DateTime, nullable=True)

    votes = relationship("Vote", back_populates="user")
    payments = relationship("Payment", back_populates="user")


class BloggerStatus(str, enum.Enum):
    PENDING = "pending"
    APPROVED = "approved"
    REJECTED = "rejected"
    BLOCKED = "blocked"


class Blogger(Base):
    __tablename__ = "bloggers"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    full_name = Column(String(200), nullable=False)
    nickname = Column(String(100), unique=True, nullable=False, index=True)
    phone = Column(String(20), nullable=False)
    country = Column(String(5), nullable=False, default="UZ")
    category_id = Column(Integer, ForeignKey("categories.id"), nullable=False)
    description = Column(Text, nullable=True)
    description_uz = Column(Text, nullable=True)
    description_en = Column(Text, nullable=True)
    avatar_url = Column(String(500), nullable=True)
    instagram_url = Column(String(500), nullable=True)
    youtube_url = Column(String(500), nullable=True)
    tiktok_url = Column(String(500), nullable=True)
    telegram_url = Column(String(500), nullable=True)
    status = Column(Enum(BloggerStatus), default=BloggerStatus.PENDING)
    total_votes = Column(Integer, default=0)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    category = relationship("Category", back_populates="bloggers")
    votes = relationship("Vote", back_populates="blogger")

    __table_args__ = (
        Index("idx_blogger_category_votes", "category_id", "total_votes"),
        Index("idx_blogger_country", "country"),
    )


class VoteType(str, enum.Enum):
    FREE = "free"
    VIP = "vip"
    COIN = "coin"
    PROMO = "promo"


class Vote(Base):
    __tablename__ = "votes"

    id = Column(BigInteger().with_variant(Integer, "sqlite"), primary_key=True, index=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    blogger_id = Column(Integer, ForeignKey("bloggers.id"), nullable=False)
    vote_type = Column(Enum(VoteType), nullable=False)
    country = Column(String(5), nullable=True)
    ip_address = Column(String(45), nullable=True)
    device_id = Column(String(255), nullable=True)
    payment_id = Column(Integer, ForeignKey("payments.id"), nullable=True)
    is_cancelled = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="votes")
    blogger = relationship("Blogger", back_populates="votes")
    payment = relationship("Payment", back_populates="vote")

    __table_args__ = (
        Index("idx_vote_user_date", "user_id", "created_at"),
        Index("idx_vote_blogger", "blogger_id"),
        Index("idx_vote_ip", "ip_address"),
    )


class Category(Base):
    __tablename__ = "categories"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), unique=True, nullable=False)
    name_uz = Column(String(100), nullable=True)
    name_en = Column(String(100), nullable=True)
    slug = Column(String(100), unique=True, nullable=False, index=True)
    description = Column(Text, nullable=True)
    description_uz = Column(Text, nullable=True)
    description_en = Column(Text, nullable=True)
    icon = Column(String(20), nullable=True)
    image_url = Column(String(500), nullable=True)
    sponsor_id = Column(Integer, ForeignKey("sponsors.id"), nullable=True)
    is_active = Column(Boolean, default=True)
    sort_order = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)

    bloggers = relationship("Blogger", back_populates="category")
    sponsor = relationship("Sponsor", back_populates="categories")


class PaymentStatus(str, enum.Enum):
    PENDING = "pending"
    COMPLETED = "completed"
    FAILED = "failed"
    REFUNDED = "refunded"


class PaymentMethod(str, enum.Enum):
    PAYME = "payme"
    CLICK = "click"
    UZUM = "uzum"
    COIN = "coin"


class Payment(Base):
    __tablename__ = "payments"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    transaction_id = Column(String(100), unique=True, nullable=True)
    method = Column(Enum(PaymentMethod), nullable=False)
    amount = Column(Integer, nullable=False)  # in tiyin/cents
    status = Column(Enum(PaymentStatus), default=PaymentStatus.PENDING)
    metadata_json = Column(JSON, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    user = relationship("User", back_populates="payments")
    vote = relationship("Vote", back_populates="payment", uselist=False)


class PromoCode(Base):
    __tablename__ = "promo_codes"

    id = Column(Integer, primary_key=True, index=True)
    code = Column(String(50), unique=True, nullable=False, index=True)
    sponsor_id = Column(Integer, ForeignKey("sponsors.id"), nullable=True)
    max_uses = Column(Integer, default=100)
    used_count = Column(Integer, default=0)
    is_active = Column(Boolean, default=True)
    expires_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    sponsor = relationship("Sponsor", back_populates="promo_codes")


class Sponsor(Base):
    __tablename__ = "sponsors"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(200), nullable=False)
    name_uz = Column(String(200), nullable=True)
    name_en = Column(String(200), nullable=True)
    logo_url = Column(String(500), nullable=True)
    website_url = Column(String(500), nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    categories = relationship("Category", back_populates="sponsor")
    banners = relationship("Banner", back_populates="sponsor")
    promo_codes = relationship("PromoCode", back_populates="sponsor")


class Banner(Base):
    __tablename__ = "banners"

    id = Column(Integer, primary_key=True, index=True)
    sponsor_id = Column(Integer, ForeignKey("sponsors.id"), nullable=False)
    title = Column(String(200), nullable=True)
    image_url = Column(String(500), nullable=False)
    link_url = Column(String(500), nullable=True)
    position = Column(String(100), nullable=False)  # e.g., "home_top", "category_sidebar"
    clicks = Column(Integer, default=0)
    is_active = Column(Boolean, default=True)
    start_date = Column(DateTime, nullable=True)
    end_date = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    sponsor = relationship("Sponsor", back_populates="banners")


class Country(Base):
    __tablename__ = "countries"

    id = Column(Integer, primary_key=True, index=True)
    code = Column(String(5), unique=True, nullable=False)
    name = Column(String(100), nullable=False)
    flag_emoji = Column(String(10), nullable=True)
    is_active = Column(Boolean, default=True)


class AdminLog(Base):
    __tablename__ = "admin_logs"

    id = Column(BigInteger().with_variant(Integer, "sqlite"), primary_key=True, index=True, autoincrement=True)
    admin_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    action = Column(String(100), nullable=False)
    target_type = Column(String(50), nullable=True)  # "blogger", "vote", "user", etc.
    target_id = Column(Integer, nullable=True)
    details = Column(JSON, nullable=True)
    ip_address = Column(String(45), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    admin = relationship("User")

    __table_args__ = (
        Index("idx_admin_log_date", "created_at"),
    )


class ContestSettings(Base):
    __tablename__ = "contest_settings"

    id = Column(Integer, primary_key=True, default=1)
    contest_active = Column(Boolean, default=True)
    start_date = Column(String(30), default="2026-03-01T00:00:00")
    end_date = Column(String(30), default="2026-04-15T00:00:00")
    daily_vote_limit = Column(Integer, default=1)
    vip_vote_price = Column(Integer, default=10000)
    ip_limit = Column(Integer, default=10)
    device_limit = Column(Integer, default=3)
    rate_limit_per_minute = Column(Integer, default=30)
    sms_enabled = Column(Boolean, default=True)
    sms_provider = Column(String(50), default="eskiz")
    bot_protection = Column(Boolean, default=True)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
