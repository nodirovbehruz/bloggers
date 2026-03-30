import asyncio
from app.core.database import async_session
from app.models.models import ContestSession, Winner
from sqlalchemy import select

async def check():
    async with async_session() as db:
        res = await db.execute(select(ContestSession))
        sessions = res.scalars().all()
        print(f"Sessions: {[{'id': s.id, 'title': s.title} for s in sessions]}")
        
        res = await db.execute(select(Winner))
        winners = res.scalars().all()
        print(f"Winners count: {len(winners)}")

if __name__ == "__main__":
    asyncio.run(check())
