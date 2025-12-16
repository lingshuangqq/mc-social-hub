# Implementation Plan: MC Social Hub (As-Built)

## 1. Backend Architecture (FastAPI)
- **Stack:** Python 3.12, FastAPI, SQLAlchemy (Async), SQLite (aiosqlite), **Pillow (Image Processing)**.
- **Auth:** Google OAuth2 (ID Token verification).
- **Models:**
  - `User`, `Post`, `Comment` (Self-referential for replies), `PostLike`, `PostCollection`.
  - **Schema Migration:** Auto-detection logic in `lifespan` startup event.
- **API Endpoints:**
  - `POST /api/auth/google`: Login/Register.
  - `GET /api/feed`: Main feed.
  - `POST /api/posts`: Create post (Auto-compress WebP).
  - `POST /api/upload`: Local/GCS upload.
  - `GET /api/posts/{id}`: Detail view.
  - `POST /api/posts/{id}/{like|collect|comments}`: Interactions.
  - `GET /api/users/me/{profile|posts|collections}`: User profile data.
  - `GET /api/discovery/{trending-tags|suggested-users}`: Desktop widgets.

## 2. Frontend Architecture (React/Vite)
- **Stack:** React 18, TypeScript, Tailwind CSS, Zustand, Axios.
- **Layout Strategy:**
  - **Responsive:** JS-based switching using `useMediaQuery`.
  - **Mobile:** `MobileLayout` (Top Header + Bottom Nav + **Safe Area Support**).
  - **Desktop:** `DesktopLayout` (Left SideNav + Center Content + Right Widgets).
- **State Management:**
  - `useAuthStore`: Persist User/Token.
  - `App.tsx`: Central controller for Routing and View state (Feed/Explore/Profile).
- **Key Components:**
  - `MasonryGrid`: Virtual column layout logic (Adaptive 2-4 cols).
  - `PostDetailModal`: Responsive overlay (Fullscreen on Mobile, Split-Screen on Desktop).
  - `CreatePostModal`: Responsive overlay.
  - `SideNav` & `RightSidebar`: Desktop navigation.

## 3. Database Schema
- **Users:** `id, email, name, avatar_url, google_sub`, `bio`, `title`, `location`.
- **Posts:** `id, user_id, title, content, images (JSON), created_at`, `ai_keywords`.
- **Comments:** `id, post_id, user_id, content, parent_id`.

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

## Phase 5: Content Discovery & Enhancement (Completed)
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

## Phase 6: PC Web Adaptation (Completed)
**Objective:** Provide a first-class experience on desktop browsers without maintaining a separate codebase.

- [x] **Task 6.1: Responsive Layout Architecture**
  - **Goal:** Clean separation of Mobile and Desktop layout code.
  - **Implementation:**
    - `useMediaQuery` hook for detection.
    - `MobileLayout`: Existing Stack (Header/BottomNav).
    - `DesktopLayout`: New 3-Column Grid (SideNav/Main/RightSidebar).
    - `App.tsx`: Handles View routing and passes content to active Layout.
  
- [x] **Task 6.2: Desktop Modals**
  - **Goal:** Modals should look like dialogs, not full pages.
  - **Implementation:**
    - Refactored `CreatePostModal` and `PostDetailModal`.
    - Desktop: Split-screen dialog (Left: Media, Right: Info) matching Xiaohongshu style.
    - Mobile: Full screen.

- [x] **Task 6.3: Adaptive Grid**
  - **Goal:** Use screen real estate efficiently.
  - **Implementation:**
    - `MasonryGrid`: 2 columns (Mobile) -> 3 columns (Tablet) -> 4 columns (Desktop).

- [x] **Task 6.4: Right Sidebar Widgets**
  - **Goal:** Enhance engagement on desktop.
  - **Implementation:**
    - `UserCard`: Mini profile view.
    - `TrendingTags`: List of popular tags from `api/feed?sort=hot`.
    - `WhoToFollow`: Random recommendation of users not yet followed.

## Phase 7: Optimization & Maintenance (Completed)
**Objective:** Polish the application for production stability, performance, and consistent UX.

- [x] **Task 7.1: Image Performance**
  - Backend uses `Pillow` to auto-compress uploads to WebP (max 1920px).
  - Backend auto-generates `_thumb.webp` thumbnails (max 480px).
  - Frontend loads thumbnails in Grid view.

- [x] **Task 7.2: Database Operations**
  - `lifespan` startup script automatically checks and patches missing columns in Cloud SQL (Zero-downtime migration).
  - Bulk User Allowlist Import via SQL scripts.

- [x] **Task 7.3: Data & UX Consistency**
  - Unified Tags: `[Life, Work, Event, Food, Clubs, Market, Tech, Welfare, Help]`.
  - iOS Fix: `100dvh` for bottom bar safety.
  - [x] Update default placeholder image to branded 4:3 asset.

## Phase 8: Polish & Share (v1.1) (Completed)
**Objective:** Enable social sharing via deep linking and poster generation, improve brand presence, and fix critical bugs.

- [x] **Task 8.1: Critical Bug Fixes**
  - Fix: Post deletion failing (Verify Backend API & Frontend integration).
  - Fix: Feed flickering on navigation (Implemented `useUIStore` with Feed Cache).
  
- [x] **Task 8.2: Brand Identity (Favicon & PWA)**
  - Add `logo.png` as browser favicon.
  - Implement PWA Manifest and iOS meta tags (optimized for white background).

- [x] **Task 8.3: Deep Linking Architecture**
  - **Goal:** Support `/post/:id` URL while maintaining the "Modal on Feed" experience.
  - **Implementation:**
    - Configure React Router for `/post/:id`.
    - Implement `useLocation` state to handle "Background Location".
    - Smart Back Button logic (History check vs. Redirect Home).

- [x] **Task 8.4: Social Sharing (Poster Generation)**
  - **Goal:** Enable "Share to WeChat" via image poster.
  - **Tech:** `html2canvas` + `qrcode.react`.
  - **Backend:** `/api/proxy-image` endpoint to bypass CORS and avoid local deadlocks.
  - **UI:**
    - "Send" icon in Post Detail.
    - **Share Modal:** Generates adaptive height poster.
    - **Mobile:** "Share Image" button (Native System Share).
    - **WeChat:** Overlay prompt to "Open in Browser" for Login.

- [x] **Task 8.5: Admin Tools**
  - Scripts for adding users without redeploy (`import_employees.py` optimized).
  - GitOps: Auto-sync allowlist from CSV on startup.