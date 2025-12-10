import csv
import sys
import os
import asyncio
import argparse

# Add parent directory to path so we can import app modules
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy.future import select
from database import engine, AsyncSessionLocal, Base
from models import AllowedEmail

async def import_employees_csv(csv_path: str):
    print(f"--- Starting Employee Import from CSV: {csv_path} ---")
    
    if not os.path.exists(csv_path):
        print(f"Error: File {csv_path} not found.")
        return

    # 1. Ensure Table Exists
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    async with AsyncSessionLocal() as db:
        try:
            with open(csv_path, 'r', encoding='utf-8') as f:
                reader = csv.DictReader(f)
                
                # Validate headers
                if not {'email'}.issubset(reader.fieldnames):
                     print("Error: CSV must contain 'email' column.")
                     return

                count = 0
                updated_count = 0
                
                for row in reader:
                    email = row.get('email', '').strip().lower()
                    if not email:
                        continue
                        
                    name = row.get('name', '').strip()
                    department = row.get('department', '').strip()

                    # Check if exists
                    result = await db.execute(select(AllowedEmail).where(AllowedEmail.email == email))
                    existing = result.scalars().first()

                    if existing:
                        # Update fields (Upsert)
                        changed = False
                        if name and existing.name != name:
                            existing.name = name
                            changed = True
                        if department and existing.department != department:
                            existing.department = department
                            changed = True
                        
                        if changed:
                            updated_count += 1
                            print(f"  [U] Updated: {email}")
                    else:
                        # Create new
                        new_entry = AllowedEmail(email=email, name=name, department=department)
                        db.add(new_entry)
                        count += 1
                        print(f"  [+] Added: {email}")
                
                await db.commit()
                print(f"--- Import Summary ---")
                print(f"New Employees Added: {count}")
                print(f"Existing Records Updated: {updated_count}")

        except Exception as e:
            print(f"Error during import: {e}")
            await db.rollback()

async def main():
    parser = argparse.ArgumentParser(description="Import Allowed Emails from CSV")
    parser.add_argument('csv_file', type=str, help='Path to CSV file (headers: email, name, department)')
    
    args = parser.parse_args()
    
    if args.csv_file:
        await import_employees_csv(args.csv_file)
    else:
        parser.print_help()

if __name__ == "__main__":
    asyncio.run(main())