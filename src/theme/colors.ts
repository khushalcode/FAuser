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
  primary: '#FF7A00',
  primaryDark: '#E56700',
  primaryLight: '#FFE9D6',
  primary50: '#FFF5EB',
  primary100: '#FFE9D6',
  primary200: '#FFD1A8',
  primary300: '#FFB270',
  primary400: '#FF9340',
  primary500: '#FF7A00',
  primary600: '#E56700',
  primary700: '#C25400',
  primary800: '#8F3E00',
  primary900: '#662C00',

  background: '#FFFFFF',
  surface: '#FAF7F4',
  surfaceAlt: '#F3EEE9',
  surfaceElevated: '#FFFFFF',

  text: '#17120D',
  textMuted: '#6F665E',
  textSubtle: '#A39A91',
  textOnPrimary: '#FFFFFF',
  textInverse: '#FFFFFF',

  border: '#E9E2DB',
  borderLight: '#F4EFEA',

  error: '#F04438',
  errorLight: '#FEE4E2',
  warning: '#F59E0B',
  warningLight: '#FEF3C7',
  success: '#12B76A',
  successLight: '#D1FADF',
  info: '#3B82F6',
  infoLight: '#DBEAFE',

  food: '#FF7A00',
  foodLight: '#FFE9D6',
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
  shimmerBase: '#EAE3DC',
  shimmerHighlight: '#F6F1EC',
};

export const darkColors: ThemeColors = {
  primary: '#FF7A00',         // brighter emerald for dark mode contrast
  primaryDark: '#E56700',
  primaryLight: '#2B1808',
  primary50: '#1F1209',
  primary100: '#2B1808',
  primary200: '#5A3008',
  primary300: '#8F4A0A',
  primary400: '#C25E05',
  primary500: '#FF7A00',
  primary600: '#FF9340',
  primary700: '#FFB270',
  primary800: '#FFD1A8',
  primary900: '#FFE9D6',

  background: '#0F0F0F',      // near-black with subtle blue
  surface: '#141414',         // one shade lighter for sections
  surfaceAlt: '#1C1C1C',      // cards / inputs
  surfaceElevated: '#1A1A1A', // elevated cards / sheets

  text: '#F5F5F5',
  textMuted: '#A3A3A3',
  textSubtle: '#6E6E6E',
  textOnPrimary: '#FFFFFF',
  textInverse: '#0F0F0F',

  border: '#2A2A2A',
  borderLight: '#202020',

  error: '#F04438',
  errorLight: '#3A1414',
  warning: '#F59E0B',
  warningLight: '#3A2A0A',
  success: '#12B76A',
  successLight: '#0B3A24',
  info: '#3B82F6',
  infoLight: '#0E1F3A',

  food: '#FF7A00',
  foodLight: '#2B1808',
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
  shimmerBase: '#1C1C1C',
  shimmerHighlight: '#2A2A2A',
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
