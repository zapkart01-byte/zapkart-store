---
name: ZapKart Core
colors:
  surface: '#fcf9f8'
  surface-dim: '#dcd9d9'
  surface-bright: '#fcf9f8'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f6f3f2'
  surface-container: '#f0edec'
  surface-container-high: '#ebe7e7'
  surface-container-highest: '#e5e2e1'
  on-surface: '#1c1b1b'
  on-surface-variant: '#5a4136'
  inverse-surface: '#313030'
  inverse-on-surface: '#f3f0ef'
  outline: '#8e7164'
  outline-variant: '#e2bfb0'
  surface-tint: '#a04100'
  primary: '#a04100'
  on-primary: '#ffffff'
  primary-container: '#ff6b00'
  on-primary-container: '#572000'
  inverse-primary: '#ffb693'
  secondary: '#5c5f60'
  on-secondary: '#ffffff'
  secondary-container: '#e1e3e4'
  on-secondary-container: '#626566'
  tertiary: '#0062a1'
  on-tertiary: '#ffffff'
  tertiary-container: '#059eff'
  on-tertiary-container: '#003357'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#ffdbcc'
  primary-fixed-dim: '#ffb693'
  on-primary-fixed: '#351000'
  on-primary-fixed-variant: '#7a3000'
  secondary-fixed: '#e1e3e4'
  secondary-fixed-dim: '#c5c7c8'
  on-secondary-fixed: '#191c1d'
  on-secondary-fixed-variant: '#454748'
  tertiary-fixed: '#d0e4ff'
  tertiary-fixed-dim: '#9ccaff'
  on-tertiary-fixed: '#001d35'
  on-tertiary-fixed-variant: '#00497b'
  background: '#fcf9f8'
  on-background: '#1c1b1b'
  surface-variant: '#e5e2e1'
typography:
  display-lg:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
    letterSpacing: -0.02em
  display-lg-mobile:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Inter
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
  body-lg:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-sm:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  label-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 16px
  label-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.02em
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
  container-margin: 20px
  gutter: 16px
---

## Brand & Style
The design system is engineered for a high-velocity, premium quick-commerce experience. It targets urban professionals who value efficiency, reliability, and a frictionless interface. The aesthetic is rooted in **Corporate Minimalism**, borrowing the rigorous precision of high-end fintech and SaaS platforms to elevate the grocery shopping experience.

The UI is characterized by expansive white space, a singular high-energy accent color, and a disciplined approach to information density. The emotional response is one of organized speed—ensuring the user feels that their essentials are handled with professional care.

## Colors
The palette is strictly restricted to ensure a clean, high-contrast environment. **Electric Orange** is used exclusively for primary actions, critical highlights, and brand presence. 

- **Canvas:** Pure white (#FFFFFF) is the mandatory background for all screens; dark mode is intentionally omitted to maintain brand consistency.
- **Surfaces:** Off-white (#F8F9FA) provides subtle separation for card components against the white canvas.
- **Typography:** Near-black (#0D0D0D) ensures maximum legibility for primary content, while medium grey (#6B7280) is reserved for metadata and secondary descriptions.
- **Accents:** Success and Error colors are used sparingly for system feedback (e.g., "Order Confirmed" or "Item Out of Stock").

## Typography
This design system utilizes **Inter** exclusively across all levels. To maintain a premium, clean look, the system is restricted to only two weights: **Regular (400)** for body copy and **Semi-Bold (600)** for emphasis and headings.

- **Scale:** Larger display sizes use negative letter-spacing to appear tighter and more professional.
- **Currency:** All prices must use the ₹ symbol (e.g., ₹149) with Semi-Bold weight.
- **Placeholders:** Use culturally relevant Indian names for input examples (e.g., "Arjun Sharma", "HSR Layout, Bengaluru").

## Layout & Spacing
The layout follows a strict 4px baseline grid to ensure mathematical alignment. 

- **Mobile:** Uses a fluid 2-column or 1-column grid with 20px side margins and 16px gutters between product cards.
- **Desktop:** Adopts a fixed 1200px max-width container centered on the screen.
- **Rhythm:** Vertical rhythm is maintained through 8px increments. Padding inside cards should be consistently 16px (md) to provide adequate breathing room for product imagery and text.

## Elevation & Depth
Depth is created through a combination of subtle tonal layers and soft, natural shadows. 

- **Surface Strategy:** Use the off-white surface (#F8F9FA) to define the boundaries of product cards and list items. 
- **Shadows:** A single, consistent shadow style is applied to interactive cards: `0 2px 8px rgba(0,0,0,0.07)`. This provides a gentle "lift" from the pure white background without feeling heavy or cluttered.
- **Borders:** All cards and containers must use a 1px solid border (#E9ECEF) to maintain structure, even when a shadow is present.

## Shapes
The shape language balances approachability with professional structure. 

- **Cards & Modals:** A uniform 12px radius is applied to all primary containers.
- **Action Elements:** Buttons and interactive pills (like category filters or status tags) use a fully rounded "pill" shape (9999px) to distinguish them from structural layout elements.
- **Inputs:** Form fields use a slightly tighter 8px radius to signify utility.

## Components

- **Buttons:** Primary buttons are Solid Electric Orange with White text, pill-shaped. Secondary buttons use a 1px border (#E9ECEF) with Near-black text.
- **Product Cards:** Background #F8F9FA, 12px radius, 1px border (#E9ECEF). The product image should be centered with 8px padding. Price is always Bold Semi-black.
- **Chips/Pills:** Used for categories and filters. Active state: Orange background with white text. Inactive state: White background with 1px grey border.
- **Input Fields:** Pure white background, 1px border (#E9ECEF), 8px radius. Placeholder text in Medium grey. Focus state: 1px Electric Orange border.
- **Lists:** Clean rows with 1px bottom border (#E9ECEF). No icons for simple lists; use chevron-right for navigation.
- **Quantity Selector:** A pill-shaped component with "-" and "+" buttons. The background is white with an Electric Orange border to highlight it as a high-intent action area.