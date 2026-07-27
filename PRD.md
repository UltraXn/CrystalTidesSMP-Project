# Crystaltides SMP - Frontend PRD

## Overview
This document defines the requirements for testing the **Crystaltides Web Client**. The primary focus is on UI reliability, user flows, and integration with the Supabase authentication layer.

## Core Web Features (Testing Scope)
1. **Authentication Flow**:
    - Login/Logout using Supabase.
    - 2FA verification UI.
2. **Maintenance Mode**:
    - Dynamic maintenance screen with Discord and Admin links.
3. **Member Dashboard**:
    - Navigation and layout responsiveness.
    - Skin viewing and interactive components.
    - Live Dynmap embedding.
4. **Administrative UI**:
    - Ticket management forms.
    - User list and profile editing.

## Technology Stack (Frontend)
- **Framework**: React 19, Vite 6.
- **Styling**: TailwindCSS 4.
- **State/Auth**: TanStack Query, Supabase Auth.
- **Forms**: React Hook Form + Zod.
- **Dev Port**: 5173.
