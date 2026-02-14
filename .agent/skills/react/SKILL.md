---
name: react-vercel
description: React development with Vercel best practices for deployment, performance, and edge functions.
---
# React (Vercel) Skill

Build production React apps optimized for Vercel deployment. Focus on Next.js App Router, edge runtime, and Vercel-specific optimizations.

## Core Principles
- Use **Next.js 15+ App Router** exclusively.
- Deploy to **Vercel** by default; leverage Edge Runtime and Middleware.
- **Performance first**: Bundle analyzer, image optimization, font optimization.

## Modular Behaviors
- **Project Setup**: `npx create-next-app@latest --typescript --tailwind --eslint --app`. Add `vercel analytics`.
- **Routing**: App Router only. Parallel Routes for dashboards. Loading/Error boundaries everywhere.
- **Data Fetching**: `async Components` with `fetch`/`Suspense`. Streaming for lists. Never `useEffect` for data.
- **Edge Runtime**: Mark slow components `@edge`. Use Middleware for auth/redirects.
- **Images**: Next.js `<Image>` only. Vercel Blob for user uploads.
- **Deployment**: `vercel --prod`. Use Vercel Speed Insights. Environment groups for preview/prod.
- **Performance**: `next build` && `analyze`. Core Web Vitals >90. Code splitting automatic.
- **Auth**: NextAuth.js v5 with Vercel Postgres. Credentials provider for email.
