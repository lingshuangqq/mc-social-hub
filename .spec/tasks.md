# Actionable Tasks: MC Social Hub

## Phase 1: Foundation (Completed)
- [x] **Task 1.1:** Initialize Monorepo & Config (Tailwind colors).
- [x] **Task 1.2:** Database & Models (User).
- [x] **Task 1.3:** Auth API (Google Verify).
- [x] **Task 1.4:** Login UI (Brand integrated).

## Phase 2: Core Features (Completed)
- [x] **Task 2.1:** Post Model & Feed API.
- [x] **Task 2.2:** Local Image Upload (`/api/upload`).
- [x] **Task 2.3:** Post Creation UI (Modal + Multi-upload).
- [x] **Task 2.4:** Masonry Grid Implementation (JS-based).

## Phase 3: Interactions & Polish (Completed)
- [x] **Task 3.1:** Post Detail View (Mobile Layout).
- [x] **Task 3.2:** Interactions (Like/Collect/Comment).
- [x] **Task 3.3:** Nested Comments (Backend support & UI).
- [x] **Task 3.4:** User Profile Page (Tabs & Stats).
- [x] **Task 3.5:** UI Polish (Remove "Untitled", Better Grid).

## Phase 4: Enterprise Ready & Social Engagement
- [x] **Task 4.1:** Security: Allowlist Auth & Import Script
  - [x] Add `AllowedEmail` model to `backend/models.py`.
  - [x] Create `backend/scripts/import_employees.py` for CSV import.
  - [x] Initialize Allowlist with existing `User` records.
  - [x] Enforce Allowlist check in `POST /api/auth/google`.
- [x] **Task 4.2:** UX: Lightbox Image Viewer
  - [x] Install `yet-another-react-lightbox`.
  - [x] Implement Lightbox in `PostDetailModal`.
- [x] **Task 4.3:** Performance: Feed Pagination
  - [x] Update `GET /api/feed` to support `limit` and `offset`.
  - [x] Integrate `react-infinite-scroll-component` in Frontend.
- [x] **Task 4.4:** Feature: User Follow System
  - [x] Add `UserFollow` model.
  - [x] API: Follow/Unfollow endpoints.
  - [x] Frontend: Follow Button & Stats update.
- [x] **Task 4.5:** Feature: Notifications
  - [x] Add `Notification` model & triggers.
  - [x] Frontend: Notification List UI.

## Phase 5: Content Discovery & Enhancement (Completed)
- [x] **Task 5.1: Public User Profile**
  - Backend: `GET /api/users/{id}` for public profile data.
  - Frontend: `PublicProfileView.tsx` & Navigation.
- [x] **Task 5.2: Explore Page (Grid Categories)**
  - Frontend: `ExploreView.tsx` with Icon Grid & Search Header.
  - Logic: 'Recommend' sorts by popularity, others filter by tag.
- [x] **Task 5.3: Post Tagging**
  - Backend: `analyze_post_content` (Gemini AI) for auto-tagging.
  - Frontend: CreatePostModal Tag Selector & PostDetailModal Tag Display.
- [x] **Task 5.4: Bug Fixes & Refinements**
  - Auto-redirect to new post after creation.
  - Search clear reset logic.
  - Explore page refresh sync.

## Phase 6: PC Web Adaptation (Completed)
- [x] **Task 6.1: Responsive Layout Architecture**
  - [x] Implement `useMediaQuery` hook for JS-based responsive logic.
  - [x] Create `MobileLayout` (Header + Content + BottomNav).
  - [x] Create `DesktopLayout` (SideNav + Content + RightSidebar).
  - [x] Refactor `App.tsx` to automatically switch layouts based on screen width.
  - [x] Fix Desktop navigation issue (auto-close overlays on tab switch).
- [x] **Task 6.2: Desktop Modals**
  - [x] Update `CreatePostModal` to be a centered dialog on desktop.
  - [x] Update `PostDetailModal` to be a split-screen dialog (Left Media, Right Info) on desktop, matching Xiaohongshu style.
- [x] **Task 6.3: Adaptive Masonry Grid**
  - [x] Update `MasonryGrid` to support dynamic column count (2/3/4) based on screen width.
  - [x] Widen main content area in `DesktopLayout` to `max-w-4xl`.
- [x] **Task 6.4: Right Sidebar Widgets**
  - [x] Backend: Implement `/api/discovery/trending-tags` and `/api/discovery/suggested-users`.
  - [x] Frontend: Implement `RightSidebar` with real data fetching, Search integration, and Follow functionality.

