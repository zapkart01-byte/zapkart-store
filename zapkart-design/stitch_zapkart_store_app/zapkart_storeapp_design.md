# Zapkart_storeapp_design

## Brand Vision
A high-performance, operational tool for Indian store owners and ZapKart super admins. The design balances professional SaaS utility with the "Kinetic Minimalist" aesthetic, optimized for high-pressure retail environments (packing orders, managing inventory, tracking earnings).

## Visual Identity
- **Primary Color**: Electric Orange (#FF6B00) — used for brand presence, primary actions, and progress indicators.
- **Surface**: Kinetic Minimalist Light System (Surfaces: #F8F9FA, #FFFFFF).
- **Typography**: INTER — focus on clear hierarchy, bold numbers for financial data, and semi-bold labels for operational clarity.
- **Roundness**: ROUND_EIGHT (8px) for cards and inputs.
- **Tone**: Professional, clean, urgent yet reliable.

## Design Principles
1. **Operational Speed**: Prioritize time-sensitive data (e.g., countdowns on new orders, live packing timers).
2. **Financial Transparency**: Clear breakdown of revenue, commission, and net earnings across all financial views.
3. **High Contrast Status**: Use semantic colors (Red/Amber/Green/Blue) for intuitive order status communication.
4. **Kinetic Feedback**: Use subtle scale animations on buttons and progress pulses to signify active system states.

## Key Components & Patterns
- **TopAppBar**: Minimal with bold headlines, contextual icons (Back, Search, Help), and occasional status indicators.
- **BottomNavBar**: 5-tab navigation (Home, Orders, Products, Earnings, Profile) with active/inactive state differentiation.
- **Order Cards**: 10px radius, subtle shadows, color-coded left borders (Red: Pending, Orange: Active, Green: Completed).
- **Input Fields**: 12px radius, clear labels, inline validation, and kinetic icons (e.g., circular progress on upload).
- **Pricing Breakdown**: Standardized card pattern showing Platform MRP (read-only) vs. Selling Price with auto-calculating discount badges.

## Screen Index
1. **Store Registration (Steps 1-3)**: Progressive onboarding flow covering store info, bank details, and document verification.
2. **Application Under Review**: Status tracking view for new merchants.
3. **Store Owner Dashboard**: High-level overview of daily performance, active orders, and payout status.
4. **Incoming Order Overlay**: Full-screen urgent interrupt for new order confirmation with a countdown.
5. **Order Packing Checklist**: Operational checklist with real-time rider tracking and item validation.
6. **Store Orders Management**: Tabbed view for Pending, In-Progress, and Completed orders with history search.
7. **Product Management (Inventory)**: List view with status filters (Active/Low Stock/Inactive).
8. **Add Product Form**: Detailed entry form with image upload and pricing compliance logic.
9. **Earnings & Analytics**: Financial dashboard with revenue trends, period filters, and settlement tracking.
10. **Store Profile**: Merchant settings, lifetime stats, and store status (Open/Closed) toggles.

## Color Palette Reference
- **Electric Orange**: #FF6B00 (Primary)
- **Success Green**: #16A34A (Earnings, Delivered)
- **Warning Amber**: #F59E0B (Packing, Low Stock)
- **Error Red**: #EF4444 (Needs Action, Pending)
- **Neutral Grey**: #9CA3AF (Secondary text, inactive states)
