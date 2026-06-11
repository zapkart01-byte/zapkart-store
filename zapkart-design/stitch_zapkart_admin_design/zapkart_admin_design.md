# Zapkart_Admin_design

## Brand Overview
**Name:** ZapKart Admin
**Industry:** E-commerce Management / SaaS
**Tone:** Professional, Minimal, Clean, Premium SaaS Quality

## Visual Foundations

### Color Palette
- **Primary:** `#FF6B00` (Electric Orange) - Used for primary CTAs, active states, and brand highlights.
- **Surface:** `#F8F9FA` - Primary background for dashboards and cards.
- **Surface Dim:** `#D9DADB` - Used for secondary backgrounds and dividers.
- **Text Primary:** `#1A1C1E` - High-contrast text for headings and body.
- **Text Secondary:** `#42474E` - Medium-contrast text for labels and subtext.
- **Success:** `#2E7D32` - Green for positive trends and "Paid" statuses.
- **Error:** `#D32F2F` - Red for "Remove" links and alerts.
- **Warning:** `#F9A825` - Amber for performance warnings.

### Typography
- **Primary Font:** Inter (Sans-serif)
- **Headings:** Bold, ranging from 28px (Page Titles) to 16px (Card Headers).
- **Body:** Regular/Medium, 14px default.
- **Labels:** 11px to 12px for metadata and watermarks.

### Layout & Spacing
- **Responsive Principle:** Full-screen, fluid responsive layouts (`min-h-screen`).
- **Desktop:** Split-screen or sidebar-based layouts (1440px target).
- **Mobile:** Single-column stacked cards with bottom navigation.
- **Border Radius:** `ROUND_EIGHT` (8px) for cards and inputs.
- **Shadows:** Soft elevation (`shadow-sm`) for interactive cards.

## Component Patterns

### Navigation
- **Sidebar (Desktop):** Persistent left-aligned navigation with brand logo.
- **Top Bar:** Contextual actions (Export, Date Picker, Notifications).
- **Bottom Bar (Mobile):** Quick access to core modules (Dashboard, Orders, Analytics, Profile).

### UI Elements
- **Cards:** White background, 10px radius, subtle shadow, 16px gap.
- **Inputs:** Clean, outlined fields with state-aware validation.
- **Tables:** High-density with visual indicators (e.g., gold border for top rank, color-coded left borders for status).
- **Buttons:** 
  - Primary: Solid Electric Orange.
  - Secondary: Outlined grey or ghost buttons.

## Motion & Interaction
- **Transitions:** Smooth 200ms fades for toggles and hover states.
- **Data Visualization:** Charts animate on load (line draws left-to-right, segments expand).
- **Feedback:** "Unsaved changes" indicators and pulsing Save buttons when dirty state is detected.
