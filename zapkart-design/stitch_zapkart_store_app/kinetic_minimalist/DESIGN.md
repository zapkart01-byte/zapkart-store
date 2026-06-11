---
name: Kinetic Minimalist
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
  secondary: '#585f6c'
  on-secondary: '#ffffff'
  secondary-container: '#dce2f3'
  on-secondary-container: '#5e6572'
  tertiary: '#2151da'
  on-tertiary: '#ffffff'
  tertiary-container: '#7692ff'
  on-tertiary-container: '#002682'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#ffdbcc'
  primary-fixed-dim: '#ffb693'
  on-primary-fixed: '#351000'
  on-primary-fixed-variant: '#7a3000'
  secondary-fixed: '#dce2f3'
  secondary-fixed-dim: '#c0c7d6'
  on-secondary-fixed: '#151c27'
  on-secondary-fixed-variant: '#404754'
  tertiary-fixed: '#dce1ff'
  tertiary-fixed-dim: '#b7c4ff'
  on-tertiary-fixed: '#001551'
  on-tertiary-fixed-variant: '#0039b5'
  background: '#f8f9fa'
  on-background: '#191c1d'
  surface-variant: '#e1e3e4'
typography:
  headline-lg:
    fontFamily: Inter
    fontSize: 28px
    fontWeight: '700'
    lineHeight: 34px
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Inter
    fontSize: 22px
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
    letterSpacing: 0.05em
  label-sm:
    fontFamily: Inter
    fontSize: 11px
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
  gutter: 16px
  margin: 20px
---

## Brand & Style
The design system is engineered for high-velocity commerce management, prioritizing clarity, efficiency, and professional rigor. The aesthetic is rooted in **Modern Minimalism** with a **Corporate SaaS** finish. It evokes a sense of "Electric Precision"—where the vibrancy of the primary brand color meets the clinical cleanliness of a pure white workspace. 

The target audience consists of business owners and administrators who require a tool that feels premium yet utilitarian. By stripping away decorative patterns and heavy gradients, the interface minimizes cognitive load, allowing the high-energy primary color to function strictly as a call-to-action and status indicator. The visual tone is decisive, trustworthy, and distinctly focused on data integrity and operational speed.

## Colors
The palette is dominated by a "Pure White" (#FFFFFF) workspace to maintain a high-end SaaS feel. 

- **Primary:** #FF6B00 (Electric Orange) is used sparingly for primary actions, active states, and critical brand touchpoints.
- **Surface & Borders:** A tiered neutral system uses #F8F9FA for card backgrounds to separate them from the pure white page background, with #E9ECEF defining structural boundaries.
- **Typography:** Contrast is strictly managed with #0D0D0D for maximum legibility in headings and #6B7280 for secondary metadata.
- **Semantics:** Soft background variants (e.g., #DCFCE7 for success) are paired with high-contrast text to ensure status indicators are glanceable but not jarring.

No dark mode is supported in this design system to maintain the integrity of the clinical white aesthetic.

## Typography
The system utilizes **Inter** exclusively to leverage its systematic, neutral, and highly legible characteristics. 

- **Hierarchy:** Bold weights (700) are reserved for page titles, while Semi-bold (600) is used for section headers and primary labels. 
- **Mobile Optimization:** Large display sizes are capped at 28px to ensure word-wrapping is manageable on narrow viewports. 
- **Readability:** A tighter letter-spacing is applied to larger headlines to maintain a "premium" feel, while labels use slightly increased tracking for clarity at small sizes.
- **Localization:** All currency displays must use the `₹` symbol, inheriting the weight and color of the adjacent numerical value.

## Layout & Spacing
The design system employs a **8px linear scale** for all spatial relationships, ensuring a mathematical rhythm across the mobile interface.

- **Grid:** A fluid 4-column layout for mobile devices with a standard 20px outer margin and 16px gutters.
- **Touch Targets:** A strict minimum tap target of 44x44px is enforced for all interactive elements, including icon-only buttons and checkboxes.
- **Density:** As a management tool, the system leans towards "Moderate Density." Padding within cards is typically 16px (md) to maximize information density without sacrificing clarity.
- **Alignment:** All data-heavy lists and tables should follow a consistent left-alignment for text and right-alignment for currency/numerical values.

## Elevation & Depth
Depth is created through a combination of **Tonal Layering** and **Ambient Shadows**. 

1. **The Floor:** The primary background is #FFFFFF.
2. **The Surface:** Cards and containers sit on this floor using #F8F9FA.
3. **The Lift:** Interactivity and separation are defined by a singular, soft shadow profile: `0 2px 8px rgba(0,0,0,0.07)`. 

Shadows are never stacked. Only one level of elevation is used above the base surface to maintain the minimal SaaS aesthetic. Borders (#E9ECEF) are used in tandem with shadows to provide structural definition without adding visual "weight."

## Shapes
The shape language is "Modern Geometric," balancing approachability with professional structure.

- **Cards & Containers:** Fixed at a 12px (0.75rem) corner radius to provide a soft, premium feel.
- **Standard UI Elements:** Buttons, input fields, and selectors use an 8px (0.5rem) radius.
- **Pills & Badges:** Status indicators and chips use a 9999px (full-round) radius to distinguish them from structural containers.
- **Inputs:** Text fields use a subtle 8px radius to maintain a crisp, clean appearance consistent with the professional SaaS tone.

## Components
- **Buttons:** Primary buttons use a solid #FF6B00 fill with white text. Secondary buttons use a #FFFFFF fill with an #E9ECEF border and #0D0D0D text.
- **Input Fields:** Minimum height of 48px to exceed the 44px tap target. Borders are #E9ECEF, shifting to #FF6B00 on focus.
- **Cards:** Utilize the 12px radius and the specified ambient shadow. Background is always #F8F9FA.
- **Chips/Badges:** For status (e.g., "Shipped", "Pending"), use the "Soft" semantic colors (e.g., Success Soft) for the background and the "Primary" semantic color for the text.
- **Lists:** List items have a minimum height of 56px. Dividers are 1px thick using #E9ECEF.
- **Checkboxes/Radios:** Enclosed in a 44px transparent hit area. Active state is #FF6B00.
- **Data Display:** For orders and revenue, the Indian Rupee (₹) is always prefixed. Large numbers use Medium or Semi-bold weights.