## Phase 7: Optimization & Maintenance (Completed)
- [x] **Task 7.1: Image Performance Optimization**
  - [x] Backend: Integrate `Pillow` for image processing.
  - [x] Backend: Auto-resize originals (max 1920px) and generate thumbnails (max 480px).
  - [x] Backend: Convert all uploads to WebP format.
  - [x] Frontend: Update Grid to load `_thumb.webp` with fallback.
- [x] **Task 7.2: Production Database Stability**
  - [x] Implement `lifespan` startup check in `main.py` to auto-detect and add missing columns (`ai_keywords`, `bio`, etc.) to Cloud SQL.
  - [x] Create and execute SQL scripts for bulk user allowlist import.
- [x] **Task 7.3: UX/UI Polish**
  - [x] **iOS Viewport Fix**: Use `100dvh` and `pb-safe` to prevent Safari bottom bar overlap.
  - [x] **Focus Bug Fix**: Refactor React Modals to prevent input loss of focus.
  - [x] **Mobile Follow Button**: Move button to Author Info row for better usability.
- [x] **Task 7.4: Data Consistency**
  - [x] Unify Tags across Frontend (Explore), Backend (AI Prompt), and Create Modal to 9 standard categories.
  - [x] Update default placeholder image to branded 4:3 asset.

## Phase 8: Polish & Share (v1.1) (Completed)
- [x] **Task 8.1: Critical Bug Fixes**
  - [x] Investigate `DELETE /api/posts/{id}` endpoint.
  - [x] Fix frontend delete action in `PostDetailModal`. (Backend fix applied: manual cascade)
  - [x] Fix Feed flickering (Implemented Feed Cache in `useUIStore`).
- [x] **Task 8.2: Brand Identity**
  - [x] Process `logo.png` and add to `frontend/public/favicon.ico` (and PNGs).
  - [x] Update `index.html`.
- [x] **Task 8.3: Deep Linking**
  - [x] Refactor `App.tsx` routes.
  - [x] Create `PostDetailView` (standalone page wrapper).
  - [x] Extract `PostDetailContent` from Modal.
  - [x] Fix Back Button logic for direct links.
- [x] **Task 8.4: Share Poster**
  - [x] Create `ShareModal` component with `html2canvas`.
  - [x] Implement `/api/proxy-image` backend endpoint.
  - [x] Add "Send" icon to Post Detail.
  - [x] Implement "Share Image" (Native) & "Download" buttons.
  - [x] WeChat Login Overlay.
- [x] **Task 8.5: Admin Tools**
  - [x] `import_employees.py` optimization.
  - [x] Auto-sync CSV on startup.

## Phase 9: Stability & Refinement (v1.2) (Completed)
**Objective:** Resolve layout shift issues, optimize performance for mobile users (especially iOS), and refine the sharing experience.

- [x] **Task 9.1: Fix Layout Shift (Background Routing)**
  - **Issue:** Page content would jump/refresh when opening a modal.
  - **Fix:** Implemented standard **Nested Routing with Background Location** pattern in React Router v6.
  - **Implementation:**
    - Refactored `App.tsx` to handle `location.state.backgroundLocation`.
    - Created dedicated `PostDetailRoute` wrapper.
    - Updated `FeedView` (removed redundant `Outlet`).
    - Deleted legacy `GlobalModals` component.

- [x] **Task 9.2: Infinite Scroll Optimization**
  - **Issue:** "Loading more..." persisted even when no more data was available or data count was small.
  - **Fix:** 
    - Increased `PAGE_SIZE` to 20 for better fill.
    - Added defensive check in `InfiniteScroll` to hide loader if `posts.length < PAGE_SIZE`.
    - Ensured `hasMore` state in Store is correctly synchronized.

- [x] **Task 9.3: Share Poster Enhancement**
  - **Performance:** Implemented parallel image loading (`Promise.all`) to speed up generation.
  - **iOS Fix:** Changed hidden container from `opacity-0` to `fixed left-[-9999px]` to solve blank poster issues on Safari.
  - **Image Quality:** Switched from `<img>` to `<div>` with `background-image: cover` to fix aspect ratio distortion (stretching).
  - **Layout:** Limited modal height to `80dvh` with internal scrolling to accommodate mobile address bars.
  - **Stability:** Tuned generation delay to 300ms for optimal iOS rendering.

- [x] **Task 9.4: Codebase Cleanup**
  - Fix: TypeScript build errors (missing Store interfaces in `ui.ts`).
  - Cleanup: Removed unused variables (`navigate`, `memo`) and imports.
