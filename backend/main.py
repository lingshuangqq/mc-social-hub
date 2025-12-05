from fastapi import FastAPI, Depends, HTTPException, Body, UploadFile, File, Header
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from dotenv import load_dotenv
import os

load_dotenv()

# Fix for Cloud Run: If GOOGLE_APPLICATION_CREDENTIALS is set but empty or local path in prod, 
# it breaks the default Service Account auth.
if os.getenv("K_SERVICE") or os.getenv("GOOGLE_CLOUD_PROJECT"):
    cred_path = os.getenv("GOOGLE_APPLICATION_CREDENTIALS")
    if cred_path is not None:
        # If it's empty, or if it looks like a local Mac path but we are in Linux/Cloud Run
        if cred_path == "" or (cred_path.startswith("/Users/") and os.path.exists("/app")):
            print(f"DEBUG: Removing invalid GOOGLE_APPLICATION_CREDENTIALS='{cred_path}' to use Service Account.")
            del os.environ["GOOGLE_APPLICATION_CREDENTIALS"]

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload
from sqlalchemy import func
from pydantic import BaseModel
from database import get_db, engine, Base
from models import User, Post, Comment, PostLike, PostCollection
from contextlib import asynccontextmanager
from google.oauth2 import id_token
from google.auth.transport import requests as google_requests
import os
import shutil
import uuid
from typing import Optional, List
from google import genai
from google.genai import types
import json
from pathlib import Path

GOOGLE_CLIENT_ID = "961699257299-6vh3d2a6pvq52qg2jl8lpbrtsb2gc4k5.apps.googleusercontent.com"

# Configure Gemini (Vertex AI)
GOOGLE_CLOUD_PROJECT = os.getenv("GOOGLE_CLOUD_PROJECT")
GOOGLE_CLOUD_LOCATION = os.getenv("GOOGLE_CLOUD_LOCATION", "us-central1")

client = None
if GOOGLE_CLOUD_PROJECT:
    try:
        client = genai.Client(
            vertexai=True, 
            project=GOOGLE_CLOUD_PROJECT, 
            location=GOOGLE_CLOUD_LOCATION
        )
    except Exception as e:
        print(f"Failed to initialize Vertex AI Client: {e}")

async def analyze_images(image_paths: List[str]) -> str:
    """
    Uses Gemini Vision (Vertex AI) to generate search keywords for images.
    """
    if not client or not image_paths:
        return ""
    
    try:
        # Prepare images
        parts = [types.Part.from_text("Describe these images for a search engine index. Include objects, style (e.g. renovation, food, minimalist), colors, and text in the image. Return a single paragraph description followed by 10 key tags.")]
        
        for path in image_paths:
            if "static/uploads" in path:
                local_path = path.split("static/uploads")[-1].strip("/")
                full_path = Path("static/uploads") / local_path
                if full_path.exists():
                    with open(full_path, "rb") as f:
                        image_data = f.read()
                        # Simple mime type detection
                        mime_type = "image/jpeg" if full_path.suffix.lower() in ['.jpg', '.jpeg'] else "image/png"
                        parts.append(types.Part.from_bytes(data=image_data, mime_type=mime_type))
        
        if len(parts) <= 1: # Only text prompt
            return ""

        # Use a Vertex AI model
        response = client.models.generate_content(
            model='gemini-1.5-pro-002', 
            contents=[types.Content(parts=parts)]
        )
        return response.text
    except Exception as e:
        print(f"Image analysis failed: {e}")
        return ""

import sys

# ... (existing code)

@asynccontextmanager
async def lifespan(app: FastAPI):
    try:
        print("DEBUG: Starting Application Lifespan...")
        async with engine.begin() as conn:
            print("DEBUG: Connecting to DB for Schema Creation...")
            await conn.run_sync(Base.metadata.create_all)
            print("DEBUG: Schema Created Successfully.")
        os.makedirs("static/uploads", exist_ok=True)
        yield
    except Exception as e:
        print(f"CRITICAL ERROR during Startup: {e}")
        # We don't exit here to allow Cloud Run to at least log the error before the health check kills it
        # But practically, the app is dead.
        # Re-raising helps Cloud Run see the crash in logs immediately.
        raise e

app = FastAPI(title="MC Social Hub", lifespan=lifespan)

