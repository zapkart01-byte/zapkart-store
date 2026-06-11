# ZapKart Rider App Design System

## Brand Identity
**Name:** ZapKart Rider
**Industry:** Quick Commerce Logistics
**Brand Personality:** Professional, Minimal, High-Efficiency, Reliable
**Primary Color:** Electric Orange (#FF6B00)

## Visual Language

### Color Palette
- **Primary:** `#FF6B00` (Electric Orange) - Used for primary actions, active states, and brand highlights.
- **Success:** `#16A34A` (Green) - Used for 'Online' status, 'Accept Order' actions, and completed milestones.
- **Error/Alert:** `#EF4444` (Red) - Used for Cash on Delivery (COD) alerts and urgent countdowns.
- **Surface:** `#FCF9F8` (Off-white) - Main background color for a clean, professional look.
- **Surface-Bright:** `#FFFFFF` (Pure White) - Used for cards and elevated containers.
- **Typography/Text:** 
  - Neutral-High: `#0D0D0D` (Near Black)
  - Neutral-Mid: `#6B7280` (Medium Grey)
  - Neutral-Low: `#9CA3AF` (Light Grey)

### Typography
- **Primary Font:** Inter (Sans-serif)
- **Hierarchy:**
  - **Display/Headline:** 48px Bold (Order Values)
  - **Headline-Md:** 22px Bold (Screen Titles, Section Headers)
  - **Body-Lg:** 17px Bold/SemiBold (User Greetings, Nav Headers)
  - **Body-Md:** 14px Regular/Bold (Primary Information, Grid Labels)
  - **Label-Sm:** 11px-13px (Secondary Text, Meta Data, Captions)

### Components & Pattern Library

#### Navigation
- **TopAppBar:** Small, flat design with a white background and subtle bottom border. Features a 48px avatar on the dashboard and status indicators/order numbers on active flows.
- **BottomNavBar:** Fixed 4-tab navigation (Dashboard, Deliveries, Earnings, Profile) using a 56px height, label + icon pairing, and a 20px top radius.

#### Cards & Containers
- **Stats Card:** 10px radius, `#F8F9FA` background. Used for high-level data visualization on the dashboard.
- **Action Card:** 12px radius, white background with shadow. Used for item lists and delivery details.
- **Alert Card (COD):** `#FEF2F2` background with a 4px solid `#EF4444` left border to signify critical financial action.

#### Buttons
- **Primary Action:** 52px-56px height, 12px-14px radius. 
  - `Electric Orange` for standard actions (Mark Delivered, Registration).
  - `Green (#16A34A)` for high-intent 'Accept' actions.
- **Secondary/Outlined:** 48px height, 2px `#FF6B00` border, white background. Used for navigation prompts (Navigate to Store/Customer).

## Motion & Interactivity
- **Micro-interactions:** 
  - Soft pulsing green glow for 'Online' status.
  - Gentle bobbing (±4px) for empty-state icons.
  - 800ms number count-up for financial data.
- **Transitions:** 
  - Bottom sheets slide up with spring physics (400ms).
  - Staggered bar chart growth (60ms delay per bar).
  - Cross-fade transitions for data period switching.

## Screen Architecture
1. **Registration:** Minimalist onboarding with focused data entry.
2. **Dashboard:** Performance-at-a-glance with real-time status toggles.
3. **Incoming Order Overlay:** High-urgency, modal-style bottom sheet for quick decision making.
4. **Active Delivery (Pickup):** Task-oriented list with prominent navigation and confirmation triggers.
5. **Active Delivery (Delivery):** COD-prioritized view with clear customer contact and location data.
6. **Earnings:** Data-driven overview using charts and detailed transaction logs.