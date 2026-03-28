import { StyleSheet } from 'react-native';

import { colors } from './colors';
import { spacing } from './spacing';
import { fontFamilies, fontSizes } from './typography';

import { screenSharedStyles } from './screenShared';

const radiusMd = 18 as const;

/** Hero + banner đăng nhập / đăng ký */
export const authScreenStyles = StyleSheet.create({
  heroPrimary: {
    backgroundColor: colors.primary,
  },
  heroSecondary: {
    backgroundColor: colors.secondary,
  },
  kicker: {
    fontFamily: fontFamilies.bodySemiBold,
    fontSize: fontSizes.sm,
    color: 'rgba(255,255,255,0.8)',
    textTransform: 'uppercase',
  },
  heroTitle: {
    fontFamily: fontFamilies.heading,
    fontSize: fontSizes.hero,
    lineHeight: 42,
    color: colors.white,
  },
  heroSubtitle: {
    fontFamily: fontFamilies.body,
    fontSize: fontSizes.md,
    lineHeight: 24,
    color: 'rgba(255,255,255,0.9)',
  },
  demoBanner: {
    backgroundColor: colors.surfaceMuted,
    borderRadius: radiusMd,
    padding: spacing.md,
    gap: spacing.xxs,
  },
  demoBannerTitle: {
    fontFamily: fontFamilies.bodySemiBold,
    fontSize: fontSizes.sm,
    color: colors.secondaryDark,
  },
  demoBannerCopy: {
    fontFamily: fontFamilies.body,
    fontSize: fontSizes.sm,
    color: colors.text,
    lineHeight: 20,
  },
  footerCard: {
    alignItems: 'flex-start',
  },
  footerCopy: {
    fontFamily: fontFamilies.body,
    fontSize: fontSizes.md,
    color: colors.textMuted,
  },
  sectionTitle: screenSharedStyles.cardSectionTitle,
});
