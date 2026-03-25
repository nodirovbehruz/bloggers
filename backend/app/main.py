from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from contextlib import asynccontextmanager
import os

from app.core.config import settings
from app.core.database import init_db, async_session
from app.api import auth, bloggers, votes, categories, admin, sponsors


async def create_default_admin():
    """Create default admin user if none exists."""
    from app.models.models import User, UserRole
    from app.core.security import get_password_hash
    from sqlalchemy import select

    async with async_session() as db:
        # Check if any admin exists
        result = await db.execute(
            select(User).where(User.role == UserRole.ADMIN)
        )
        existing_admin = result.scalar_one_or_none()

        if not existing_admin:
            admin_user = User(
                phone="+998000000000",
                username=settings.ADMIN_USERNAME,
                password_hash=get_password_hash(settings.ADMIN_PASSWORD),
                role=UserRole.ADMIN,
                is_active=True,
            )
            db.add(admin_user)
            await db.commit()
            print(f"[OK] Default admin created: {settings.ADMIN_USERNAME} / {settings.ADMIN_PASSWORD}")
        else:
            print(f"[OK] Admin exists: {existing_admin.username}")


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan handler."""
    # Startup
    await init_db()
    os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
    await create_default_admin()
    yield
    # Shutdown


app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="API for the Blogger Association Voting Platform",
    lifespan=lifespan,
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Static files
app.mount("/uploads", StaticFiles(directory=settings.UPLOAD_DIR), name="uploads")

# Include routers
app.include_router(auth.router, prefix="/api/v1")
app.include_router(bloggers.router, prefix="/api/v1")
app.include_router(votes.router, prefix="/api/v1")
app.include_router(categories.router, prefix="/api/v1")
app.include_router(admin.router, prefix="/api/v1")
app.include_router(sponsors.router, prefix="/api/v1")


@app.get("/", tags=["Health"])
async def root():
    return {
        "name": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "status": "running",
    }


@app.get("/health", tags=["Health"])
async def health():
    return {"status": "healthy"}
