import sys
import os
import asyncio

# Add parent directory to path so we can import app modules
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy.future import select
from database import engine, AsyncSessionLocal, Base
from models import AllowedEmail, User

async def init_allowlist_from_existing_users():
    print("--- Starting One-Time Migration: Users -> AllowedEmails ---")
    
    # 1. Ensure Table Exists (Idempotent)
    print("DEBUG: Checking/Creating database schema...")
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    print("DEBUG: Schema check complete.")

    async with AsyncSessionLocal() as db:
        try:
            # 2. Get all existing users
            result = await db.execute(select(User))
            users = result.scalars().all()
            
            if not users:
                print("No existing users found in 'users' table. Nothing to backfill.")
                return

            print(f"Found {len(users)} existing users. Processing...")
            
            count = 0
            skipped = 0
            
            for user in users:
                email = user.email.lower().strip()
                
                # Check if already in allowlist
                check = await db.execute(select(AllowedEmail).where(AllowedEmail.email == email))
                if not check.scalars().first():
                    # Add to allowlist
                    # We use their current display name and mark department as 'Legacy'
                    new_entry = AllowedEmail(
                        email=email, 
                        name=user.name, 
                        department="Legacy User (Backfilled)"
                    )
                    db.add(new_entry)
                    count += 1
                    print(f"  [+] Backfilled: {email} ({user.name})")
                else:
                    skipped += 1
                    # print(f"  [.] Skipped: {email} (Already allowed)")
            
            await db.commit()
            print(f"--- Migration Complete ---")
            print(f"Successfully backfilled: {count}")
            print(f"Skipped (Already existed): {skipped}")

        except Exception as e:
            print(f"CRITICAL ERROR during migration: {e}")
            await db.rollback()

if __name__ == "__main__":
    asyncio.run(init_allowlist_from_existing_users())
