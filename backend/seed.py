"""Seed script: fill database with initial test data."""
import asyncio
import sys
import os

# Add project root to path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.core.database import engine, async_session, Base
from app.models.models import (
    User, UserRole, Category, Blogger, BloggerStatus,
    Vote, VoteType, Sponsor, Country
)
from app.core.security import create_access_token, get_password_hash
from datetime import datetime, timedelta
import random

# Admin credentials
ADMIN_USERNAME = "admin"
ADMIN_PASSWORD = "admin123"


async def seed():
    # Create all tables
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
        await conn.run_sync(Base.metadata.create_all)
    print("Tables created")

    async with async_session() as db:
        # ===== 1. USERS =====
        admin = User(
            phone="+998901234567",
            username=ADMIN_USERNAME,
            password_hash=get_password_hash(ADMIN_PASSWORD),
            role=UserRole.ADMIN,
            country="UZ",
            coins=0,
        )
        db.add(admin)

        users = []
        phones = [
            "+998901111111", "+998902222222", "+998903333333",
            "+998904444444", "+998905555555", "+998906666666",
            "+998907777777", "+998908888888", "+998909999999",
            "+998911111111",
        ]
        for phone in phones:
            u = User(phone=phone, role=UserRole.USER, country="UZ")
            db.add(u)
            users.append(u)

        await db.flush()
        print(f"Created admin (id={admin.id}, username={ADMIN_USERNAME}) + {len(users)} users")

        # ===== 2. SPONSORS =====
        sponsors_data = [
            {"name": "TechCorp", "website_url": "https://techcorp.uz"},
            {"name": "MediaGroup", "website_url": "https://mediagroup.uz"},
            {"name": "DigitalWave", "website_url": "https://digitalwave.uz"},
        ]
        sponsors = []
        for s in sponsors_data:
            sp = Sponsor(**s)
            db.add(sp)
            sponsors.append(sp)
        await db.flush()
        print(f"✅ Created {len(sponsors)} sponsors")

        # ===== 3. CATEGORIES =====
        categories_data = [
            {"name": "Лайфстайл", "slug": "lifestyle", "icon": "🌟", "sort_order": 1},
            {"name": "Красота", "slug": "beauty", "icon": "💄", "sort_order": 2},
            {"name": "Путешествия", "slug": "travel", "icon": "✈️", "sort_order": 3},
            {"name": "Еда", "slug": "food", "icon": "🍕", "sort_order": 4},
            {"name": "Фитнесс", "slug": "fitness", "icon": "💪", "sort_order": 5},
            {"name": "Технологии", "slug": "tech", "icon": "💻", "sort_order": 6},
            {"name": "Музыка", "slug": "music", "icon": "🎵", "sort_order": 7},
            {"name": "Юмор", "slug": "humor", "icon": "😂", "sort_order": 8},
        ]
        cats = []
        for c in categories_data:
            cat = Category(**c, is_active=True)
            db.add(cat)
            cats.append(cat)
        await db.flush()
        print(f"✅ Created {len(cats)} categories")

        # ===== 4. COUNTRIES =====
        countries_data = [
            {"code": "UZ", "name": "Узбекистан", "flag_emoji": "🇺🇿"},
            {"code": "KZ", "name": "Казахстан", "flag_emoji": "🇰🇿"},
            {"code": "RU", "name": "Россия", "flag_emoji": "🇷🇺"},
            {"code": "KG", "name": "Кыргызстан", "flag_emoji": "🇰🇬"},
            {"code": "TJ", "name": "Таджикистан", "flag_emoji": "🇹🇯"},
        ]
        for c in countries_data:
            db.add(Country(**c))
        await db.flush()
        print("✅ Created countries")

        # ===== 5. BLOGGERS =====
        bloggers_data = [
            {"full_name": "Ruxsora Mirjalilova", "nickname": "@ruxsora_m", "phone": "+998901111100", "category_id": cats[1].id, "description": "Beauty блогер и визажист. Делюсь секретами красоты и макияжа.", "country": "UZ", "instagram_url": "https://instagram.com/ruxsora_m", "avatar_url": "/bloggers/real1.png"},
            {"full_name": "Lil Khurammov", "nickname": "@lil_khurammov", "phone": "+998901111101", "category_id": cats[0].id, "description": "Lifestyle блогер. Контент о моде и стиле жизни.", "country": "UZ", "instagram_url": "https://instagram.com/lil_khurammov", "avatar_url": "/bloggers/real2.png"},
            {"full_name": "Diana Sultanova", "nickname": "@diana_s", "phone": "+998901111102", "category_id": cats[2].id, "description": "Travel блогер. Путешествую по миру и делюсь красивыми местами.", "country": "UZ", "instagram_url": "https://instagram.com/diana_s", "avatar_url": "/bloggers/real3.png"},
            {"full_name": "Sardor Rahimov", "nickname": "@sardor_tech", "phone": "+998901111103", "category_id": cats[5].id, "description": "Tech блогер и обзорщик гаджетов.", "country": "UZ", "instagram_url": "https://instagram.com/sardor_tech", "avatar_url": "/bloggers/real4.png"},
            {"full_name": "Nigora Karimova", "nickname": "@nigora_fit", "phone": "+998901111104", "category_id": cats[4].id, "description": "Фитнес тренер и блогер. Тренировки, питание и мотивация.", "country": "UZ", "instagram_url": "https://instagram.com/nigora_fit", "avatar_url": "/bloggers/real5.png"},
            {"full_name": "Timur Aliyev", "nickname": "@timur_food", "phone": "+998901111105", "category_id": cats[3].id, "description": "Food блогер и шеф-повар. Рецепты национальной кухни.", "country": "UZ", "instagram_url": "https://instagram.com/timur_food", "avatar_url": "/bloggers/real6.png"},
            {"full_name": "Aziza Murodova", "nickname": "@aziza_beauty", "phone": "+998901111106", "category_id": cats[1].id, "description": "Бьюти блогер. Обзоры косметики и уходовые средства.", "country": "UZ", "avatar_url": "/bloggers/b1.png"},
            {"full_name": "Bekzod Mirzaev", "nickname": "@bekzod_humor", "phone": "+998901111107", "category_id": cats[7].id, "description": "Юмористический блогер. Скетчи и пародии.", "country": "UZ", "avatar_url": "/bloggers/b2.png"},
            {"full_name": "Malika Abdullayeva", "nickname": "@malika_music", "phone": "+998901111108", "category_id": cats[6].id, "description": "Музыкальный блогер и исполнительница.", "country": "UZ", "avatar_url": "/bloggers/b3.png"},
            # Pending bloggers (for admin moderation testing)
            {"full_name": "Шахзод Азимов", "nickname": "@shahzod_a", "phone": "+998901234568", "category_id": cats[0].id, "description": "Новый лайфстайл блогер", "country": "UZ", "status": "pending"},
            {"full_name": "Камола Юсупова", "nickname": "@kamola_y", "phone": "+998912345678", "category_id": cats[1].id, "description": "Начинающий бьюти блогер", "country": "UZ", "status": "pending"},
            {"full_name": "Фарход Исмаилов", "nickname": "@farhod_i", "phone": "+998933456789", "category_id": cats[5].id, "description": "Обзоры технологий", "country": "UZ", "status": "pending"},
        ]

        bloggers = []
        for b_data in bloggers_data:
            status = BloggerStatus.PENDING if b_data.pop("status", None) == "pending" else BloggerStatus.APPROVED
            blogger = Blogger(
                **b_data,
                status=status,
                is_active=(status == BloggerStatus.APPROVED),
                total_votes=0,
            )
            db.add(blogger)
            bloggers.append(blogger)
        await db.flush()
        print(f"✅ Created {len(bloggers)} bloggers")

        # ===== 6. VOTES (random for approved bloggers) =====
        approved = [b for b in bloggers if b.status == BloggerStatus.APPROVED]
        vote_counts = [15678, 12534, 11245, 9876, 8654, 7832, 6543, 5234, 4987]
        total_votes_created = 0

        for i, blogger in enumerate(approved):
            target_votes = vote_counts[i] if i < len(vote_counts) else random.randint(1000, 5000)
            # Create a representative sample of votes (not all, for speed)
            sample_size = min(target_votes, 50)
            blogger.total_votes = target_votes

            for _ in range(sample_size):
                user = random.choice(users)
                vote_type = random.choice([VoteType.FREE, VoteType.FREE, VoteType.FREE, VoteType.VIP])
                vote = Vote(
                    user_id=user.id,
                    blogger_id=blogger.id,
                    vote_type=vote_type,
                    country="UZ",
                    ip_address=f"195.158.{random.randint(1, 255)}.{random.randint(1, 255)}",
                    device_id=f"device_{random.randint(1000, 9999)}",
                    created_at=datetime.utcnow() - timedelta(
                        days=random.randint(0, 15),
                        hours=random.randint(0, 23),
                        minutes=random.randint(0, 59),
                    ),
                )
                db.add(vote)
                total_votes_created += 1

        await db.flush()
        print(f"✅ Created {total_votes_created} sample votes, total votes set for {len(approved)} bloggers")

        await db.commit()
        print()
        print("=" * 50)
        print("SEED COMPLETE!")
        print("=" * 50)
        print()
        print(f"Admin Login Credentials:")
        print(f"  Username: {ADMIN_USERNAME}")
        print(f"  Password: {ADMIN_PASSWORD}")
        print(f"  URL: http://localhost:3000/admin-login")
        print()


if __name__ == "__main__":
    asyncio.run(seed())

