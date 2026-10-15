---
Task ID: dark-mode-components
Agent: general-purpose
Task: Add dark mode support to 24 components in FAuser-main project

Work Log:
- Updated the following 24 files in src/components/:
  1. AppFooter.tsx
  2. BrandsStrip.tsx
  3. CartButton.tsx
  4. CashbackBanner.tsx
  5. CategoryPill.tsx
  6. FeaturedCarousel.tsx
  7. FestivalTile.tsx
  8. LiveOrderBanner.tsx
  9. MembershipCard.tsx
  10. OffersStrip.tsx
  11. OrderStatusBadge.tsx
  12. ProductCarouselRow.tsx
  13. ProductGridSection.tsx
  14. PromoBanner.tsx
  15. QuantitySelector.tsx
  16. QuickActionsGrid.tsx
  17. RecentlyViewedStrip.tsx
  18. SeeAllPill.tsx
  19. SkeletonShimmer.tsx
  20. StatsStrip.tsx
  21. TabRow.tsx
  22. TopStoresList.tsx
  23. StoreCard.tsx
  24. BestsellersGrid.tsx

- Pattern used: `useThemeColors()` hook + inline color styles
  - Replaced `import { colors } from '@/theme/colors'` with `import { useThemeColors } from '@/store/theme'`
  - Added `const colors = useThemeColors();` inside each component
  - Stripped all `colors.xxx` references from `StyleSheet.create({...})` blocks
  - Moved color-dependent styles inline via `style={[styles.foo, { backgroundColor: colors.background, borderColor: colors.border }]}`
  - Replaced `#fff` / `#FFFFFF` -> `colors.surfaceElevated` (cards) or `colors.background`
  - Replaced `#101828` text colours -> `colors.text`
  - Replaced `#FAFAFA` / `#F7F8FA` / `#F2F4F7` / `#EEF0F3` -> `colors.surface` / `colors.surfaceAlt`
  - Replaced `#E4E7EC` -> `colors.border`, `#F2F4F7` -> `colors.borderLight`
  - Replaced `#667085` -> `colors.textMuted`, `#98A2B3` -> `colors.textSubtle`
  - Kept `colors.primary` (auto-brightens in dark mode) for brand emerald accents
  - For text on `colors.primary` backgrounds kept `color: '#fff'` (works in both modes)
  - For shadow `shadowColor`, used `'#000'` (works in both modes) — except for CartButton whose emerald glow shadow now follows `colors.primary` so the glow tints match the button in dark mode

