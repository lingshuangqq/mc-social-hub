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

## Phase 6: PC Web Adaptation
- [ ] **Task 6.1: Responsive Layout & Navigation**
  - Implement `ResponsiveShell` component.
  - Show `BottomNav` on mobile (< md), `SideNav` on desktop (>= md).
  - Adjust main container max-width for desktop (centered).
- [ ] **Task 6.2: Desktop Modals**
  - Update `PostDetailModal` and `CreatePostModal` to be centered dialogs on desktop (max-width + backdrop), instead of full-screen.
- [ ] **Task 6.3: Adaptive Masonry Grid**
  - Update `MasonryGrid` to support 3 or 4 columns on large screens.
- [ ] **Task 6.4: Right Sidebar (Widgets)**
  - Create desktop-only right column.
  - Add widgets: "Who to follow", "Trending Tags", "User Mini Profile".