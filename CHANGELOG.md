# Changelog

## v0.2.0

### 🚀 Major Features

- **Hub Management System**: Create, manage, and switch between household hubs.
- **Invitations System**: Send, receive, and respond to hub invitations (accept/decline).

### 🛠 Improvements & Fixes

- Improved authentication and hub store synchronization.
- Refactored hub settings UI into modular components.
- Fixed issues with invitation logic and tab switching.
- Corrected email trimming during signup.
- Addressed bugs in invitation fetching and Supabase initialization.

### 🧩 Backend & Database

- Added Supabase stored procedures for accepting/declining invitations.
- Refined database schema and indexes for hub-related tables.

---

## v0.1.0

### 🚀 Major Features

- **Authentication System**: Full signup, login, and logout flow using Supabase Auth.

### 🛠 Improvements & Fixes

- Introduced Zustand for managing authentication state.
- Improved UI/UX for the landing page and dashboard header.

### 🧩 Backend & Database

- Added SQL migrations: foreign key constraints, `user_profiles`, `hub_members`, and `hub_invitations` tables.

### ⚙️ Dependencies

- Added/updated packages for React, Supabase, Zustand, and date libraries.

---

## v0.0.0

### 🚀 MVP Launch – Household Harmony App

- **Dashboard**: Household overview, activity feed, and quick actions.
- **Calendar & Tasks**: Shared calendar and collaborative task management.
- **Shopping List**: Real-time collaborative shopping list with smart input.
