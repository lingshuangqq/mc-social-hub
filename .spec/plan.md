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
- [x] **Task 3.5:** UI Polish (Remove "Untitled", Better Grid).

## Phase 4: Enterprise Ready & Social Engagement
- [ ] **Task 4.1: Security & Access Control (Allowlist)**
  - Add `AllowedEmail` model.
  - Implement Import Script (CSV support, incremental update).
  - Enforce Allowlist check in Google Auth login flow.
- [ ] **Task 4.2: UX Polish (Lightbox)**
  - Integrate `yet-another-react-lightbox` for immersive image viewing.
  - Support pinch-zoom and swipe gestures.
- [ ] **Task 4.3: Performance (Infinite Scroll)**
  - Implement pagination for `/api/feed`.
  - Add Infinite Scroll to Frontend.
- [ ] **Task 4.4: Social Graph (Follow System)**
  - Add `UserFollow` model.
  - Implement Follow/Unfollow APIs.
  - Real stats on User Profile.
- [ ] **Task 4.5: Notification System**
  - Add `Notification` model.
  - Track likes/comments/follows.
  - Notification UI.