- Special cases handled:
  - **CashbackBanner** (purple gradient) — no theme hook needed; removed unused `colors` import. Background + white text stay identical in both modes per design spec.
  - **MembershipCard** (gold gradient) — same as CashbackBanner; removed unused `colors` import. Gold gradient + brown ink text stay identical.
  - **PromoBanner** (colorful gradient) — kept gradient as-is; replaced `colors.text` on the always-white brand badge + CTA button with a fixed `INK_ON_WHITE = '#101828'` constant so the dark ink remains legible against the unchanged white surfaces.
  - **FestivalTile** (colorful gradient with white sub-tiles) — kept gradient + white sub-tile surfaces; sub-tile label uses fixed `SUBTILE_LABEL_COLOR = '#101828'` so dark text reads correctly on the always-white sub-tile bg.
  - **BestsellersGrid** (pastel category tiles) — kept tile tint pastels identical (decorative category colours); tile title + "+N more" badge use fixed `INK_ON_PASTEL = '#101828'` for legibility against the always-pastel surfaces. Section header text adapts via `colors.text`.
  - **LiveOrderBanner** (dark slate attention card) — kept the dark slate `#101828` background + white text identical in both modes (per LiveOrderBanner-style attention card spec). Only the brand-emerald accents (left strip, pulse dot, LIVE label, CTA, arrow) adapt via `colors.primary`. Shadow switched to `#000`.
  - **OffersStrip** (colorful pastel cards) — kept card pastel bg/fg identical per design spec; only section header text adapts.
  - **FeaturedCarousel** — blue brand border `#2196F3` kept identical in both modes; card surface switched to `colors.surfaceElevated`; image-wrap bg `#F0F9FF` switched to `colors.surfaceAlt` for dark-mode readability. Tag pastel colours (mint / gold / blue) kept identical with matching dark text.
  - **QuickActionsGrid** — action tiles now use theme-aware `colors.*Light` tokens (primaryLight, warningLight, pinkLight, infoLight) so the pastel backgrounds darken appropriately in dark mode while the saturated accent foregrounds (`colors.primary`, `colors.warning`, `colors.pink`, `colors.info`) provide readable contrast.
  - **StoreCard** — cleaned up dead `if (true)` emoji branch (now always renders `getStoreImage(store.id)`); fixed a pre-existing contrast bug where the rating chip text used `text-primary` (same colour as the chip bg) — now uses `color: '#fff'` on `colors.primary` chips (per the "text on primary" rule) and `color: colors.primary` on `colors.primaryLight` chips. Removed unused `StyleSheet` import. PROMOTED badge keeps `#101828` dark slate bg in both modes (matches LiveOrderBanner attention-card pattern). Removed dead `emoji` destructure.
  - **TopStoresList** — replaced the `🍽️` emoji fallback branch with always-rendered `getStoreImage(store.id)` (the helper already returns a guaranteed fallback image so the emoji branch was dead code). All surface/text/border colours adapted.
  - **OrderStatusBadge** — removed unused `colors` import. Status colours come from `orderStatusColor` map and are saturated brand colours that read correctly in both modes; the `color + '15'` 15%-tint background also works in both modes.
  - **SeeAllPill** — default `tint` now resolves to `colors.primary` via the hook (auto-brightens in dark mode); matching `shadowColor` follows the same `tintClr` so the glow tints adapt. White text/chevron kept.
  - **CartButton** — emerald button bg + glow shadow follow `colors.primary`; arrow-wrap bg kept `#fff` (white circle on green for chevron contrast) with chevron recoloured to `colors.primary` so it stays readable in dark mode.
  - **TabRow** — surface switched from hardcoded `#fff` to `colors.background`; active tab colour defaults to theme primary (auto-brightens).
  - **StatsStrip** — card surface switched from `#fff` to `colors.surfaceElevated`; divider + border use `colors.borderLight`.
  - **SkeletonShimmer** — default block tint switched to `colors.shimmerBase` (theme-aware); shimmer sweep switched to `colors.shimmerHighlight`; all skeleton cards (`SkeletonGrid`, `SkeletonRow`, `SkeletonBestsellers`) now use `colors.surfaceElevated` / `colors.surfaceAlt` / `colors.border` so loading states look correct in both modes.
  - **QuantitySelector** — primary button bg + primaryLight container bg + primaryDark icon colours all adapt; ADD label keeps `color: '#fff'` on the green primary surface (per rule).
  - **ProductCarouselRow / ProductGridSection** — section titles, subtitles, see-all CTAs, empty-state surfaces, filter chips, and skeleton-card surfaces all adapt. Active chip uses `colors.primary50` bg + `colors.primary` text + border.
  - **RecentlyViewedStrip** — card surface, border, name/unit/price text, rating chip all adapt. Star icon keeps `#fff` on the emerald rating chip.

