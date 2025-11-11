# Self-Improvement Workbook Companion

## Overview
A clean, professional, mobile-first web application serving as a digital companion for an intermediate-level self-improvement interactive workbook. Built with React, TypeScript, Express, and in-memory storage.

**Last Updated:** November 10, 2025

## Purpose & Goals
- Provide a seamless digital experience for goal setting, progress tracking, and personal reflection
- Support professional audiences with an intuitive, distraction-free interface
- Enable users to build consistent self-improvement habits through structured weekly goals

## Current State
✅ **MVP Complete** - All core features implemented and tested
- Three main pages fully functional
- Data persistence working with in-memory storage
- Mobile-first responsive design implemented
- End-to-end tests passing

## Recent Changes (November 10, 2025)

### Features Implemented
1. **Weekly Goal Setter Page**
   - Draft goal input system (prevents empty goal submissions)
   - Drag-and-drop priority reordering using @dnd-kit
   - Goal completion tracking with checkboxes
   - Maximum 3 goals per week with validation
   - Visual progress summary (count + percentage)

2. **Progress Tracker Dashboard**
   - 30-day calendar grid with color-coded completion status
   - Statistics cards (current streak, total completed days, success rate)
   - Today's quick check-in with live goal completion
   - Automatic progress entry creation when goals are completed

3. **Reflect & Archive Page**
   - Weekly journal entry form (max 5000 characters)
   - Expandable archive list with all past reflections
   - Edit and delete functionality for journal entries
   - One entry per week validation

4. **Bottom Navigation**
   - Mobile-optimized tab navigation
   - Active page indicator with visual feedback
   - Smooth transitions between pages

### Technical Improvements
- Implemented proper validation (Zod schemas on backend)
- Fixed goal creation flow to prevent empty titles
- Added drag-and-drop with @dnd-kit/core, @dnd-kit/sortable
- Corrected progress tracker mutation logic to use fresh data
- Added comprehensive test coverage

## Project Architecture

### Tech Stack
- **Frontend:** React, TypeScript, TanStack Query, Wouter (routing), Tailwind CSS
- **Backend:** Express.js, TypeScript
- **Storage:** In-memory (MemStorage class)
- **Validation:** Zod schemas
- **UI Components:** Shadcn/ui components
- **Drag & Drop:** @dnd-kit

### File Structure
```
/client
  /src
    /components
      - bottom-navigation.tsx (Mobile nav bar)
      - ui/ (Shadcn components)
    /pages
      - weekly-goals.tsx (Goal setter with D&D)
      - progress-tracker.tsx (Calendar & stats)
      - reflect-archive.tsx (Journal entries)
    - App.tsx (Routes & providers)
    - index.css (Design tokens)
  - index.html (Inter font, meta tags)

/server
  - storage.ts (In-memory data storage interface)
  - routes.ts (REST API endpoints)
  - index.ts (Express server)

/shared
  - schema.ts (Drizzle schemas, Zod validation, TypeScript types)
```

### API Endpoints

**Goals:**
- `GET /api/goals/:weekStart` - Fetch weekly goals
- `POST /api/goals` - Create goal (requires title, priority)
- `PATCH /api/goals/:id` - Update goal (title, completed, priority)
- `DELETE /api/goals/:id` - Delete goal

**Progress:**
- `GET /api/progress` - Fetch all progress entries
- `POST /api/progress` - Create/update daily progress

**Journal:**
- `GET /api/journal` - Fetch all journal entries
- `GET /api/journal/:weekStart` - Fetch specific week entry
- `POST /api/journal` - Create journal entry
- `PATCH /api/journal/:id` - Update journal entry
- `DELETE /api/journal/:id` - Delete journal entry

### Data Models

**Goal**
```typescript
{
  id: string
  title: string (1-200 chars)
  priority: number (1-3)
  weekStart: string (ISO date - Monday)
  completed: boolean
}
```

**ProgressEntry**
```typescript
{
  id: string
  date: string (ISO date, unique)
  goalsCompleted: number (0-3)
  totalGoals: number (1-3)
}
```

**JournalEntry**
```typescript
{
  id: string
  weekStart: string (ISO date, unique)
  content: string (1-5000 chars)
}
```

## Key Features

### User Experience
- **Mobile-First Design:** Optimized for touch interactions with comfortable tap targets
- **Clean Aesthetics:** White background, minimalist Inter font, subtle shadows
- **Smart Validation:** Prevents invalid data with helpful error messages
- **Empty States:** Beautiful, encouraging empty states with clear CTAs
- **Loading States:** Skeleton loaders maintain visual consistency
- **Smooth Interactions:** Hover states, transitions, and visual feedback

### Data Integrity
- Zod validation on both frontend and backend
- Maximum 3 goals per week enforced
- One journal entry per week allowed
- Draft goal workflow prevents empty submissions
- Fresh data fetching for accurate statistics

### Mobile Optimization
- Bottom navigation bar for easy thumb access
- Touch-friendly drag-and-drop
- Responsive layouts (single column on mobile, optimized on desktop)
- Safe area padding to avoid bottom nav overlap

## Design System

### Colors
- Primary: Blue (`210 85% 35%`)
- Background: White (`0 0% 100%`)
- Foreground: Near-black (`0 0% 9%`)
- Muted: Light gray for secondary text

### Typography
- Font: Inter (400, 500, 600, 700 weights)
- Page titles: 3xl, semibold
- Section headers: xl, semibold
- Body text: base, normal
- Helper text: sm, muted

### Spacing
- Container: max-w-2xl centered
- Padding: px-4 (mobile), px-6 (desktop)
- Gaps: 4 (tight), 6 (comfortable), 8 (sections)
- Card padding: p-6

## Development Workflow

### Running the App
```bash
npm run dev  # Starts both Express (port 5000) and Vite dev server
```

### Testing
End-to-end tests validate:
- Goal creation, editing, completion, deletion
- Drag-and-drop reordering
- Progress tracking and statistics
- Journal entry CRUD operations
- Navigation flow

### Dependencies
- @dnd-kit/core, @dnd-kit/sortable - Drag and drop
- @tanstack/react-query - Data fetching
- wouter - Lightweight routing
- zod - Schema validation
- drizzle-orm, drizzle-zod - Type-safe schemas
- shadcn/ui components - Pre-built UI components

## Future Enhancements (Not in Current MVP)

**Potential Features:**
- Data export (PDF/CSV)
- Database persistence for cross-device sync
- Analytics and insights dashboard
- Goal templates and suggestions
- Reminder notifications
- Dark mode (already supported in design system)
- Multi-week comparison view
- Habit streak achievements

## Notes for Future Development

### Known Behaviors
- In-memory storage resets on server restart (expected for MVP)
- Maximum 3 goals per week is a hard limit
- Week starts on Monday (ISO week standard)
- Calendar shows last 30 days rolling window

### Code Conventions
- Follow fullstack_js guidelines
- Use TanStack Query for all API calls
- Validate with Zod schemas on both sides
- Mobile-first responsive design
- Test IDs on all interactive elements

### Design Guidelines
Refer to `design_guidelines.md` for detailed UI/UX specifications including:
- Component usage patterns
- Spacing and typography rules
- Interaction states
- Responsive breakpoints
- Accessibility standards
