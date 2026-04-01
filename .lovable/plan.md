

# 9twanfitz Gilded Streets v2 — Production Upgrade Plan

## Important Constraint
Lovable runs **Vite + React SPA** — Next.js, SSR/SSG/ISR, and monorepo `/packages` structures are not supported. This plan adapts all goals to the current stack.

## What Already Exists
- Auth + profiles + admin RBAC with `has_role()` security definer
- Products with slugs + categories table
- Blog system (admin