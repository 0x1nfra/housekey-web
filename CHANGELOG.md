# Changelog

## v0.7.0

### 🚀 Major Features

- **User Settings Management**: Dark mode and time format preferences with real-time syncing and persistence.
- **Settings UI**: Comprehensive interface with tabs for app preferences, profile, notifications, privacy, and invitations.

### 🛠 Improvements & Fixes

- Extensive dark mode support across all major pages and components.
- Added reusable UI components for toggles, radio groups, and settings sections.
- Improved modularity and navigation with new layout and tab system.
- Refined visual consistency and accessibility for both light and dark themes.

### 🧩 Backend & Database

- Added user_settings table with secure per-user preferences and row-level security.
- Created triggers and policies for data integrity and access control.

### ⚙️ Dependencies

- Updated Tailwind CSS configuration to enable class-based dark mode toggling.

---

## v0.6.0

### 🚀 Major Features

- **Notifications System**: Comprehensive real-time notifications for tasks, events, shopping items, and hub invitations.
- **Notification Management**: Interactive dropdown with filtering, pagination, and bulk management actions.

### 🛠 Improvements & Fixes

- Added notification badges, sound alerts, and animated UI components.
- Improved database row-level security policies for notifications.
- Fixed notification insert permissions to support trigger-based creation.

### 🧩 Backend & Database

- Added database triggers and functions for automated notification management.
- Implemented secure access controls for notification system.

---

## v0.5.0

### 🚀 Major Features

- **Calendar Views**: Detailed month, week, and day calendar interfaces.
- **Event Management**: Complete event creation, editing, deletion, and reminder system.

### 🛠 Improvements & Fixes

- Added filtering by data type, assignment, and event category.
- Enhanced real-time event updates with robust subscription management.
- Improved error handling and user feedback on event operations.

### 🧩 Backend & Database

- Updated database schema with strict access controls and optimized queries.
- Integrated combined calendar data for events and tasks.

---

## v0.4.0

### 🚀 Major Features

- **Task Management System**: Comprehensive task creation, editing, bulk actions, and advanced filtering.
- **Task Categories**: Custom categorization system per hub with recurring task support.

### 🛠 Improvements & Fixes

- Added task statistics and animated, interactive UI components.
- Enhanced database schema for recurring tasks and category management.
- Fixed priority type mismatches and improved data integrity.

### ⚙️ Dependencies

- Removed deprecated chore creation form and legacy shopping types.

---

## v0.3.0

### 🚀 Major Features

- **Shopping Lists**: Collaborative shopping system with real-time updates and role-based permissions.
- **Shopping Management**: Modals for creating, editing, and viewing list statistics and collaborators.

### 🛠 Improvements & Fixes

- Migrated to centralized state management with improved data fetching.
- Enhanced error handling and loading states throughout shopping features.
- Updated UI with animated transitions and improved user experience.

### 🧩 Backend & Database

- Implemented comprehensive database schema and security policies for shopping collaboration.

### ⚙️ Dependencies

- Added new dependencies for state management and performance optimization.

---

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
