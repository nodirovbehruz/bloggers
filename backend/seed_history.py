import asyncio
from app.core.database import async_session, init_db
from app.models.models import Blogger, Category, BloggerStatus, ContestSession, Winner
from sqlalchemy import select
from datetime import datetime, timedelta
import random

async def seed_history():
    await init_db()
    async with async_session() as db:
        print("--- SEEDING CONTEST HISTORY ---")
        
        # 1. Get Categories
        cat_res = await db.execute(select(Category))
        categories = cat_res.scalars().all()
        
        # 2. Get Bloggers
        bloggers_res = await db.execute(select(Blogger).where(Blogger.status == BloggerStatus.APPROVED))
        bloggers = bloggers_res.scalars().all()
        
        if not categories or not bloggers:
            print("Need categories and bloggers to seed history.")
            return

        sessions_data = [
            {"title": "Зимний Кубок 2024", "days_ago": 400},
            {"title": "Премия Лето 2024", "days_ago": 250},
            {"title": "Итоги Года 2024", "days_ago": 100},
            {"title": "Январский Этап 2025", "days_ago": 30},
        ]

        for s_info in sessions_data:
            dt = datetime.utcnow() - timedelta(days=s_info["days_ago"])
            
            # Check if exists
            exists = await db.execute(select(ContestSession).where(ContestSession.title == s_info["title"]))
            if exists.scalar_one_or_none():
                print(f"Session {s_info['title']} already exists.")
                continue

            session = ContestSession(
                title=s_info["title"],
                start_date=dt - timedelta(days=30),
                end_date=dt,
                status="completed",
                created_at=dt
            )
            db.add(session)
            await db.flush()

            # Add winners for this session (one per category)
            for cat in categories:
                # Pick a random blogger for variety
                cat_bloggers = [b for b in bloggers if b.category_id == cat.id]
                if not cat_bloggers: continue
                
                winner_blogger = random.choice(cat_bloggers)
                votes = random.randint(5000, 25000)
                
                winner = Winner(
                    session_id=session.id,
                    blogger_id=winner_blogger.id,
                    category_id=cat.id,
                    total_votes=votes,
                    rank=1,
                    created_at=dt
                )
                db.add(winner)
            
            print(f"Created session: {s_info['title']}")
        
        await db.commit()
        print("--- HISTORY SEEDING COMPLETE ---")

if __name__ == "__main__":
    asyncio.run(seed_history())
