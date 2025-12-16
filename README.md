# 📱 MC Social Hub

Welcome to **MC Social Hub**! A dedicated social sharing community for the Master Concept family.

> **⚠️ Important**
> 1.  **Network**: VPN required to access Google services.
> 2.  **Login**: Use your Master Concept Google Workspace account directly.

---

## 🌟 Key Features (v2.0)

We've just released a major update (Phase 6):
*   **💻 Desktop Adaptation**: Full responsive support with 3-column layout and split-screen details.
*   **🚀 Image Optimization**: Automatic WebP compression and thumbnail generation for fast loading.
*   **🏷️ Smart Tags**: 9 official categories (Life, Work, Event...) with AI auto-tagging.

---

## 📱 Mobile Experience

**URL**: `https://mc-social-hub-961699257299.us-central1.run.app/`

**Install as PWA**:
*   **iPhone (Safari)**: Share -> "Add to Home Screen".
*   **Android (Chrome)**: Menu -> "Install App".
Full-screen immersive experience, optimized for iOS safe areas.

---

## 💻 Desktop Experience

Open in Chrome/Edge for a professional desktop view:

### 1. 3-Column Layout
*   **Left**: Navigation (Home, Explore, Profile).
*   **Center**: Adaptive Masonry Grid (3-4 columns).
*   **Right**: Widgets (Trending Tags, Who to Follow).

### 2. Split-Screen Detail
Click any post to view in a split-screen modal:
*   **Left**: Large media viewer.
*   **Right**: Info, comments, and interactions.

---

## 🏷️ Categories

Find content in "Explore":
*   ☕ **Life**
*   💼 **Work**
*   📅 **Event**
*   🍽️ **Food**
*   🛍️ **Market**
*   🎁 **Welfare**
*   ...and more!

---

## 🛠️ Development

### Tech Stack
*   **Frontend**: React, Vite, TypeScript, Tailwind CSS.
*   **Backend**: FastAPI, Python 3.12, SQLAlchemy (Async).
*   **Database**: Cloud SQL (PostgreSQL).
*   **Storage**: Google Cloud Storage (GCS).
*   **AI**: Google Vertex AI (Gemini 1.5 Pro).

### Deployment
Managed via `deploy.sh` to Google Cloud Run.

```bash
./deploy.sh
```

### 👥 User Administration
To add new employees to the allowlist without redeploying:
👉 [See Scripts Documentation](backend/scripts/README.md)

---

**Master Concept - Connecting People & Ideas**