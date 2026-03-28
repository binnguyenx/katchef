import { StyleSheet } from 'react-native';

import { colors } from './colors';
import { spacing } from './spacing';
import { fontFamilies, fontSizes } from './typography';

const radiusMd = 18 as const;

/** Dùng chung cho header card + thông báo lỗi/thành công trên nhiều màn. */
export const screenSharedStyles = StyleSheet.create({
  pageTitle: {
    fontFamily: fontFamilies.heading,
    fontSize: fontSizes.xxl,
    color: colors.text,
  },
  pageSubtitle: {
    fontFamily: fontFamilies.body,
    fontSize: fontSizes.md,
    lineHeight: 24,
    color: colors.textMuted,
  },
  panelTitle: {
    fontFamily: fontFamilies.headingMedium,
    fontSize: fontSizes.lg,
    color: colors.text,
  },
  panelCopy: {
    fontFamily: fontFamilies.body,
    fontSize: fontSizes.sm,
    lineHeight: 20,
    color: colors.textMuted,
  },
  cardSectionTitle: {
    fontFamily: fontFamilies.headingMedium,
    fontSize: fontSizes.xl,
    color: colors.text,
  },
  settingsSectionTitle: {
    fontFamily: fontFamilies.headingMedium,
    fontSize: fontSizes.lg,
    color: colors.text,
  },
  inlineErrorBox: {
    backgroundColor: 'rgba(217, 90, 90, 0.12)',
    borderRadius: radiusMd,
    padding: spacing.md,
  },
  inlineErrorText: {
    fontFamily: fontFamilies.bodyMedium,
    fontSize: fontSizes.sm,
    color: colors.danger,
  },
  inlineSuccessBox: {
    backgroundColor: 'rgba(103, 184, 107, 0.12)',
    borderRadius: radiusMd,
    padding: spacing.md,
  },
  inlineSuccessText: {
    fontFamily: fontFamilies.bodyMedium,
    fontSize: fontSizes.sm,
    color: colors.secondaryDark,
  },
});
