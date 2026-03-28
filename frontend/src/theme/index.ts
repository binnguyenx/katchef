import { colors } from './colors';
import { spacing } from './spacing';
import { fontFamilies, fontSizes, lineHeights } from './typography';

export const radii = {
  sm: 12,
  md: 18,
  lg: 24,
  xl: 32,
  pill: 999,
} as const;

export const shadows = {
  card: {
    shadowColor: colors.shadow,
    shadowOpacity: 1,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
    elevation: 5,
  },
  soft: {
    shadowColor: colors.shadow,
    shadowOpacity: 1,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
} as const;

export const theme = {
  colors,
  spacing,
  radii,
  shadows,
  typography: {
    fontFamilies,
    fontSizes,
    lineHeights,
  },
} as const;

export type AppTheme = typeof theme;

export * from './colors';
export * from './spacing';
export * from './typography';
