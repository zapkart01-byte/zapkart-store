# Store Owner App Frontend Tasks

## Task 1: Create Registration UI Components
Create reusable UI components for the 3-step registration flow

### Subtasks
- [~] Create `components/registration/StepProgress.jsx` - 3-step progress indicator
- [~] Create `components/ui/FormInput.jsx` - Input component with validation states
- [~] Create `components/registration/ImagePickerCard.jsx` - Document upload component
- [~] Create `components/registration/DeliveryRadiusPicker.jsx` - 1km/2km/3km pill selector
- [~] Create `components/registration/MapLocationPicker.jsx` - MapLibre map modal

**Dependencies**: None

---

## Task 2: Build Registration Step 1 Screen
Implement store details form with map location selector

### Subtasks
- [~] Update `app/register/store-details.jsx` with complete form
- [~] Add store name input field
- [~] Add owner full name input field
- [~] Display phone number (read-only with lock icon)
- [~] Add store type dropdown selector
- [~] Add full address textarea
- [~] Integrate MapLibre location picker button
- [~] Add opening/closing time inputs
- [~] Add delivery radius selector (1/2/3 km pills)
- [~] Implement Next button with form validation
- [~] Add stagger animations on form fields

**Dependencies**: Task 1

---

## Task 3: Build Registration Step 2 Screen
Implement bank details form with commission disclosure

### Subtasks
- [~] Update `app/register/bank-details.jsx` with complete form
- [~] Add IFSC code input with validation
- [~] Add account number input field
- [~] Add account holder name input field
- [~] Create 18% commission disclosure card (orange background)
- [~] Add Back and Next buttons
- [~] Implement IFSC format validation
- [~] Add form state management
- [~] Add stagger animations

**Dependencies**: Task 1

---

## Task 4: Build Registration Step 3 Screen
Implement document upload screen with progress tracking

### Subtasks
- [~] Update `app/register/documents.jsx` with upload interface
- [~] Create 4 image upload cards (GSTIN, PAN, Store Photo, Owner Photo)
- [~] Integrate expo-image-picker for each upload slot
- [~] Show upload progress indicators
- [~] Display thumbnail previews after upload
- [~] Implement Submit button (enabled only when all 4 uploaded)
- [~] Add loading/error states
- [~] Handle form submission

**Dependencies**: Task 1

---

## Task 5: Build Application Pending Screen
Create application under review status screen

### Subtasks
- [~] Update `app/register/pending.jsx` with review UI
- [~] Add animated clock/review illustration
- [~] Display "Application Under Review" heading
- [~] Show verification checklist (Documents ✓, Under Review ⏱, Approval Pending)
- [~] Add "Estimated 24-48 hours" helper text
- [~] Create logout button
- [~] Add subtle pulse animation on review icon

**Dependencies**: None

---

## Task 6: Build Store Dashboard Home Screen
Create main dashboard with metrics and pending orders

