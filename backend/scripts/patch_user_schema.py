import sys
import os
import asyncio
from sqlalchemy import text

# Add parent directory
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from database import engine

async def migrate_users_table():
    print("Migrating users table to add bio, title, location...")
    async with engine.begin() as conn:
        try:
            await conn.execute(text("ALTER TABLE users ADD COLUMN bio VARCHAR"))
            print("Added column: bio")
        except Exception as e:
            print(f"Bio column might exist: {e}")

        try:
            await conn.execute(text("ALTER TABLE users ADD COLUMN title VARCHAR"))
            print("Added column: title")
        except Exception as e:
            print(f"Title column might exist: {e}")

        try:
            await conn.execute(text("ALTER TABLE users ADD COLUMN location VARCHAR"))
            print("Added column: location")
        except Exception as e:
            print(f"Location column might exist: {e}")

if __name__ == "__main__":
    asyncio.run(migrate_users_table())
