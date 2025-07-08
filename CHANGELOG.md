# Changelog

All notable changes to Household Harmony are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.8.0] - 2024-07-08

### Added

- **Redesigned Navigation**: New sidebar and header navigation optimized for both desktop and mobile experiences
- **Modular Shopping Components**: Dedicated components for pending/completed items, list selector, and quick statistics
- **Animated Pages**: Enhanced maintenance, onboarding, and landing pages with smooth animations
- **Notification System**: Dropdown notifications with badges and improved notification management
- **Task Management Modals**: Quick stats and streamlined task creation forms
- **Dynamic Dashboard**: Time-based greetings and personalized dashboard content

### Changed

- **Component Architecture**: Replaced inline UI with modular, reusable components across dashboard, shopping, and tasks
- **Design System**: Unified color schemes and typography for consistent user experience
- **Authentication**: Refactored authentication and hub state management for better performance
- **Shopping Experience**: Removed collaborator features from shopping lists for simplified workflow

### Fixed

- Email invitation validation and error handling
- Time formatting consistency across the application

### Removed

- Legacy navigation components
- Old dashboard headers
- Collaborator management in shopping lists

---

## [0.7.0] - 2024-07-02

### Added

- **User Settings Management**: Comprehensive settings with dark mode and time format preferences
- **Settings Interface**: Tabbed interface covering app preferences, profile, notifications, privacy, and invitations
- **Dark Mode Support**: Full dark theme implementation across all pages and components
- **Reusable UI Components**: Toggle switches, radio groups, and settings sections

### Changed

- **Database Schema**: Added `user_settings` table with row-level security
- **Visual Consistency**: Improved accessibility and theme consistency
- **Tailwind Configuration**: Updated to enable class-based dark mode toggling

### Fixed

- Theme switching performance and persistence
- Settings synchronization across sessions

---

## [0.6.0] - 2024-06-30

### Added

- **Real-time Notifications**: Comprehensive notification system for tasks, events, shopping items, and hub invitations
- **Notification Management**: Interactive dropdown with filtering, pagination, and bulk actions
- **Audio Alerts**: Sound notifications for important updates
- **Notification Badges**: Visual indicators for unread notifications

### Changed

- **Database Security**: Enhanced row-level security policies for notifications
- **UI Animations**: Added smooth transitions and animated components

### Fixed

- Notification insert permissions for trigger-based creation
- Real-time notification delivery reliability

---

## [0.5.0] - 2024-06-28

### Added

- **Calendar Views**: Multiple calendar interfaces (month, week, day views)
- **Event Management**: Complete CRUD operations for events with reminder system
- **Advanced Filtering**: Filter by data type, assignment, and event category
- **Real-time Updates**: Live event synchronization across all users

### Changed

- **Database Optimization**: Improved queries and access controls
- **Error Handling**: Enhanced user feedback for event operations

### Fixed

- Event subscription management stability
- Calendar data synchronization issues

---

## [0.4.0] - 2024-06-28

### Added

- **Task Management System**: Comprehensive task creation, editing, and bulk operations
- **Task Categories**: Custom categorization system with recurring task support
- **Task Statistics**: Analytics and insights for task completion
- **Interactive UI**: Animated task components and improved user interactions

### Changed

- **Database Schema**: Enhanced support for recurring tasks and categories
- **Data Integrity**: Improved validation and consistency checks

### Fixed

- Priority type mismatches in task management
- Task category assignment issues

### Removed

- Deprecated chore creation form
- Legacy shopping list types

---

## [0.3.0] - 2024-06-27

### Added

- **Collaborative Shopping**: Real-time shopping lists with role-based permissions
- **Shopping Management**: Modals for list creation, editing, and statistics
- **Collaborator Features**: Team management for shopping lists

### Changed

- **State Management**: Migrated to centralized state management system
- **Performance**: Improved data fetching and loading states
- **User Experience**: Enhanced UI with animated transitions

### Fixed

- Shopping list synchronization issues
- Collaboration permission handling

---

## [0.2.0] - 2024-06-25

### Added

- **Hub Management**: Create, manage, and switch between household hubs
- **Invitation System**: Send, receive, and respond to hub invitations
- **Database Procedures**: Supabase stored procedures for invitation handling

### Changed

- **Authentication Flow**: Improved hub store synchronization
- **UI Components**: Refactored hub settings into modular components
- **Database Schema**: Enhanced indexes and foreign key constraints

### Fixed

- Email trimming during user signup
- Invitation fetching and response logic
- Tab switching in hub settings
- Supabase initialization issues

---

## [0.1.0] - 2024-XX-XX

### Added

- **Authentication System**: Complete signup, login, and logout using Supabase Auth
- **State Management**: Zustand integration for authentication state
- **Database Tables**: Initial schema with user profiles, hub members, and invitations

### Changed

- **Landing Page**: Improved UI/UX for initial user experience
- **Dashboard Header**: Enhanced navigation and user information display

---

## [0.0.0] - 2024-06-22

### Added

- **MVP Launch**: Initial release of Household Harmony
- **Dashboard**: Household overview with activity feed and quick actions
- **Calendar & Tasks**: Shared calendar and collaborative task management
- **Shopping Lists**: Real-time collaborative shopping with smart input features

---

## Contributing

When updating this changelog:

1. Add new entries to the `[Unreleased]` section
2. Use the format: `### [Type] - Brief description`
3. Group changes by type: Added, Changed, Fixed, Removed, Security
4. Include user-facing impact in descriptions
5. Move entries to a versioned release when deploying

## Legend

- 🚀 **Added**: New features and functionality
- 🔄 **Changed**: Improvements to existing features
- 🐛 **Fixed**: Bug fixes and issue resolutions
- 🗑️ **Removed**: Deprecated or removed features
- 🔒 **Security**: Security-related changes
