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