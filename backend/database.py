from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker, declarative_base
import os
import sys

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite+aiosqlite:///./mc_social.db")

# Fix for SQLAlchemy requiring postgresql+asyncpg scheme
if DATABASE_URL and DATABASE_URL.startswith("postgresql://"):
    DATABASE_URL = DATABASE_URL.replace("postgresql://", "postgresql+asyncpg://", 1)

# Debug Logging
print(f"DEBUG: Database Configuration Loaded. Driver: {'SQLite' if 'sqlite' in DATABASE_URL else 'Postgres'}")
if "cloudsql" in DATABASE_URL:
    print(f"DEBUG: Attempting Cloud SQL Connection via Socket.")

connect_args = {"check_same_thread": False} if "sqlite" in DATABASE_URL else {}

try:
    engine = create_async_engine(DATABASE_URL, connect_args=connect_args, echo=True) # Enable SQL Echo for debug
    AsyncSessionLocal = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)
    Base = declarative_base()
except Exception as e:
    print(f"CRITICAL: Failed to create DB Engine: {e}")
    sys.exit(1)

async def get_db():
    async with AsyncSessionLocal() as session:
        yield session
