---
name: Electric Commerce Core
colors:
  surface: '#f8f9fa'
  surface-dim: '#d9dadb'
  surface-bright: '#f8f9fa'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f3f4f5'
  surface-container: '#edeeef'
  surface-container-high: '#e7e8e9'
  surface-container-highest: '#e1e3e4'
  on-surface: '#191c1d'
  on-surface-variant: '#5a4136'
  inverse-surface: '#2e3132'
  inverse-on-surface: '#f0f1f2'
  outline: '#8e7164'
  outline-variant: '#e2bfb0'
  surface-tint: '#a04100'
  primary: '#a04100'
  on-primary: '#ffffff'
  primary-container: '#ff6b00'
  on-primary-container: '#572000'
  inverse-primary: '#ffb693'
  secondary: '#5f5e5e'
  on-secondary: '#ffffff'
  secondary-container: '#e5e2e1'
  on-secondary-container: '#656464'
  tertiary: '#585f6c'
  on-tertiary: '#ffffff'
  tertiary-container: '#9299a8'
  on-tertiary-container: '#2a313d'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#ffdbcc'
  primary-fixed-dim: '#ffb693'
  on-primary-fixed: '#351000'
  on-primary-fixed-variant: '#7a3000'
  secondary-fixed: '#e5e2e1'
  secondary-fixed-dim: '#c9c6c5'
  on-secondary-fixed: '#1c1b1b'
  on-secondary-fixed-variant: '#474646'
  tertiary-fixed: '#dce2f3'
  tertiary-fixed-dim: '#c0c7d6'
  on-tertiary-fixed: '#151c27'
  on-tertiary-fixed-variant: '#404754'
  background: '#f8f9fa'
  on-background: '#191c1d'
  surface-variant: '#e1e3e4'
typography:
  headline-lg:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '700'
    lineHeight: 32px
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Inter
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
    letterSpacing: -0.01em
  headline-sm:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '600'
    lineHeight: 24px
  body-lg:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  body-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 16px
  label-lg:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 20px
  label-md:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: 0.01em
  label-sm:
    fontFamily: Inter
    fontSize: 10px
    fontWeight: '600'
    lineHeight: 14px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 4px
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 32px
  margin-mobile: 16px
  gutter-mobile: 12px
---

## Brand & Style

This design system is engineered for the high-velocity environment of store management and super-administration. The brand personality is **efficient, authoritative, and energetic**, utilizing "Electric Orange" as a high-visibility catalyst for action within a pristine, professional environment.

The aesthetic follows a **Modern Corporate** approach with a focus on high-utility minimalism. It prioritizes clarity and speed of data digestion by removing all non-essential decorative elements, gradients, and textures. The interface should feel like a high-end SaaS tool: dependable, fast, and premium. The emotional response is one of control and confidence, ensuring that store owners feel empowered to manage complex operations through a simplified, mobile-first interface.

## Colors

The palette is anchored by **Electric Orange**, used strategically for primary actions, progress indicators, and brand touchpoints. To maintain a premium SaaS feel, the background is kept at a pure **#FFFFFF**, providing maximum contrast for typography and data.

Surface colors utilize a subtle **#F8F9FA** to distinguish card-based containers and grouped information without introducing visual noise. Semantic colors are paired with highly desaturated, soft background tints to ensure alerts and status updates (like Order Success or Low Stock warnings) are legible and accessible without being jarring. Borders remain faint at **#E9ECEF** to provide structure through "ghost" containment rather than heavy separation.

## Typography

The design system utilizes **Inter** exclusively to leverage its systematic, neutral, and highly legible characteristics. Typography is the primary driver of hierarchy.

- **Headlines:** Use Bold (700) and Semi-Bold (600) with slight negative letter-spacing to create a tight, authoritative feel for dashboard metrics and page titles.
- **Body:** Standard weights (400) ensure readability for long lists of orders and customer details. 
- **Currency & Numerics:** For ₹ (Rupee) values and quantity counts, use Medium (500) or Semi-Bold (600) weights to ensure financial data stands out from descriptive text.
- **Labels:** Small, uppercase labels are reserved for status tags (e.g., "SHIPPED", "PENDING") and auxiliary metadata.

## Layout & Spacing

This design system employs a **fluid 4px-base spacing scale** tailored for high-density mobile displays. 

- **Page Margins:** A consistent **16px** horizontal margin is applied to the screen edges to prevent content from feeling cramped.
- **Card Spacing:** Elements within cards (like product list items) use **12px (sm+xs)** internal padding. 
- **Vertical Rhythm:** Sections are separated by **24px** to provide clear visual breaks between different data modules (e.g., separating "Today's Revenue" from "Recent Orders").
- **Touch Targets:** All interactive elements must maintain a minimum height of **44px** regardless of their visual appearance to ensure ergonomic ease for busy store owners on the move.

## Elevation & Depth

The design system uses **Tonal Layering** combined with soft, ambient shadows to define depth. 

- **Level 0 (Base):** Pure white (#FFFFFF) for the main background.
- **Level 1 (Cards):** Off-white (#F8F9FA) surfaces with a thin 1px border (#E9ECEF) and a very soft, diffused shadow: `0 2px 8px rgba(0,0,0,0.07)`. This is the primary container for list items, charts, and product details.
- **Level 2 (Modals/Sheets):** Higher elevation with a slightly more pronounced shadow and a dimmed background overlay (Scrim), used for quick-edit actions or filtering.
- **No Gradients:** Depth is achieved strictly through flat color fills and shadows; no inner glows or linear gradients are permitted.

## Shapes

The shape language is a mix of **Soft Geometric** and **Organic Pills**. 

- **Cards & Containers:** Fixed at **12px** (rounded-lg) to provide a modern, friendly feel that remains professional.
- **Interactive Elements:** Buttons and Status Tags use the **Pill (9999px)** shape. This creates a distinct visual contrast between "container" shapes (rectangular) and "actionable/status" shapes (rounded), aiding in quick recognition.
- **Input Fields:** Slightly tighter **8px** radius to maintain a structured, form-like appearance.

## Components

- **Buttons:** Primary buttons use the Electric Orange fill with White text. Secondary buttons use a white fill with an Electric Orange border and text. All use pill-shaped geometry.
- **Status Chips:** Small, pill-shaped indicators using semantic background tints (e.g., Success-bg for "Delivered") with corresponding bold text colors.
- **Input Fields:** Minimalist design with a #E9ECEF border that shifts to Electric Orange on focus. Labels are always visible above the field in Label-md style.
- **Value Displays:** Large revenue or count figures should use Headline-lg in Primary text color, always prefixed with the ₹ symbol.
- **List Items:** Order and Product lists use horizontal rows with a 12px internal gutter, featuring a thumbnail (8px radius) and chevron-right icons to indicate drill-down capability.
- **Dashboard Cards:** Summary cards for "Daily Sales" or "Pending Orders" should feature a small icon in a tinted background circle (e.g., Orange icon on Orange-tint) to the left of the metric.