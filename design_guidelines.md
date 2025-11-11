# Design Guidelines: Self-Improvement Workbook Companion

## Design Approach
**Design System:** Linear/Notion-inspired minimalist productivity interface
**Rationale:** Utility-focused app prioritizing clarity, efficiency, and daily usability. Clean aesthetics support focused interaction without distraction.

## Typography System
**Primary Font:** Inter (via Google Fonts CDN)
- Headings: 600 weight, sizes from text-2xl to text-4xl
- Body text: 400 weight, text-base (16px)
- Labels/metadata: 500 weight, text-sm
- Button text: 500 weight, text-sm to text-base

**Hierarchy:**
- Page titles: text-3xl font-semibold
- Section headers: text-xl font-semibold  
- Card titles: text-lg font-medium
- Body/inputs: text-base font-normal
- Helper text: text-sm text-gray-600

## Layout System
**Spacing Units:** Tailwind primitives of 2, 4, 6, and 8 (p-4, m-6, gap-8, etc.)

**Mobile-First Structure:**
- Container: max-w-2xl mx-auto with px-4 for mobile, px-6 for desktop
- Section spacing: py-8 on mobile, py-12 on desktop
- Component gaps: gap-4 for tight groupings, gap-6 for section separation
- Card padding: p-6

**Page Layout:**
- Fixed bottom navigation bar (h-16) on mobile
- Top header bar (h-14) with page title
- Scrollable content area between header and nav
- Safe area padding: pb-20 on mobile to clear bottom nav

## Component Library

### Navigation
**Bottom Tab Bar (Mobile):**
- Three icons with labels: Goals, Progress, Reflect
- Active state: font-semibold with accent indicator line (h-0.5) above icon
- Icons: Heroicons outline style (24px)
- Background: white with subtle top border

### Weekly Goal Setter Page
**Goal Input Cards:**
- Numbered priority badges (1, 2, 3) with circular backgrounds
- Large text input fields (min-h-20) with placeholder text
- Drag handle icon on left (6 vertical dots)
- Delete icon button on right (trash icon)
- Card design: border border-gray-200 rounded-lg with hover state

**Add Goal Button:**
- Full-width on mobile, max-w-xs on desktop
- Prominent placement below goal list
- Plus icon with "Add Weekly Goal" text

### Progress Tracker Dashboard
**30-Day Calendar Grid:**
- 7-column grid (days of week)
- Each cell: square aspect-ratio with rounded corners
- Completion states: empty (border), partial (half-filled), complete (filled)
- Current day: subtle ring indicator
- Responsive: gap-1 on mobile, gap-2 on desktop

**Statistics Cards:**
- 3-column grid on desktop, stacked on mobile
- Large numbers (text-3xl font-bold)
- Small labels below (text-sm)
- Metrics: Current streak, Total completed, Completion rate

**Quick Check-in:**
- Today's goals displayed as checkboxes
- Large touch targets (min-h-12)
- Immediate visual feedback on completion

### Reflect & Archive Page
**Journal Entry Form:**
- Date picker (read-only, auto-set to current week)
- Large textarea (min-h-48) with character count
- Subtle border focus state
- Save button: prominent, right-aligned

**Archive List:**
- Chronological cards, most recent first
- Each card shows: week range, preview (first 100 chars), edit/delete actions
- Expandable to show full entry
- Empty state: friendly illustration placeholder with "Start your first reflection"

### Form Elements
**Inputs:**
- border-gray-300 with focus:ring-2 focus:ring-offset-0
- rounded-md (6px radius)
- py-3 px-4 for comfortable touch targets
- Placeholder text: text-gray-400

**Buttons:**
- Primary: solid with rounded-md, py-3 px-6
- Secondary: border variant with matching padding
- Destructive actions: subtle red treatment
- Icon-only buttons: p-2 with rounded hover background

**Validation:**
- Inline error messages in text-sm below inputs
- Red border treatment for invalid fields
- Required field indicators (asterisk)
- Disabled submit states when validation fails

## Interaction Patterns
**Data Persistence Indicators:**
- Auto-save feedback: "Saved" text with checkmark, fades after 2s
- Loading states: subtle spinner on save actions
- Confirmation dialogs for destructive actions (delete goals/entries)

**Empty States:**
- Centered content with icon, heading, description, CTA
- Friendly, encouraging tone
- Clear next steps

**Responsive Behavior:**
- Mobile: Single column, bottom nav, stacked cards
- Tablet (768px+): Two-column grids where appropriate, side navigation option
- Desktop (1024px+): Optimized card layouts, more generous spacing

## Accessibility
- All interactive elements min-h-12 for touch targets
- Focus visible states on all inputs and buttons
- ARIA labels for icon-only buttons
- Semantic HTML (main, section, nav)
- Skip-to-content link for keyboard navigation

This design prioritizes clarity, ease of use, and daily interaction reliability for professional users managing their self-improvement journey.