# Implementation Plan: MC Social Hub (As-Built)

## 1. Backend Architecture (FastAPI)
- **Stack:** Python 3.12, FastAPI, SQLAlchemy (Async), SQLite (aiosqlite).
- **Auth:** Google OAuth2 (ID Token verification).
- **Models:**
  - `User`, `Post`, `Comment` (Self-referential for replies), `PostLike`, `PostCollection`.
- **API Endpoints:**
  - `POST /api/auth/google`: Login/Register.
  - `GET /api/feed`: Main feed.
  - `POST /api/posts`: Create post.
  - `POST /api/upload`: Local file upload (`static/uploads`).
  - `GET /api/posts/{id}`: Detail view.
  - `POST /api/posts/{id}/{like|collect|comments}`: Interactions.
  - `GET /api/users/me/{profile|posts|collections}`: User profile data.

## 2. Frontend Architecture (React/Vite)
- **Stack:** React 18, TypeScript, Tailwind CSS, Zustand, Axios.
- **State Management:**
  - `useAuthStore`: Persist User/Token.
  - Local State for Modals/Feeds.
- **Key Components:**
  - `MasonryGrid`: Virtual column layout logic.
  - `PostDetailModal`: Complex interaction view.
  - `CreatePostModal`: Form & Upload logic.
  - `ProfileView`: User dashboard.

## 3. Database Schema
- **Users:** `id, email, name, avatar_url, google_sub`
- **Posts:** `id, user_id, title, content, images (JSON), created_at`
- **Comments:** `id, post_id, user_id, content, parent_id`
- **Likes/Collections:** Join tables for many-to-many.