### Subtasks
- [~] Update `app/(tabs)/index.jsx` with dashboard layout
- [~] Create stats cards (Today's Revenue, Orders, Rating)
- [~] Build pending orders banner with pulsing animation
- [~] Add quick action buttons
- [~] Create recent orders list
- [~] Implement pull-to-refresh
- [~] Add skeleton loaders
- [~] Add empty state

**Dependencies**: None

---

## Task 7: Build Incoming Order Overlay (CRITICAL)
Create full-screen order acceptance overlay with countdown

### Subtasks
- [~] Create `components/order/IncomingOrderOverlay.jsx`
- [~] Implement 60-second countdown timer
- [~] Add timer color transitions (green → amber → red pulse)
- [~] Display order details (customer, address, items)
- [~] Show order total amount (₹)
- [~] Create large "Confirm Order" button with shimmer effect
- [~] Add small "Decline" button
- [~] Implement auto-decline after 60 seconds
- [~] Add sound/haptic feedback

**Dependencies**: None

---

## Task 8: Build Order Packing Checklist Screen
Create active order packing interface with rider tracking

### Subtasks
- [~] Update `app/(tabs)/active.jsx` with packing UI
- [~] Create order header (Order ID, time)
- [~] Build scrollable item checklist
- [~] Add checkbox tap-to-check functionality
- [~] Implement green highlight animation on check
- [~] Display rider info card
- [~] Show earnings breakdown card
- [~] Create "Ready for Pickup" CTA button
- [~] Add progress indicator
- [~] Implement haptic feedback

**Dependencies**: None

---

## Task 9: Build Orders Management Screen
Create orders tab with 4-section layout

### Subtasks
- [~] Update `app/(tabs)/orders.jsx` with sections layout
- [~] Create tab headers (Needs Action, In Progress, Completed, History)
- [~] Build Needs Action section (red border, pulsing)
- [~] Build In Progress section (blue border, timer)
- [~] Build Completed Today section
- [~] Build History section with search and pagination
- [~] Create reusable order card component
- [~] Add pull-to-refresh
- [~] Add empty states

**Dependencies**: None

---

## Task 10: Build Products Inventory Screen
Create products list with filters and swipe actions

### Subtasks
- [~] Update `app/(tabs)/products.jsx` with product list
- [~] Create filter chips (All, In Stock, Low Stock, Inactive)
- [~] Build product card with image, name, price, stock
- [~] Implement swipe-left-to-delete gesture
- [~] Add delete confirmation dialog
- [~] Create FAB (+) button
- [~] Add search bar
- [ ] Implement pull-to-refresh
- [ ] Add empty state
- [~] Add loading skeleton

**Dependencies**: None

---

## Task 11: Build Add/Edit Product Screen
Create product form with price validation

### Subtasks
- [~] Update `app/product/[id].jsx` with product form
- [~] Add image picker with camera/gallery options
- [~] Add product name input
- [~] Add category dropdown
- [~] Display platform MRP (read-only)
- [~] Add selling price input
- [~] Implement price validation (store_price <= platform_mrp)
- [~] Show red warning if price exceeds MRP
- [~] Display discount badge (auto-calculated)
- [~] Show earnings helper text
- [~] Add stock quantity input
- [~] Implement Save button with validation

**Dependencies**: None

---

## Task 12: Build Earnings Dashboard Screen
Create earnings screen with charts and settlement tracking

### Subtasks
- [~] Update `app/(tabs)/earnings.jsx` with earnings UI
- [~] Create period tabs (Today, Week, Month)
- [~] Build SVG bar chart (7-day revenue)
- [~] Display total earnings card
- [~] Show next settlement card
- [~] Create earnings breakdown
- [~] Add past settlements list
- [ ] Implement pull-to-refresh
- [ ] Add loading skeleton

**Dependencies**: None

---

## Task 13: Build Store Profile Screen
Create profile settings with open/closed toggle

### Subtasks
- [~] Update `app/(tabs)/profile.jsx` with profile UI
- [~] Display store name and initials circle
- [~] Create Online/Offline toggle switch
- [~] Show store stats cards
- [~] Add store details section
- [~] Create bank details section
- [~] Add edit buttons
- [~] Create "Request Store Deactivation" button (red)
- [~] Add logout button
- [~] Implement toggle state update

**Dependencies**: None

---

## Task 14: Store App UI Polish & Final Audit
Final polish and verification for store app

### Subtasks
- [~] Verify zero dollar signs ($) - must be ₹ only
- [~] Check all screens have loading states
- [~] Check all screens have error states
- [~] Check all screens have empty states
- [~] Verify color consistency
- [~] Test all animations (60fps)
- [~] Verify form validations
- [~] Test on different screen sizes
- [~] Remove console.log statements
- [~] Add JSDoc comments to all functions

**Dependencies**: Task 2, Task 3, Task 4, Task 5, Task 6, Task 7, Task 8, Task 9, Task 10, Task 11, Task 12, Task 13
