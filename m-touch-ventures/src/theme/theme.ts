import { Platform } from 'react-native';

/**
 * Clean, professional financial-ledger theme.
 * Neutral background, one accent for positive/balance figures,
 * a distinct accent for deductions (WHT).
 */
export const colors = {
  background: '#F4F5F7',
  surface: '#FFFFFF',
  surfaceAlt: '#EEF1F4',
  border: '#DFE3E8',
  textPrimary: '#1B2430',
  textSecondary: '#5B6675',
  textMuted: '#8A94A3',

  // Accent for positive / balance figures
  accent: '#0B6E4F',
  accentSoft: '#E4F3EC',

  // Distinct accent for deductions (WHT)
  deduction: '#B3401F',
  deductionSoft: '#FBEAE3',

  // Sales series (chart)
  sales: '#0B6E4F',
  purchase: '#2B5FA5',
  purchaseSoft: '#E6EDF8',

  warning: '#8A5A00',
  warningBg: '#FFF3D6',
  warningBorder: '#F0C572',

  danger: '#B3401F',
  dangerBg: '#FBEAE3',

  divider: '#E7EAEE',
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
};

export const radius = {
  sm: 6,
  md: 10,
  lg: 14,
};

export const fontFamily = Platform.select({
  ios: 'Menlo',
  android: 'monospace',
  default: 'monospace',
});

export const typography = {
  h1: { fontSize: 28, fontWeight: '700' as const, color: colors.textPrimary },
  h2: { fontSize: 20, fontWeight: '700' as const, color: colors.textPrimary },
  h3: { fontSize: 16, fontWeight: '600' as const, color: colors.textPrimary },
  body: { fontSize: 14, fontWeight: '400' as const, color: colors.textPrimary },
  caption: { fontSize: 12, fontWeight: '400' as const, color: colors.textSecondary },
  label: { fontSize: 12, fontWeight: '600' as const, color: colors.textSecondary, letterSpacing: 0.4 },
};

// Tabular / monospaced style for numeric figures so columns align.
export const numericStyle: { fontFamily: string | undefined; fontVariant: ('tabular-nums')[] } = {
  fontFamily,
  fontVariant: ['tabular-nums'],
};

export default { colors, spacing, radius, fontFamily, typography, numericStyle };
