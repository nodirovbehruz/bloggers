import asyncio
from app.core.database import async_session, init_db
from app.models.models import Blogger, Category, BloggerStatus, ContestSettings, ContestSession, Winner
from sqlalchemy import select, update, delete
from datetime import datetime

async def test_winners():
    await init_db()
    async with async_session() as db:
        print("--- STARTING WINNERS TEST ---")
        
        # 1. Reset everything first for clean test
        await db.execute(delete(Winner))
        await db.execute(delete(ContestSession))
        
        # 2. Ensure categories exist
        cats_res = await db.execute(select(Category))
        categories = cats_res.scalars().all()
        if not categories:
            print("No categories found. Please seed them first.")
            return

        # 3. Give votes to some bloggers in each category
        for cat in categories:
            bloggers_res = await db.execute(
                select(Blogger).where(Blogger.category_id == cat.id, Blogger.status == BloggerStatus.APPROVED)
            )
            bloggers = bloggers_res.scalars().all()
            if not bloggers:
                continue
            
            # Winner 1
            bloggers[0].total_votes = 1000
            if len(bloggers) > 1:
                bloggers[1].total_votes = 500
            print(f"Set votes for category: {cat.name} -> {bloggers[0].full_name} (1000), {bloggers[1].full_name if len(bloggers)>1 else ''} (500)")

        # 4. Activate contest in settings if needed
        settings_res = await db.execute(select(ContestSettings).where(ContestSettings.id == 1))
        settings = settings_res.scalar_one_or_none()
        if not settings:
            settings = ContestSettings(id=1, contest_active=True, start_date="2026-03-01T00:00:00")
            db.add(settings)
        else:
            settings.contest_active = True
        
        await db.commit()
        print("DB State ready for finishing contest.")

        # 5. Call the logic (manual simulation of the endpoint)
        session = ContestSession(
            title="Тестовый Конкурс Март 2026",
            start_date=datetime(2026, 3, 1),
            end_date=datetime.utcnow(),
            status="completed"
        )
        db.add(session)
        await db.flush()

        winners_added = 0
        for cat in categories:
            winner_query = await db.execute(
                select(Blogger)
                .where(Blogger.category_id == cat.id, Blogger.status == BloggerStatus.APPROVED)
                .order_by(Blogger.total_votes.desc())
                .limit(1)
            )
            top = winner_query.scalar_one_or_none()
            if top and top.total_votes > 0:
                w = Winner(
                    session_id=session.id,
                    blogger_id=top.id,
                    category_id=cat.id,
                    total_votes=top.total_votes,
                    rank=1
                )
                db.add(w)
                winners_added += 1
        
        # Reset votes
        await db.execute(update(Blogger).values(total_votes=0))
        settings.contest_active = False
        
        await db.commit()
        print(f"SUCCESS: Created session '{session.title}' with {winners_added} winners.")
        print("Contest deactivated, all blogger votes reset to 0.")

if __name__ == "__main__":
    asyncio.run(test_winners())
