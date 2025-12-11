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

## Phase 4: Enterprise Ready & Social Engagement (Completed)
- [x] **Task 4.1: Security & Access Control (Allowlist)**
  - Add `AllowedEmail` model.
  - Implement Import Script (CSV support, incremental update).
  - Enforce Allowlist check in Google Auth login flow.
- [x] **Task 4.2: UX Polish (Lightbox)**
  - Integrate `yet-another-react-lightbox` for immersive image viewing.
  - Support pinch-zoom and swipe gestures.
- [x] **Task 4.3: Performance (Infinite Scroll)**
  - Implement pagination for `/api/feed`.
  - Add Infinite Scroll to Frontend.
- [x] **Task 4.4: Social Graph (Follow System)**
  - Add `UserFollow` model.
  - Implement Follow/Unfollow APIs.
  - Real stats on User Profile.
  - Frontend: Follow Button & Stats update on Public/My Profile.
- [x] **Task 4.5: Notification System**
  - Add `Notification` model.
  - Track likes/comments/follows/collects.
  - Notification UI with correct text and icons for all types.

## Phase 5: Content Discovery & Enhancement
- [x] **Task 5.1: Public User Profile**
  - Backend: `GET /api/users/{id}` for public profile data and `is_following` status.
  - Backend: `GET /api/users/{id}/posts` for user's posts.
  - Frontend: `PublicProfileView.tsx` to display other users' profiles.
  - Frontend: Integrate navigation from `PostDetailModal` to `PublicProfileView`.
- [x] **Task 5.2: Explore Page (Grid Categories)**
  - Backend: Enhance `GET /api/feed` to support `tag` filtering (based on `ai_keywords`, `title`, `content`).
  - Frontend: Create `ExploreView.tsx` with a grid of categorical icons for filtering posts.
  - Frontend: Update `BottomNav.tsx` to a 5-item layout including the new 'Explore' tab.
- [x] **Task 5.3: Post Tagging**
  - Backend: Update `CreatePostRequest` to accept `tags` list.
  - Backend: Implemented `analyze_post_content` using Gemini 1.5 Pro to auto-generate standard categories (Food, Work, etc.) and descriptive tags from text & images.
  - Frontend: `CreatePostModal` UI for selecting/adding tags to posts. 
- [x] **Task 5.4: Bug Fixes & Refinements**
  - Implemented auto-redirect to `PostDetailModal` after posting.
  - Fixed `ExploreView` refresh logic using `refreshKey`.
  - Implemented "Hot/Recommend" logic in backend (sort by likes count).
  - Fixed Search clear behavior.

## Phase 6: PC Web Adaptation
**Objective:** Provide a first-class experience on desktop browsers without maintaining a separate codebase. Use CSS Media Queries and React Conditional Rendering to adapt the UI.

- [ ] **Task 6.1: Responsive Layout Architecture**
  - **Goal:** Transform from Mobile-only to Responsive.
  - **Implementation:**
    - Create `layout/MainLayout.tsx`.
    - Use Tailwind breakpoints (`md`, `lg`, `xl`).
    - **Mobile (< 768px):** Keep current layout (Header + Content + BottomNav).
    - **Desktop (>= 768px):** 
      - **Left:** Navigation Sidebar (Logo, Menu Items, Post Button).
      - **Center:** Feed / Content (Width limited to ~600px-800px).
      - **Right:** Auxiliary Panel (Profile Summary, Suggestions).
  
- [ ] **Task 6.2: Desktop Modals**
  - **Goal:** Modals should look like dialogs, not full pages.
  - **Implementation:**
    - Refactor `CreatePostModal` and `PostDetailModal`.
    - On Desktop: Fixed width/height, rounded corners, centered overlay with backdrop blur.
    - On Mobile: `fixed inset-0` (Full screen).

- [ ] **Task 6.3: Adaptive Grid**
  - **Goal:** Use screen real estate efficiently.
  - **Implementation:**
    - `MasonryGrid`: 2 columns (Mobile) -> 3 columns (Tablet) -> 4 columns (Desktop).

- [ ] **Task 6.4: Right Sidebar Widgets**
  - **Goal:** Enhance engagement on desktop.
  - **Implementation:**
    - `UserCard`: Mini profile view.
    - `TrendingTags`: List of popular tags from `api/feed?sort=hot`.
    - `WhoToFollow`: Random recommendation of users not yet followed.