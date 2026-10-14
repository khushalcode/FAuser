export const colors = {
  primary: '#12B76A',         // emerald 500
  primaryDark: '#039855',     // emerald 600
  primaryLight: '#D1FADF',    // emerald 100
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

  text: '#101828',
  textMuted: '#667085',
  textSubtle: '#98A2B3',

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

  // Premium accent colors per food category
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

  // Order status colors
  pending: '#F59E0B',
  accepted: '#3B82F6',
  preparing: '#8B5CF6',
  ready: '#06B6D4',
  picked_up: '#F97316',
  on_the_way: '#F97316',
  delivered: '#12B76A',
  cancelled: '#F04438',
  rejected: '#F04438'
} as const;

export type ColorKey = keyof typeof colors;
