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

## 6. Design System
- **Colors:** MC Navy (#002A54) & MC Orange (#F58220).
- **Typography:** Inter/System Stack.
- **Interaction:** Optimistic UI for all toggle actions (Like/Collect).