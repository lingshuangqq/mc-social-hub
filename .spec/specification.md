# Functional Specification: MC Social Hub

## 1. Authentication & User Management
- **Flow:**
  1. **App Launch:** Check local Token (JWT).
  2. **If valid:** Direct navigation to Discovery Feed.
  3. **If invalid:** Display simple "Welcome to MC Hub" screen with "Login with Google" button (MC Navy background).
  4. **Backend Logic:** 
     - Validate Google ID Token (google-auth).
     - **JIT Provisioning:** Create/Update User record with real Google Profile data (Name, Avatar).
     - Issue Session Token (UserID).

## 2. Discovery Feed (Home)
- **Layout:** **Virtual Masonry Grid** (JS-controlled Dual Column).
  - **Dynamic Height:** Cards adapt to image aspect ratio and text length.
  - **Content Rules:** 
    - If Title exists: Show Title (Bold, 2 lines max) + Content (1 line).
    - If No Title: Show Content (3 lines max).
    - "Untitled" placeholder is forbidden.
- **Header:** MC Logo, Search, User Avatar.

## 3. Post Creation
- **UI:** Full-screen Modal with slide-up animation.
- **Features:**
  - Multi-image selection & preview (Horizontal scroll).
  - Image deletion before upload.
  - Optional Title.
  - Auto-upload to local static storage.

## 4. Post Detail & Interactions
- **View:** Full-screen Mobile-First Modal (Vertical Scroll).
  - **Top:** Navigation (Back).
  - **Media:** Image Carousel with dots indicator.
  - **Info:** Author row, Title, Full Content.
  - **Bottom Bar:** Fixed interaction bar (Like, Collect, Comment Input).
- **Comments:** Supports **Nested Replies** (Reply to specific comment).

## 5. User Profile
- **Header:** Custom Banner, Floating Avatar, Stats (Following/Followers/Likes).
- **Tabs:** "My Posts" | "Collects".
- **Content:** Reuses Masonry Grid component.

## 6. Public User Profile
- **Purpose:** Allow users to view other users' profiles.
- **Entry Point:** Clicking on an author's avatar/name in Feed or Post Detail.
- **UI:** Similar to user's own profile, but includes:
  - "Follow / Unfollow" button.
  - Only public-facing stats (e.g., Posts, Followers, Following, Total Likes & Collects on their posts).
- **API:**
  - `GET /api/users/{id}`: Fetch user profile and `is_following` status.
  - `GET /api/users/{id}/posts`: Fetch user's public posts.

## 7. Explore Page (Topics/Tags)
- **Purpose:** Discover content by predefined themes or tags.
- **UI:** Top section with a grid of categorical icons (e.g., Life, Work, Food, Event, Tech), acting as filters.
- **Content:** Below the category grid, a Masonry Grid displays posts filtered by the selected category.
- **API:** `GET /api/feed?tag={category_name}`: Filter posts by keyword/tag (matching `ai_keywords`, `title`, or `content`).

## 8. Notifications System
- **Purpose:** Inform users about interactions (likes, comments, follows, collects).
- **API:**
  - `POST /api/posts/{post_id}/like`: Triggers `like` notification.
  - `POST /api/posts/{post_id}/collect`: Triggers `collect` notification.
  - `POST /api/posts/{post_id}/comments`: Triggers `comment` notification.
  - `POST /api/users/{target_id}/follow`: Triggers `follow` notification.
  - `GET /api/notifications`: Fetch user notifications.
  - `POST /api/notifications/read`: Mark notifications as read.
- **UI:** `NotificationsView.tsx` handles display with appropriate icons and text for each notification type.

## 9. System Improvements & Bug Fixes
- **Authentication:** `qianqianyinian@gmail.com` added to allowlist.
- **Data Consistency:** Ensured correct calculation of "Likes & Collects" stats on user profiles.
- **API Robustness:** Fixed backend routing ambiguity to prevent 422 errors.
- **Database Path:** Standardized SQLite database path to use an absolute path, preventing database file inconsistencies due to varying execution directories.

## 10. Design System
- **Colors:** MC Navy (#002A54) & MC Orange (#F58220).
- **Typography:** Inter/System Stack.
- **Interaction:** Optimistic UI for all toggle actions (Like/Collect).

## 11. Responsive Design Specification (Phase 6)

### 11.1 Breakpoints
- **Mobile (< 768px)**: Single column, bottom navigation, full-screen modals.
- **Tablet (768px - 1024px)**: 3-column masonry grid, side navigation.
- **Desktop (>= 1024px)**: 
  - **Layout**: 3-Column (SideNav 256px | Main Content max 896px | Right Sidebar 320px).
  - **Masonry Grid**: 4 columns.

### 11.2 Component Adaptation
| Component | Mobile Behavior | Desktop Behavior |
| :--- | :--- | :--- |
| **Navigation** | Fixed Bottom Bar | Fixed Left Sidebar |
| **Post Feed** | 2-Column Masonry | 3 or 4-Column Masonry |
| **Post Detail** | Full-screen Page | **Split-Screen Dialog** (Left: Media, Right: Info) |
| **Create Post** | Full-screen Page | Centered Dialog (Fixed Size) |
| **Right Sidebar**| Hidden | Visible (Search, Trending, Suggestions) |