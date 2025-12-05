# Project Constitution: MC Social Hub (Internal Xiaohongshu)

## 1. Project Vision
- **Core Value:** A visually rich, mobile-first community app for Master Concept employees to share life and work moments.
- **Visual Anchor:** All designs MUST harmonize with the 'Master Concept' brand identity (Navy Blue & Orange accents derived from corporate logo).
- **Evolution Strategy:** Start with Feed + Google Login. Future modules (Mall, Chat) must inherit the auth context and visual style without breaking changes.

## 2. Technical Stack
- **Frontend:** React (Vite) + TypeScript + Tailwind CSS.
  - **UI Library:** Shadcn UI (Radix) + Framer Motion (for smooth mobile transitions).
  - **State:** Zustand (Global Context for User & Theme).
  - **Router:** React Router v6.
- **Backend:** Python, FastAPI.
  - **Auth:** Google OAuth2 (OpenID Connect) ONLY. No password storage.
  - **DB:** PostgreSQL (Async) + SQLAlchemy 2.0.
  - **API:** RESTful with Pydantic v2 models.

## 3. Design System (Brand DNA)
- **Primary Colors:** 
  - **MC Navy (#002A54):** Primary brand color. Used for headers, active tab states, and primary buttons.
  - **MC Orange (#F58220):** Accent color. Used for "Like" hearts, notification dots, and call-to-action highlights.
- **Background:** Clean white (#FFFFFF) or very light gray (#F5F5F5) to let content pop.
- **Layout:** Masonry Grid (Waterfall) is the primary view for the Discovery feed.
- **Interaction:** Mobile-native feel (Swipe-to-back, Pull-to-refresh).

## 4. Workflow Mandates
- **Context-First:** Before adding a feature, check `current_context`.
- **Zero-Bug Evolution:** New features must be additive. Do not modify existing database schemas destructively.
- **Auth:** Auto-registration on first Google Login (JIT Provisioning). Restrict to company domain.
