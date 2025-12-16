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
- **Official Categories:**
  - **Grid Icons:** Recommend (Algo), Life, Work, Event, Food, Clubs, Market, Tech, Welfare, Help.
  - **AI Tagging:** Backend automatically assigns one or more of these tags to new posts.
- **Content:** Below the category grid, a Masonry Grid displays posts filtered by the selected category.
- **API:** `GET /api/feed?tag={category_name}`: Filter posts by keyword/tag.

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
| **Navigation** | Fixed Bottom Bar (Safe Area aware) | Fixed Left Sidebar |
| **Post Feed** | 2-Column Masonry | 3 or 4-Column Masonry |
| **Post Detail** | Full-screen Page (Follow btn below image) | **Split-Screen Dialog** (Left: Media, Right: Info) |

### 11.3 Navigation Architecture (Hybrid Deep Linking)
To ensure optimal performance (zero flickering) while maintaining shareable URLs:
- **State-Driven Modal:** The Post Detail view is controlled by React State (`selectedPostId`), not React Router.
- **Manual URL Management:** When opening a post, we use `window.history.pushState` to update the URL to `/post/:id` without triggering a full router transition.
- **Router Integration:** The `/post/:id` route is defined as a **child route** of the Home Feed. This ensures the `FeedView` remains mounted (Keep-Alive) when accessing a deep link directly.
- **Scroll Restoration:** Feed scroll position is cached in `useUIStore` and restored on mount.

## 12. Performance & Operations (Phase 7)

### 12.1 Image Optimization
- **Processing:** All uploads are processed by `Pillow`.
- **Formats:**
  - **Original:** WebP, Max Width 1920px, Quality 85.
  - **Thumbnail:** WebP, Max Width 480px, Quality 70 (suffix `_thumb.webp`).
- **Loading:** Frontend Grid loads thumbnails by default, Original only on Detail View.

### 12.2 Production Stability
- **Database Migration:** App implements a `lifespan` check on startup to inspect and auto-patch missing columns (e.g., `ai_keywords`, `bio`) in Cloud SQL, ensuring zero-downtime deployments.
- **Environment Isolation:** 
  - **Local:** Uses Vite Proxy for API/Static assets.
  - **Cloud:** Uses GCS for storage and same-origin API hosting.

## 13. Social Sharing (Phase 8)

### 13.1 Share Poster
- **Mechanism:** Client-side generation using `html2canvas`.
- **Content:**
  - Author Avatar & Name.
  - Main Image (Adaptive height, max 400px, `object-contain`).
  - Title & Content (JS truncated to ~80 chars).
  - Footer: "MC Social Hub" + QR Code (pointing to `/post/:id`).
- **CORS Handling:**
  - Backend provides `/api/proxy-image?url=...` endpoint.
  - Frontend fetches image as Blob URL to prevent "Tainted Canvas" errors.
  - Smart handling for Localhost (reads file directly) vs External (requests).

### 13.2 Platform Integration
- **Mobile (iOS/Android):**
  - Uses `navigator.share({ files: [...] })` to directly share the generated image to WeChat/WhatsApp.
  - Fallback: "Long press to save".
- **Desktop:**
  - "Download" button to save image locally.
  - "Link" button to copy URL.
- **WeChat Compatibility:**
  - **Login:** Detects MicroMessenger UA. If true, displays a full-screen overlay prompting user to "Open in Browser" (bypassing Google Auth restrictions).

## 14. Administration

### 14.1 User Allowlist
- **Source of Truth:** `backend/scripts/template_employees.csv` (and `add_employees.csv` for incremental).
- **Automation:**
  - **Startup Sync:** Application automatically syncs CSV emails to Database on startup (GitOps).
  - **Manual Script:** `import_employees.py` can be run manually to add users without redeploying.
- **Documentation:** See `backend/scripts/README.md`.