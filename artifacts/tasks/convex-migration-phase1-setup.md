# Phase 1: Convex Setup

## Overview
Initial Convex project setup and React integration.

**Estimated time:** ~1 hour

## Tasks

### 1.1 Install Convex
```bash
npm i convex
```

### 1.2 Initialize Convex Project
```bash
npx convex dev
```
- Login with GitHub when prompted
- Create new project (e.g., "task-manager")
- This creates `convex/` folder with `_generated/` types

### 1.3 Add Environment Variable
Create `.env.local`:
```
VITE_CONVEX_URL=<your-deployment-url>
```
Add to `.gitignore` if not already present.

### 1.4 Update main.tsx
Wrap app with ConvexProvider:
```tsx
import { ConvexProvider, ConvexReactClient } from 'convex/react';

const convex = new ConvexReactClient(import.meta.env.VITE_CONVEX_URL);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ConvexProvider client={convex}>
      <App />
    </ConvexProvider>
  </StrictMode>
);
```

### 1.5 Verify Setup
- Run `npm run dev` and `npx convex dev` in parallel
- Check Convex dashboard shows connected deployment
- No errors in browser console

## Acceptance Criteria
- [ ] `convex/` folder exists with generated types
- [ ] App renders with ConvexProvider wrapper
- [ ] `npx convex dev` runs without errors
- [ ] Dashboard shows deployment connected

## Dependencies
None - this is the first phase.

## Notes
- Keep Dexie running during migration (dual-write not needed, just don't remove yet)
- Convex dev server must run alongside Vite dev server
