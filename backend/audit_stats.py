import asyncio
from database import AsyncSessionLocal
from models import User, Post, PostLike, PostCollection
from sqlalchemy.future import select
from sqlalchemy import func

async def audit_stats():
    async with AsyncSessionLocal() as db:
        # 1. List Users
        users = (await db.execute(select(User))).scalars().all()
        print(f"--- Audit: {len(users)} Users Found ---")
        
        for user in users:
            print(f"\nUser: {user.name} ({user.email}, ID: {user.id})")
            
            # 2. Get User's Posts
            posts = (await db.execute(select(Post).where(Post.user_id == user.id))).scalars().all()
            print(f"  Posts Created: {len(posts)}")
            
            total_likes_received = 0
            total_collections_received = 0
            
            for post in posts:
                # Count Likes for this post
                likes = (await db.execute(select(func.count()).select_from(PostLike).where(PostLike.post_id == post.id))).scalar()
                
                # Count Collections for this post
                collections = (await db.execute(select(func.count()).select_from(PostCollection).where(PostCollection.post_id == post.id))).scalar()
                
                total_likes_received += likes
                total_collections_received += collections
                
                if likes > 0 or collections > 0:
                    print(f"    - Post {post.id}: {likes} Likes, {collections} Collections")
            
            calculated_total = total_likes_received + total_collections_received
            print(f"  > CALCULATED Stats: Likes+Collects = {calculated_total}")

if __name__ == "__main__":
    asyncio.run(audit_stats())
