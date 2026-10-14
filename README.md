# Food Munch Customer App — Expo / React Native

A premium food + grocery delivery app built with **Expo SDK 52**, **React Native 0.76**, and **NativeWind v4** (Tailwind CSS for React Native).

## Features

### Auth (5 screens)
- Login (gradient hero, OTP, Google, guest, trust badges)
- Register (password strength, welcome bonus, T&C)
- Phone Login (country picker, autofill)
- Verify OTP (auto-focus, auto-verify, resend timer)
- Forgot Password (amber hero, success state)

### Main Tabs (5)
- **Home** — 18+ sections: hero carousel, live order banner, quick actions, stats, offers strip, brands, bestsellers, promo banners, category grids, top restaurants, featured carousel, cashback banner, festival tile, product grid, membership card, recently viewed, app footer
- **Categories** — group filters, grid, trending stores
- **Cart** — line items, bill, coupons, checkout CTA
- **Orders** — Active/Past tabs, live status badges
- **Profile** — gradient header, Gold card, stats, 3 sections

### Detail & Flow
- Product Detail, Store Detail, Search
- Checkout (3-step), Order Tracking (live map + timeline)
- Favourites, Coupons, Notifications, Wallet, Addresses, Chat

### Images
- All images are local (in `assets/images/`) — no remote URLs
- 34+ food, store, category, banner, user images

## Quick Start

```bash
# 1. Install dependencies
npm install --legacy-peer-deps

# 2. Start the dev server
npx expo start

# 3. Open the app
#    - Scan the QR code with Expo Go (Android/iOS)
#    - Press `i` to launch in iOS Simulator
#    - Press `a` to launch in Android Emulator
#    - Press `w` to launch in a web browser
```

> The app runs in **mock mode** by default so you can browse the entire UI
> without any backend. To wire up real Supabase + Firebase, either set the
> `EXPO_PUBLIC_*` env vars (see `.env.example`) or rely on the values baked
> into `app.json`'s `extra` block.

## Build an APK

```bash
bash build-apk.sh
```

APK output: `apk/foodmunch-customer-debug.apk`

## Configuration

| Where                        | Used For                                            |
| ---------------------------- | -------------------------------------------------- |
| `app.json` → `extra.firebase`  | Firebase Auth (email / Google / phone)            |
| `app.json` → `extra.supabaseUrl` / `extra.supabaseAnonKey` | Supabase data + realtime + storage |
| `app.json` → `extra.googleMapsApiKey` | Google Maps tiles on Android (react-native-maps) |
| `.env` (override)              | Same keys prefixed with `EXPO_PUBLIC_` (see `.env.example`) |
| `google-services.json`         | Firebase Android config (FCM push notifications)   |

The app reads from env vars first and falls back to the values in
`app.json` — so you can develop without an `.env` file.

## Project Structure

```
foodmunch-customer/
├── app/                     # Expo Router file-based routes
│   ├── (auth)/               # login / register / otp / forgot-password
│   ├── (tabs)/               # home / categories / cart / orders / profile
│   ├── store/[id].tsx       # store detail
│   ├── product/[id].tsx      # product detail
│   ├── checkout.tsx          # 3-step checkout
│   ├── order/[id].tsx        # order tracking with live map
│   └── …                    # address, wallet, coupons, favourites, search, chat
├── src/
│   ├── components/           # 30 reusable UI components
│   ├── data/                 # mock-data.ts (used when Supabase isn't configured)
│   ├── lib/                  # api / api-client / firebase / supabase / notifications / payments / realtime / storage / types
│   ├── store/                # Zustand stores: auth / cart / user
│   ├── theme/                # colors / spacing
│   └── utils/                # format / images / platform helpers
├── assets/                   # icon, splash, images/ (all bundled locally)
├── plugins/                  # Expo config plugin for Google Maps API key
├── stubs/                    # react-native-maps web stub
├── supabase/migrations/      # SQL schema + seed data (reference)
├── app.config.js             # dynamic Expo config (merges app.json)
├── app.json                   # static Expo config (Firebase / Supabase / Maps keys)
├── babel.config.js            # babel-preset-expo + nativewind + reanimated
├── metro.config.js            # expo/metro + nativewind + web stub for maps
├── tailwind.config.js         # NativeWind v4 (Tailwind) theme
├── global.css                 # `@tailwind` entry for NativeWind
├── tsconfig.json              # strict TS with `@/*` path alias to `src/*`
└── types.d.ts                 # ambient module decls for packages w/o types
```

## Tech Stack
- **Expo SDK 52**, React Native 0.76
- **expo-router 4** (file-based routing with typed routes)
- **NativeWind v4** (Tailwind CSS for React Native)
- **Zustand** for state (auth / cart / user)
- **TanStack React Query** for server cache
- **lucide-react-native** icons
- **expo-image** for fast, cached image loading
- **Supabase** for data + realtime (when configured)
- **Firebase Auth** for sign-in (when configured)
- **react-native-maps** for the live order-tracking map (Android/iOS only)

## Scripts

| Command                  | Action                                       |
| ------------------------ | -------------------------------------------- |
| `npm start`              | `expo start` — launch Metro dev server       |
| `npm run android`        | `expo run:android` — native dev build (Android) |
| `npm run ios`            | `expo run:ios` — native dev build (iOS)        |
| `npm run web`            | `expo start --web` — web dev server         |
| `npm run typecheck`      | `tsc --noEmit` — TS type check               |
| `npm run lint`           | `expo lint`                                  |
| `npm run build:preview`  | EAS preview build (internal APK)             |
| `npm run build:prod`     | EAS production build (APK)                   |
