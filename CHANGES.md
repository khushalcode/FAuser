# Food Munch Customer App — UI Revamp v1.1

## What's New

This update focuses purely on **UI/UX improvements** to make the app feel like Blinkit / Zomato / Flipkart. No backend wiring was touched — the "LIVE" indicator badges and all API/store integrations remain intact.

## Updated Screens

### Auth Screens (5)
1. **Login** (`app/(auth)/login.tsx`)
   - Gradient emerald hero header with decorative circles
   - Express delivery stats card (500+ cities, 2M+ users)
   - Animated entrance (fade + slide + scale)
   - Email/password fields with focus states
   - Trust badges (Secure, Fast, Verified)
   - LIVE badge preserved
   - "Welcome back 👋" greeting

2. **Register** (`app/(auth)/register.tsx`)
   - Welcome bonus chip ("₹100 wallet cashback")
   - Real-time password strength meter (Weak → Strong)
   - Confirm password with ✓ indicator
   - Terms of Service checkbox
   - Animated entrance

3. **Phone Login** (`app/(auth)/phone-login.tsx`)
   - Country picker (India, USA, UK, UAE, Singapore) with flags
   - Autofill demo number button
   - Privacy reassurance card
   - Trust badges

4. **Verify OTP** (`app/(auth)/verify-otp.tsx`)
   - 6-digit OTP inputs with auto-focus next
   - Auto-verify when complete
   - Resend timer (42s countdown)
   - Tap-to-autofill demo OTP
   - Trust badges (Secure, 24×7 Help, Easy Refunds)

5. **Forgot Password** (`app/(auth)/forgot-password.tsx`)
   - Amber hero header (different color for distinction)
   - Two states: form + success
   - "Reset via Phone OTP" alternative option
   - Animated entrance

### Tab Screens (5)
6. **Categories** (`app/(tabs)/categories.tsx`)
   - Group filter pills (All / Food / Grocery)
   - Animated grid with fade-in
   - Trending stores list at bottom
   - Item count badges

7. **BottomNav** (`src/components/BottomNav.tsx`)
   - Floating pill design with rounded corners
   - Active tab indicator bar on top
   - Account tab added (5 tabs total)
   - Order count badge

8. **CartButton** (`src/components/CartButton.tsx`)
   - Slide-in animation
   - Floating cart FAB with count bubble
   - Amount chip + arrow indicator
   - Hides when cart is empty

9. **StoreCard** (`src/components/StoreCard.tsx`)
   - Real cover images via `cover_url`
   - Promoted badge
   - Rating chip overlay
   - FREE DELIVERY ribbon
   - Offer banner (e.g. "50% OFF up to ₹100")
   - Distance display

10. **Favourites** (`app/favourites.tsx`)
    - Count badge in header
    - Subtitle with saved items count
    - Better empty state

### Data Layer
- **`src/data/mock-data.ts`**:
  - Added `logo_url` and `cover_url` to all 6 stores (Unsplash images)
  - Added `image_url` to ~25 popular products (Unsplash images)
  - Products without specific images fall back to emoji

- **`src/theme/colors.ts`**:
  - Added premium accent palette (amber, pink, purple, cyan, orange, teal, slate)

## Backend Preserved
✅ All `useAuthStore` hooks intact
✅ All `useUserStore` hooks intact
✅ All `useCartStore` hooks intact
✅ All `api.*` calls intact
✅ Supabase realtime subscriptions intact
✅ Firebase auth intact
✅ LIVE badges everywhere preserved
✅ Razorpay payments intact
✅ AsyncStorage persistence intact

## How to Run
```bash
cd customer-foodmunch-updated
npm install
npx expo start
```

Then scan QR with Expo Go, or press `i` for iOS simulator, `a` for Android emulator.

## Tech Stack (unchanged)
- Expo SDK 52
- React Native 0.76
- expo-router 4
- NativeWind 4 (Tailwind CSS)
- Zustand for state
- lucide-react-native icons
- expo-image for fast image loading

---

# v1.2 — Full UI refresh + tabs everywhere

## Navigation (all tabs)
- All secondary screens (product, store, search, checkout, order tracking, wallet,
  coupons, addresses, favourites, chat, notifications) moved to `app/(tabs)/(stack)/`.
- Route groups are not part of the URL, so every path is unchanged
  (`/wallet`, `/product/1`, `/order/o1`, ...) and no `router.push` call was edited.
- `(tabs)/_layout.tsx` hosts a hidden `(stack)` tab with a nested Stack, so push/back
  still works while the bottom bar stays visible on every screen.
- `BottomNav` rewritten: in-flow (no overlap with sticky CTAs), active pill,
  badges, safe-area aware, hides with keyboard, highlights the owning tab on
  secondary screens.

## Design
- New palette (emerald 500 `#12B76A`, cooler neutrals), larger radii, softer shadows
  (`src/theme/colors.ts`, `spacing.ts`, `tailwind.config.js`).
- Back buttons + screen titles restyled consistently across all screens.
- `CartButton` repositioned for the in-flow nav.

## Backend
Untouched: `src/lib/*`, `src/store/*`, `supabase/`, `plugins/`, app config, package.json.

# UI Redesign v2 — Dark + Orange food-app style

UI only; no API, store or routing logic changed.

- Palette: orange (#FF7A00) accent, near-black dark theme, now the default mode (src/theme/colors.ts, tailwind.config.js, src/store/theme.ts). Light mode kept with a warm orange palette.
- Bottom nav: flat dark bar, orange active icon/label.
- Home header: location pill + wallet/bell/avatar, pill search with mic, VEG toggle (visual only), round image chips for tabs.
- Home hero: full-bleed image card, NEW LAUNCH tag, orange CTA.
- Home layout: hero, quick filter pills, ₹99 store, cuisines, brands, restaurants, grocery, featured, carousels, coupons, product grid.
  Removed from home (components still in src/components): DeliveryPromiseBanner, LiveOrderBanner, QuickActionsGrid, StatsStrip, LiveDeliveryTracker, OffersStrip, BestsellersGrid, PromoBanner, Snacks CategoryGrid, TrendingRecipes, CashbackBanner, MembershipCard, FestivalTile.
- Profile: dark header, 2x2 shortcut grid (Wallet / Coupons / Cart / Addresses).
