---
name: project-stayflow
description: StayFlow hotel management SaaS — Next.js 16 app router project details and key decisions
metadata:
  type: project
---

StayFlow is a hotel room management SaaS at `/Users/muneerabass/hotel-managenment`.

**Why:** Built from scratch to allow hotel owners to register, configure rooms, and track occupancy in real time.

**Stack:** Next.js 16.2.9 (App Router), TypeScript, Tailwind CSS v4, shadcn/ui, MongoDB (local), Mongoose, JWT auth via httpOnly cookies.

**Key decisions:**
- Next.js 16 uses `proxy.ts` (not `middleware.ts`) — export `proxy` function, not `middleware`
- JWT stored in httpOnly cookie `stayflow_token`
- Auth guard in `src/proxy.ts` (route-level) + server-side redirect in app layout
- Rooms auto-generated: floor 1 = type 1 (101–1xx), floor 2 = type 2 (201–2xx), etc.

**How to apply:** When extending this project, remember proxy.ts instead of middleware.ts for Next.js 16.