os.makedirs("static/uploads", exist_ok=True)
app.mount("/static", StaticFiles(directory="static"), name="static")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class GoogleAuthRequest(BaseModel):
    id_token: str

class CreatePostRequest(BaseModel):
    title: Optional[str] = None
    content: str
    images: List[str] = []

class CommentRequest(BaseModel):
    content: str
    parent_id: Optional[int] = None

async def get_current_user(authorization: str = Header(None), db: AsyncSession = Depends(get_db)):
    if not authorization:
        # For MVP/Testing if auth header missing, try to return first user or error
        # raise HTTPException(status_code=401, detail="Missing Token")
        # FALLBACK FOR DEV:
        res = await db.execute(select(User))
        return res.scalars().first()
    
    try:
        token = authorization.split(" ")[1]
        user_id = int(token)
        result = await db.execute(select(User).where(User.id == user_id))
        user = result.scalars().first()
        if not user:
            raise HTTPException(status_code=401, detail="User not found")
        return user
    except:
        raise HTTPException(status_code=401, detail="Invalid Token")

# ... (Auth & Upload endpoints same as before) ...
@app.get("/api/search")
async def search_posts(q: str, db: AsyncSession = Depends(get_db)):
    """
    Smart Search using Vertex AI to rank posts by relevance.
    Includes AI-generated image descriptions in the context.
    """
    # 1. Fetch all posts
    result = await db.execute(
        select(Post).options(selectinload(Post.author)).order_by(Post.created_at.desc())
    )
    all_posts = result.scalars().all()
    
    if not q:
        return all_posts

    # 2. Try Gemini AI Search (Vertex)
    if client:
        try:
            # Prepare data for Gemini (lightweight JSON)
            posts_data = []
            for p in all_posts:
                combined_text = f"Title: {p.title or ''}\nContent: {p.content}\nImage Context: {p.ai_keywords or ''}"
                posts_data.append({"id": p.id, "text": combined_text})
            
            prompt = f"""
            You are a semantic search engine for a community app.
            User Query: "{q}"
            
            I will provide a list of documents. Each has Title, Content, and "Image Context" (AI analysis of the attached images).
            
            Documents:
            {json.dumps(posts_data)}
            
            Task: 
            1. Analyze the query and the documents. 
            2. Find documents that match the query semantically. 
               - If the query asks for visual things (e.g., "renovation", "blue sky"), rely heavily on "Image Context".
               - If the query is textual, rely on Title/Content.
            3. Return a JSON array of Post IDs sorted by relevance.
            
            Output Format: [id1, id2, id3]
            """
            
            response = client.models.generate_content(
                model='gemini-1.5-pro-002',
                contents=prompt
            )
            
            content_text = response.text.strip()
            if content_text.startswith("```"):
                content_text = content_text.split("\n", 1)[1].rsplit("\n", 1)[0]
            
            relevant_ids = json.loads(content_text)
            
            ranked_posts = []
            post_map = {p.id: p for p in all_posts}
            
            for pid in relevant_ids:
                if pid in post_map:
                    ranked_posts.append(post_map[pid])
            
            return await enrich_posts_with_likes(db, ranked_posts)
            
        except Exception as e:
            print(f"AI Search failed: {e}, falling back to simple search.")

    # 3. Fallback
    filtered_posts = [
        p for p in all_posts 
        if q.lower() in (p.title or "").lower() 
        or q.lower() in p.content.lower()
        or (p.ai_keywords and q.lower() in p.ai_keywords.lower())
    ]
    return await enrich_posts_with_likes(db, filtered_posts)

@app.post("/api/admin/reindex")
async def admin_reindex_images(db: AsyncSession = Depends(get_db)):
    """
    Admin endpoint to analyze images for existing posts that lack ai_keywords.
    """
    result = await db.execute(select(Post))
    posts = result.scalars().all()
    
    count = 0
    for post in posts:
        if not post.ai_keywords and post.images:
            print(f"Analyzing images for Post {post.id}...")
            keywords = await analyze_images(post.images)
            post.ai_keywords = keywords
            count += 1
            
    await db.commit()
    return {"message": f"Re-indexed {count} posts."}