- Emoji → real image replacements:
  - **BrandsStrip**: kept brand emojis (no brand logos available); brand circle bg switched to `colors.surfaceElevated` per task spec.
  - **BestsellersGrid**: kept `tile.images` (already `require()`'d from mock-data) and `tile.emojis` fallback — no change needed.
  - **StoreCard**: removed dead `if (true)` ternary; now always renders `getStoreImage(store.id)`.
  - **TopStoresList**: removed `🍽️` emoji fallback branch; now always renders `getStoreImage(store.id)` (helper already returns a guaranteed image).

- Verification:
  - Confirmed via ripgrep that none of the 24 updated files still imports the legacy `colors` shim from `@/theme/colors`.
  - Confirmed `useThemeColors` is called inside every component that references `colors.*`.
  - Confirmed `useIsDark` is NOT imported in any of the 24 files (only used in already-updated CategoryGrid/ProductCard/ThemeToggle).
  - Could not run `tsc --noEmit` because the project's `node_modules` is not installed in this sandbox; manual review of each file confirmed syntactic + type correctness (no references to undefined `colors`, no leftover StyleSheet style props that reference removed colour fields).

Stage Summary:
- All 24 components updated for dark mode using the `useThemeColors()` hook + inline colour style pattern.
- Emoji placeholders replaced with real images where applicable (StoreCard + TopStoresList dead emoji branches cleaned up; BrandsStrip emojis retained per spec).
- No layout, animation, or behavioural changes — only colour sources switched from static legacy `colors` to theme-reactive `useThemeColors()`.
- Colorful gradient / pastel / dark-attention-card components (CashbackBanner, MembershipCard, PromoBanner, FestivalTile, BestsellersGrid, LiveOrderBanner, OffersStrip, FeaturedCarousel tags) retain their visual identity in both modes per the design spec; only their structural surfaces (where applicable) and accent text adapt.

---
Task ID: dark-mode-screens
Agent: general-purpose
Task: Add dark mode support to 24 screen files in FAuser-main project

Work Log:
- Updated the following 24 screen files:
  Tab screens (5):
    1. app/(tabs)/index.tsx (HOME — minimal update per spec: root container bg + back-to-top pill)
    2. app/(tabs)/categories.tsx
    3. app/(tabs)/orders.tsx
    4. app/(tabs)/cart.tsx
    5. app/(tabs)/profile.tsx (incl. ThemeToggle integration in Preferences section)
  Stack screens (13):
    6. app/(tabs)/(stack)/_layout.tsx
    7. app/(tabs)/(stack)/product/[id].tsx
    8. app/(tabs)/(stack)/store/[id].tsx
    9. app/(tabs)/(stack)/order/[id].tsx
    10. app/(tabs)/(stack)/search.tsx
    11. app/(tabs)/(stack)/checkout.tsx
    12. app/(tabs)/(stack)/wallet.tsx
    13. app/(tabs)/(stack)/coupons.tsx
    14. app/(tabs)/(stack)/favourites.tsx
    15. app/(tabs)/(stack)/notifications.tsx
    16. app/(tabs)/(stack)/chat.tsx
    17. app/(tabs)/(stack)/address/index.tsx
    18. app/(tabs)/(stack)/address/add.tsx
  Auth screens (6):
    19. app/(auth)/_layout.tsx
    20. app/(auth)/login.tsx
    21. app/(auth)/register.tsx
    22. app/(auth)/forgot-password.tsx
    23. app/(auth)/phone-login.tsx
    24. app/(auth)/verify-otp.tsx

- Pattern used: `useThemeColors()` hook + inline color styles (matches the components dark-mode worklog)
  - Replaced `import { colors } from '@/theme/colors'` with `import { useThemeColors } from '@/store/theme'`
  - Added `const colors = useThemeColors();` inside every component that references `colors.*`
  - For each NativeWind `className="bg-white ..."`: added inline `style={{ backgroundColor: colors.surfaceElevated, borderColor: colors.border, ... }}`
  - For each NativeWind `className="bg-surface ..."`: added inline `style={{ backgroundColor: colors.surface, borderColor: colors.border }}`
  - For each NativeWind `className="text-textmain ..."`: added inline `style={{ color: colors.text }}`
  - For each NativeWind `className="text-muted ..."`: added inline `style={{ color: colors.textMuted }}`
  - For each NativeWind `className="text-subtle ..."`: added inline `style={{ color: colors.textSubtle }}`
  - For each NativeWind `className="text-primary ..." / "text-success ..." / "text-error ..." / "text-warning ..."`: added inline `style={{ color: colors.primary / colors.success / colors.error / colors.warning }}`
  - Hardcoded shadow `shadowColor: '#0F172A'` → `'#000'` (per spec; works in both modes)
  - Hardcoded `'#0F172A'` shadow tints → `'#000'` on card shadows
  - Hardcoded `'#12B76A'` shadow tints → `colors.primary` (auto-brightens in dark mode)
  - Tab-pill active background `'#fff'` → `colors.surfaceElevated` (so the active pill adapts to dark mode)
  - StyleSheet blocks: removed all `colors.xxx` references; kept only structural styles (padding, radius, layout)
  - StyleSheet blocks (`mapStyles` in address/add.tsx and order/[id].tsx): stripped `backgroundColor: colors.primary` and `borderColor: '#fff'` — colors now applied inline so the marker bg adapts to theme

- Special handling for tricky cases:
  - **profile.tsx ThemeToggle**: imported `ThemeToggle` from `@/components/ThemeToggle` and rendered `<ThemeToggle size="md" />` in a new "Dark Mode" row at the top of the Preferences section, with a Moon icon + label/subtitle. Helper components `StatCell`, `MenuRow`, `Divider` were converted to accept a `colors` prop (passed from the parent screen) since they live outside the main component.
  - **(tabs)/index.tsx HOME**: minimal touch per spec — only updated the root `<View style={styles.flex}>` to use `colors.background`, and the back-to-top pill bg `'#1F2937'` → `colors.surfaceElevated` with text/icon color `'#fff'` → `colors.text`. Removed the `'#fff'` bg from the `flex` style and the `'#1F2937'` bg + `'#fff'` color from the back-to-top styles in StyleSheet. The HeroCarousel sub-component used to call `useThemeColors()` itself but ended up not needing it (the hero CTA pill stays white-on-gradient in both modes, so its text/chevron were switched to a fixed `'#101828'` ink color — matching the PromoBanner `INK_ON_WHITE` pattern from the components worklog).
  - **order/[id].tsx LiveMap**: the LiveMap sub-component was hoisted out of the main component, so it now calls `useThemeColors()` itself. Its `mapStyles.marker` StyleSheet block was stripped of `backgroundColor: colors.warning` — the marker bg is now applied inline per-marker (store = warning, customer = primary, dm = warning) so each marker adapts to theme. The BillRow helper now accepts a `colors` prop.
  - **store/[id].tsx storeVisual()**: helper function lives outside the component and can't call hooks. Converted to accept a `colors: ThemeColors` param (added `import type { ThemeColors } from '@/theme/colors'`). The CatChip sub-component calls `useThemeColors()` itself.
  - **checkout.tsx**: helper sub-components (`Section`, `BillRow`, `PaymentRow`, `Divider`) were converted to accept a `colors` prop. The badge sub-components (`RazorpayBadge`, `MockBadge`) call `useThemeColors()` themselves since they're self-contained.
  - **cart.tsx Row helper**: now calls `useThemeColors()` itself.
  - **address/add.tsx mapStyles**: stripped `backgroundColor: colors.primary` from marker and fab, and `borderColor: '#fff'` from marker. The marker bg + border color are now applied inline (`[mapStyles.marker, { backgroundColor: colors.primary, borderColor: '#fff' }]`). The FAB bg is applied inline (`[mapStyles.fab, { backgroundColor: colors.primary }]`). The Field helper was converted to accept a `colors` prop.
  - **product/[id].tsx Header**: sub-component was hoisted out, so it now calls `useThemeColors()` itself. The header bg-white is overridden inline to `colors.surfaceElevated`.
  - **Auth screens** (login, register, forgot-password, phone-login, verify-otp):
    - Kept the gradient hero headers as-is per spec (purple `colors.primary` for login/register/phone-login/verify-otp; amber `#F59E0B` for forgot-password) — `colors.primary` auto-brightens in dark mode.
    - Form field backgrounds (`bg-surface` className) overridden to `colors.surfaceElevated` with `borderColor: colors.border` (per spec instruction to use surfaceElevated for auth form fields).
    - Text inputs got inline `style={{ color: colors.text }}`.
    - White-pill buttons (Google Sign In button bg `'#fff'`, forgot-password's "Reset via Phone OTP instead" bg `'#fff'`) overridden to `colors.surfaceElevated` with `borderColor: colors.border`.
    - The Google "G" badge circle stays `'#fff'` (white circle with the Google "G" logo — decorative, kept identical in both modes).
    - The register.tsx Field helper was converted to accept a `colors` prop; the verify-otp.tsx OTP input boxes use `colors.surfaceElevated` for empty-state bg (instead of `colors.surface`) and `colors.primary50` for filled-state bg.
    - All "Remember your password?" / "Already have an account?" / "Don't have an account?" / "Prefer email?" / "Want to use email instead?" / "Continue as guest" / trust-badge labels got inline `style={{ color: colors.text / colors.textMuted / colors.primary }}` overrides so they adapt.

- Verification:
  - Confirmed via ripgrep that NONE of the 24 screen files still imports the legacy `colors` value shim from `@/theme/colors`. The only remaining import from `@/theme/colors` is a `type ThemeColors` import in `app/(tabs)/(stack)/store/[id].tsx` (used to type the `storeVisual` helper's `colors` param) — this is a type-only import, not the static `colors` value.
  - Confirmed `useThemeColors` is called inside every component that references `colors.*`.
  - Confirmed `useThemeColors` is called inside every hoisted sub-component that needs theme colors: `HeroCarousel` (no longer — its colors var was unused, removed), `Header` (product/[id].tsx), `LiveMap`, `CatChip`, `Row` (cart.tsx), `EmptyState` (search.tsx), `RazorpayBadge`, `MockBadge`, and the auth-screen form `Field` helper accepts `colors` as a prop.
  - Could not run `tsc --noEmit` because the project's `node_modules` is not installed in this sandbox; manual review of each file confirmed syntactic + type correctness (no references to undefined `colors`, no leftover StyleSheet style props that reference removed colour fields, all `colors` references resolve to a `useThemeColors()` call in scope).

Stage Summary:
- All 24 screens updated for dark mode using the `useThemeColors()` hook + inline colour style pattern.
- ThemeToggle (`<ThemeToggle size="md" />`) added to the profile screen's Preferences section, in a new "Dark Mode" row alongside the existing Notifications/Chat Support/Help/Privacy/Settings rows.
- No layout, animation, or behavioural changes — only colour sources switched from static legacy `colors` to theme-reactive `useThemeColors()`.
- Auth-screen gradient hero headers (purple `colors.primary`, amber `#F59E0B`) kept as-is per spec; only their form-field backgrounds, input text, white-pill buttons, and contextual text labels adapt to dark mode.
- Tab-pill active background (`'#fff'`), back-to-top pill bg (`'#1F2937'`), and shadow tints (`'#0F172A'` / `'#12B76A'`) updated to theme-aware equivalents (`colors.surfaceElevated` / `'#000'` / `colors.primary`).
- All NativeWind `className` strings retained (no className→style conversions); inline `style` overrides added where the className would conflict with dark-mode colours.
