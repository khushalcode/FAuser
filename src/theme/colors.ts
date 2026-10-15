/**
 * Theme colors — supports both LIGHT and DARK modes.
 *
 * Use the `useThemeColors()` hook (from `src/store/theme.ts`) to get the
 * active palette inside any component. The hook re-renders the component
 * when the theme mode changes.
 *
 * The static `colors` export below preserves backwards compatibility for
 * any code that still imports it — it always returns the LIGHT palette.
 */

export type ThemeMode = 'light' | 'dark' | 'system';

export interface ThemeColors {
  // Brand
  primary: string;
  primaryDark: string;
  primaryLight: string;
  primary50: string;
  primary100: string;
  primary200: string;
  primary300: string;
  primary400: string;
  primary500: string;
  primary600: string;
  primary700: string;
  primary800: string;
  primary900: string;

  // Surface
  background: string;
  surface: string;
  surfaceAlt: string;
  surfaceElevated: string; // cards on top of surface

  // Text
  text: string;
  textMuted: string;
  textSubtle: string;
  textOnPrimary: string;
  textInverse: string;

  // Borders
  border: string;
  borderLight: string;

  // Status
  error: string;
  errorLight: string;
  warning: string;
  warningLight: string;
  success: string;
  successLight: string;
  info: string;
  infoLight: string;

  // Category
  food: string;
  foodLight: string;
  grocery: string;
  groceryLight: string;

  // Premium accents
  amber: string;
  amberLight: string;
  pink: string;
  pinkLight: string;
  purple: string;
  purpleLight: string;
  cyan: string;
  cyanLight: string;
  orange: string;
  orangeLight: string;
  teal: string;
  tealLight: string;
  slate: string;
  slateLight: string;

  // Order status
  pending: string;
  accepted: string;
  preparing: string;
  ready: string;
  picked_up: string;
  on_the_way: string;
  delivered: string;
  cancelled: string;
  rejected: string;

  // Overlay
  overlay: string;        // semi-transparent backdrop
  scrim: string;          // modal scrim
  shimmerBase: string;
  shimmerHighlight: string;
}

export const lightColors: ThemeColors = {
  primary: '#12B76A',
  primaryDark: '#039855',
  primaryLight: '#D1FADF',
  primary50: '#ECFDF3',
  primary100: '#D1FADF',
  primary200: '#A6F4C5',
  primary300: '#6CE9A6',
  primary400: '#32D583',
  primary500: '#12B76A',
  primary600: '#039855',
  primary700: '#027A48',
  primary800: '#05603A',
  primary900: '#054F31',

  background: '#FFFFFF',
  surface: '#F7F8FA',
  surfaceAlt: '#EEF0F3',
  surfaceElevated: '#FFFFFF',

  text: '#101828',
  textMuted: '#667085',
  textSubtle: '#98A2B3',
  textOnPrimary: '#FFFFFF',
  textInverse: '#FFFFFF',

  border: '#E4E7EC',
  borderLight: '#F2F4F7',

  error: '#F04438',
  errorLight: '#FEE4E2',
  warning: '#F59E0B',
  warningLight: '#FEF3C7',
  success: '#12B76A',
  successLight: '#D1FADF',
  info: '#3B82F6',
  infoLight: '#DBEAFE',

  food: '#F59E0B',
  foodLight: '#FEF3C7',
  grocery: '#12B76A',
  groceryLight: '#D1FADF',

  amber: '#F59E0B',
  amberLight: '#FEF3C7',
  pink: '#EC4899',
  pinkLight: '#FCE7F3',
  purple: '#8B5CF6',
  purpleLight: '#EDE9FE',
  cyan: '#06B6D4',
  cyanLight: '#CFFAFE',
  orange: '#F97316',
  orangeLight: '#FFEDD5',
  teal: '#14B8A6',
  tealLight: '#CCFBF1',
  slate: '#64748B',
  slateLight: '#F1F5F9',

  pending: '#F59E0B',
  accepted: '#3B82F6',
  preparing: '#8B5CF6',
  ready: '#06B6D4',
  picked_up: '#F97316',
  on_the_way: '#F97316',
  delivered: '#12B76A',
  cancelled: '#F04438',
  rejected: '#F04438',

  overlay: 'rgba(16, 24, 40, 0.45)',
  scrim: 'rgba(16, 24, 40, 0.6)',
  shimmerBase: '#E4E7EC',
  shimmerHighlight: '#F2F4F7',
};

export const darkColors: ThemeColors = {
  primary: '#32D583',         // brighter emerald for dark mode contrast
  primaryDark: '#12B76A',
  primaryLight: '#054F31',
  primary50: '#0B3A24',
  primary100: '#0B3A24',
  primary200: '#027A48',
  primary300: '#039855',
  primary400: '#12B76A',
  primary500: '#32D583',
  primary600: '#6CE9A6',
  primary700: '#A6F4C5',
  primary800: '#D1FADF',
  primary900: '#ECFDF3',

  background: '#0B0F14',      // near-black with subtle blue
  surface: '#11161D',         // one shade lighter for sections
  surfaceAlt: '#1A212B',      // cards / inputs
  surfaceElevated: '#1F2733', // elevated cards / sheets

  text: '#F3F5F7',
  textMuted: '#A6B0BE',
  textSubtle: '#6B7689',
  textOnPrimary: '#0B0F14',
  textInverse: '#0B0F14',

  border: '#2A3441',
  borderLight: '#1F2733',

  error: '#F04438',
  errorLight: '#3A1414',
  warning: '#F59E0B',
  warningLight: '#3A2A0A',
  success: '#12B76A',
  successLight: '#0B3A24',
  info: '#3B82F6',
  infoLight: '#0E1F3A',

  food: '#F59E0B',
  foodLight: '#3A2A0A',
  grocery: '#12B76A',
  groceryLight: '#0B3A24',

  amber: '#F59E0B',
  amberLight: '#3A2A0A',
  pink: '#EC4899',
  pinkLight: '#3A0E22',
  purple: '#8B5CF6',
  purpleLight: '#221240',
  cyan: '#06B6D4',
  cyanLight: '#0A2D33',
  orange: '#F97316',
  orangeLight: '#3A1E0A',
  teal: '#14B8A6',
  tealLight: '#0A2D28',
  slate: '#64748B',
  slateLight: '#1F2733',

  pending: '#F59E0B',
  accepted: '#3B82F6',
  preparing: '#8B5CF6',
  ready: '#06B6D4',
  picked_up: '#F97316',
  on_the_way: '#F97316',
  delivered: '#12B76A',
  cancelled: '#F04438',
  rejected: '#F04438',

  overlay: 'rgba(0, 0, 0, 0.65)',
  scrim: 'rgba(0, 0, 0, 0.78)',
  shimmerBase: '#1F2733',
  shimmerHighlight: '#2A3441',
};

/**
 * Backwards-compatibility shim — old code that imports `colors` directly
 * still gets the LIGHT palette. New code should use `useThemeColors()`.
 */
export const colors: ThemeColors = lightColors;

/**
 * Color keys that are valid in the legacy `colors` object.
 */
export type ColorKey = keyof ThemeColors;
