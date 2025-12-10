import sys
import os
import asyncio
from sqlalchemy import text

# Add parent directory
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from database import engine, Base

async def create_notification_table():
    print("Creating notifications table...")
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    print("Done.")

if __name__ == "__main__":
    asyncio.run(create_notification_table())
