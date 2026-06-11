---
name: ZapKart Unified System
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
  secondary: '#006e2d'
  on-secondary: '#ffffff'
  secondary-container: '#7cf994'
  on-secondary-container: '#007230'
  tertiary: '#b91a24'
  on-tertiary: '#ffffff'
  tertiary-container: '#ff6762'
  on-tertiary-container: '#6a000b'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#ffdbcc'
  primary-fixed-dim: '#ffb693'
  on-primary-fixed: '#351000'
  on-primary-fixed-variant: '#7a3000'
  secondary-fixed: '#7ffc97'
  secondary-fixed-dim: '#62df7d'
  on-secondary-fixed: '#002109'
  on-secondary-fixed-variant: '#005320'
  tertiary-fixed: '#ffdad7'
  tertiary-fixed-dim: '#ffb3ad'
  on-tertiary-fixed: '#410004'
  on-tertiary-fixed-variant: '#930013'
  background: '#fcf9f8'
  on-background: '#1c1b1b'
  surface-variant: '#e5e2e1'
typography:
  display-lg:
    fontFamily: Inter
    fontSize: 40px
    fontWeight: '700'
    lineHeight: 48px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: -0.01em
  headline-sm:
    fontFamily: Inter
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-sm:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
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
  price-lg:
    fontFamily: Inter
    fontSize: 22px
    fontWeight: '700'
    lineHeight: 28px
  headline-lg-mobile:
    fontFamily: Inter
    fontSize: 28px
    fontWeight: '700'
    lineHeight: 36px
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
  gutter: 16px
  margin-mobile: 16px
  margin-desktop: 48px
---

## Brand & Style

The design system is engineered for a high-velocity quick commerce environment, prioritizing speed, clarity, and premium reliability. It adopts a **Minimalist-Professional** aesthetic, drawing inspiration from high-end fintech and modern SaaS platforms to elevate the grocery shopping experience from a chore to a seamless utility.

The visual language relies on extreme cleanliness, utilizing significant white space to allow product imagery and the vibrant primary brand color to drive user action. The emotional response is one of efficiency and trustworthiness—users should feel that their needs are being met with surgical precision. The style is strictly "Light Mode," ensuring maximum legibility under various lighting conditions typical of on-the-go shopping.

## Colors

The color palette is dominated by **Electric Orange**, used strategically for primary actions, progress indicators, and brand touchpoints. To maintain a premium "SaaS-like" quality, the primary color is never used as a background for large surfaces; instead, it acts as a high-contrast signal against a **Pure White** foundation.

- **Primary:** Electric Orange (#FF6B00) for high-intent actions.
- **Surface:** Off-white (#F8F9FA) is reserved for card containers to provide subtle separation from the white background.
- **Feedback:** Success (Green) and Error (Red) follow industry-standard fintech tones to communicate status clearly without visual noise.
- **Typography:** A strict hierarchy of Near-black for headings and Medium-grey for metadata ensures effortless scanning of product details and pricing.

## Typography

The design system utilizes **Inter** across all scales to ensure a systematic, utilitarian feel. The hierarchy is designed for "glanceability"—the ability for a user to identify a product name, its weight/quantity, and its price in under a second.

- **Currency Formatting:** All prices must use the **₹** symbol (e.g., ₹249).
- **Weights:** Use SemiBold (600) for product titles and Bold (700) for prices to create a clear financial focal point.
- **Placeholders:** Use localized Indian names for example data (e.g., "Arjun Sharma", "Aavya Patel") to maintain contextual relevance.
- **Scaling:** On mobile devices, Display and Large Headlines scale down to maintain a compact, information-dense layout.

## Layout & Spacing

This design system uses a **Fluid Grid** model based on an 8px spatial rhythm. The layout adapts to maximize screen real estate, which is critical for displaying large product inventories.

- **Mobile (0-599px):** 4-column grid with 16px side margins and 16px gutters. Items are typically displayed in a 2-column masonry or grid format.
- **Desktop (1024px+):** 12-column grid with a maximum content width of 1280px. Margins expand to 48px to maintain a premium, airy feel.
- **Spacing Logic:** Vertical rhythm is strictly enforced. Elements within a component (e.g., product image to title) use 8px (sm); components within a section use 16px (md); and distinct sections use 32px (xl).

## Elevation & Depth

Visual hierarchy is achieved through **Tonal Layering** and a single, standardized **Ambient Shadow**. The design avoids complex depth metaphors to stay within the "Minimal/SaaS" aesthetic.

- **The Foundation:** The base layer is always Pure White (#FFFFFF).
- **The Container:** Off-white (#F8F9FA) cards sit on the white background, defined by a 1px Light Grey (#E9ECEF) border.
- **The Shadow:** A soft, diffused shadow (0 2px 8px rgba(0,0,0,0.07)) is applied to active cards or floating elements like the "View Cart" bar. This shadow should feel like a subtle lift rather than a heavy drop.
- **Interaction:** On hover (desktop), the shadow may intensify slightly (0 4px 12px rgba(0,0,0,0.1)) to indicate interactivity.

## Shapes

The shape language balances approachability with structural discipline. 

- **Containers & Cards:** Use a radius of **12px** (standardized between the 10-14px range) to provide a soft, modern feel that isn't overly "bubbly."
- **Interactive Elements:** Buttons and Category Pills use a **Pill-shaped (9999px)** radius. This distinct difference between "content containers" (rectilinear) and "action elements" (rounded) helps users intuitively identify where they can click.
- **Input Fields:** Follow the card radius (12px) to maintain alignment with the overall grid structure.

## Components

### Buttons
- **Primary:** Electric Orange background, White text, Pill-shaped. Bold weight.
- **Secondary:** White background, 1px Light Grey border, Near-black text. 
- **Ghost:** No background or border, Electric Orange text. Used for "See All" or "View Details."

### Cards (Product)
- Background: #F8F9FA.
- Border: 1px #E9ECEF.
- Radius: 12px.
- Layout: Top-aligned image (aspect ratio 1:1), followed by title, quantity (Secondary Text), and Price/Add-to-cart row.

### Input Fields
- Background: #FFFFFF.
- Border: 1px #E9ECEF.
- Focused State: 1px #FF6B00 border with a subtle orange outer glow.
- Search: Includes a leading magnifying glass icon in #6B7280.

### Chips & Pills
- Used for categories (e.g., "Dairy," "Fresh Produce").
- Active State: Electric Orange background with White text.
- Inactive State: #F8F9FA background with #6B7280 text.

### Checkout Bar (Mobile)
- A persistent floating bar at the bottom.
- Background: #FFFFFF with the standard 0 2px 8px shadow.
- Content: "X Items • ₹Price" on the left, "View Cart" Primary Button on the right.

### List Items
- Used in "My Orders" or "Address Book."
- Separated by 1px #E9ECEF bottom borders.
- High-contrast primary text with secondary text for metadata.