@app.post("/api/posts")
async def create_post(request: CreatePostRequest, user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    # Generate AI Keywords on creation
    ai_keywords = ""
    if request.images:
        # Run in background in real app, but for MVP await it (might take 2-3s)
        ai_keywords = await analyze_images(request.images)

    new_post = Post(
        user_id=user.id, 
        title=request.title, 
        content=request.content, 
        images=request.images,
        ai_keywords=ai_keywords
    )
    db.add(new_post)
    await db.commit()
    await db.refresh(new_post)
    return new_post

@app.post("/api/auth/google")
async def google_auth(request: GoogleAuthRequest, db: AsyncSession = Depends(get_db)):
    try:
        idinfo = id_token.verify_oauth2_token(request.id_token, google_requests.Request(), GOOGLE_CLIENT_ID)
        email = idinfo['email']
        name = idinfo.get('name', 'Unknown')
        picture = idinfo.get('picture', '')
        google_sub = idinfo['sub']

        result = await db.execute(select(User).where(User.email == email))
        user = result.scalars().first()
        
        if not user:
            user = User(email=email, name=name, google_sub=google_sub, avatar_url=picture)
            db.add(user)
        else:
            user.name = name
            user.avatar_url = picture
            
        await db.commit()
        await db.refresh(user)
        
        return {"access_token": str(user.id), "user": {"id": user.id, "name": user.name, "avatar": user.avatar_url, "email": user.email}}
    except ValueError:
        raise HTTPException(status_code=401, detail="Invalid Token")

from google.cloud import storage

from fastapi.responses import FileResponse



# ... (existing imports)



# Configure GCS

GCS_BUCKET_NAME = os.getenv("GCS_BUCKET_NAME")



# ... (existing code)



@app.post("/api/upload")



async def upload_file(file: UploadFile = File(...)):



    file_ext = file.filename.split(".")[-1]



    filename = f"{uuid.uuid4()}.{file_ext}"



    



    if GCS_BUCKET_NAME:



        try:



            storage_client = storage.Client()



            bucket = storage_client.bucket(GCS_BUCKET_NAME)



            blob = bucket.blob(filename)



            blob.upload_from_file(file.file, content_type=file.content_type)



            return {"url": f"https://storage.googleapis.com/{GCS_BUCKET_NAME}/{filename}"}



        except Exception as e:



            print(f"GCS Upload Error: {e}")



            raise HTTPException(500, "File upload failed")



    else:



        file_path = f"static/uploads/{filename}"



        with open(file_path, "wb") as buffer:



            shutil.copyfileobj(file.file, buffer)



        return {"url": f"http://localhost:8000/{file_path}"}







async def enrich_posts_with_likes(db: AsyncSession, posts: List[Post]):



    """



    Helper to attach like and collection counts to a list of posts.



    Returns a list of dictionaries.



    """



    results = []



    for post in posts:



        # Count likes



        like_count_res = await db.execute(select(func.count()).select_from(PostLike).where(PostLike.post_id == post.id))



        like_count = like_count_res.scalar()



        



        # Count collections



        collect_count_res = await db.execute(select(func.count()).select_from(PostCollection).where(PostCollection.post_id == post.id))



        collect_count = collect_count_res.scalar()



        



        # Convert to dict (Pydantic-ish)



        p_dict = {



            "id": post.id,



            "title": post.title,



            "content": post.content,



            "images": post.images,



            "created_at": post.created_at,



            "author": post.author, # ORM object



            "likes": like_count,



            "collections": collect_count,



            "ai_keywords": post.ai_keywords



        }



        results.append(p_dict)



    return results







@app.get("/api/feed")



async def get_feed(db: AsyncSession = Depends(get_db)):



    result = await db.execute(



        select(Post)



        .options(selectinload(Post.author))



        .order_by(Post.created_at.desc())



    )



    posts = result.scalars().all()



    return await enrich_posts_with_likes(db, posts)







@app.get("/api/posts/{post_id}")



async def get_post_detail(post_id: int, user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):



    result = await db.execute(



        select(Post)



        .where(Post.id == post_id)



        .options(



            selectinload(Post.author), 



            selectinload(Post.comments).selectinload(Comment.author)



        )



    )



    post = result.scalars().first()



    if not post:



        raise HTTPException(404, "Post not found")



        



    # Check interactions



    like_res = await db.execute(select(PostLike).where(PostLike.post_id == post_id, PostLike.user_id == user.id))



    is_liked = like_res.scalar() is not None



    



    collect_res = await db.execute(select(PostCollection).where(PostCollection.post_id == post_id, PostCollection.user_id == user.id))



    is_collected = collect_res.scalar() is not None



    



    like_count_res = await db.execute(select(func.count()).select_from(PostLike).where(PostLike.post_id == post_id))



    like_count = like_count_res.scalar()







    collection_count_res = await db.execute(select(func.count()).select_from(PostCollection).where(PostCollection.post_id == post_id))



    collection_count = collection_count_res.scalar()







    return {



        "post": post,



        "is_liked": is_liked,



        "is_collected": is_collected,



        "like_count": like_count,



        "collection_count": collection_count



    }







@app.post("/api/posts/{post_id}/like")



async def toggle_like(post_id: int, user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):



    result = await db.execute(select(PostLike).where(PostLike.post_id == post_id, PostLike.user_id == user.id))



    existing = result.scalars().first()



    if existing:



        await db.delete(existing)



        liked = False



    else:



        db.add(PostLike(post_id=post_id, user_id=user.id))



        liked = True



    await db.commit()



    return {"liked": liked}







@app.post("/api/posts/{post_id}/collect")



async def toggle_collect(post_id: int, user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):



    result = await db.execute(select(PostCollection).where(PostCollection.post_id == post_id, PostCollection.user_id == user.id))



    existing = result.scalars().first()



    if existing:



        await db.delete(existing)



        collected = False



    else:



        db.add(PostCollection(post_id=post_id, user_id=user.id))



        collected = True



    await db.commit()



    return {"collected": collected}







@app.post("/api/posts/{post_id}/comments")



async def add_comment(post_id: int, request: CommentRequest, user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):



    comment = Comment(post_id=post_id, user_id=user.id, content=request.content, parent_id=request.parent_id)



    db.add(comment)



    await db.commit()



    await db.refresh(comment)



    return {"status": "ok"}







@app.get("/api/users/me")



async def get_my_profile(user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):



    post_count = await db.execute(select(func.count()).select_from(Post).where(Post.user_id == user.id))



    



    return {



        "user": user,



        "stats": {



            "posts": post_count.scalar(),



            "following": 42, # Mock



            "followers": 108, # Mock



            "likes_collected": 890 # Mock



        }



    }







@app.get("/api/users/me/posts")



async def get_my_posts(user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):



    result = await db.execute(



        select(Post)



        .where(Post.user_id == user.id)



        .options(selectinload(Post.author))



        .order_by(Post.created_at.desc())



    )



    posts = result.scalars().all()



    return await enrich_posts_with_likes(db, posts)







@app.get("/api/users/me/collections")



async def get_my_collections(user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):



    result = await db.execute(



        select(Post)



        .join(PostCollection, Post.id == PostCollection.post_id)



        .where(PostCollection.user_id == user.id)



        .options(selectinload(Post.author))



        .order_by(PostCollection.post_id.desc())



    )



    posts = result.scalars().all()



    return await enrich_posts_with_likes(db, posts)







@app.get("/api/users/me/likes")



async def get_my_likes(user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):



    result = await db.execute(



        select(Post)



        .join(PostLike, Post.id == PostLike.post_id)



        .where(PostLike.user_id == user.id)



        .options(selectinload(Post.author))



        .order_by(PostLike.post_id.desc())



    )



    posts = result.scalars().all()



    return await enrich_posts_with_likes(db, posts)







# --- Serve Frontend (SPA) ---

# Place this AT THE END of the file, after all API routes

frontend_dist = Path("../frontend/dist")

if frontend_dist.exists():

    app.mount("/assets", StaticFiles(directory=str(frontend_dist / "assets")), name="assets")

    

    @app.get("/{full_path:path}")

    async def serve_spa(full_path: str):

        # If API route didn't match above, and it's not an asset, serve index.html

        if full_path.startswith("api/") or full_path.startswith("static/"):

            raise HTTPException(404, "Not found")

        return FileResponse(str(frontend_dist / "index.html"))

else:

    print("Frontend build not found. Run 'npm run build' in frontend directory.")



if __name__ == "__main__":

    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8000)


