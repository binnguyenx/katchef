import type { PropsWithChildren } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
  type PressableProps,
} from 'react-native';

import { colors, fontFamilies, fontSizes, radii, shadows, spacing } from '../../theme';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'outline' | 'danger';

type ButtonProps = PropsWithChildren<
  PressableProps & {
    label?: string;
    variant?: ButtonVariant;
    loading?: boolean;
    fullWidth?: boolean;
    icon?: string;
  }
>;

const variantStyles: Record<
  ButtonVariant,
  { container: object; label: object; spinner: string }
> = {
  primary: {
    container: { backgroundColor: colors.primary },
    label: { color: colors.white },
    spinner: colors.white,
  },
  secondary: {
    container: { backgroundColor: colors.secondary },
    label: { color: colors.white },
    spinner: colors.white,
  },
  ghost: {
    container: { backgroundColor: 'transparent' },
    label: { color: colors.text },
    spinner: colors.text,
  },
  outline: {
    container: { backgroundColor: colors.white, borderWidth: 1, borderColor: colors.border },
    label: { color: colors.text },
    spinner: colors.text,
  },
  danger: {
    container: { backgroundColor: colors.danger },
    label: { color: colors.white },
    spinner: colors.white,
  },
};

export const Button = ({
  label,
  children,
  variant = 'primary',
  loading = false,
  disabled,
  fullWidth = true,
  icon,
  style,
  ...props
}: ButtonProps) => {
  const currentVariant = variantStyles[variant];

  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled || loading}
      style={({ pressed }) => [
        styles.button,
        currentVariant.container,
        variant !== 'ghost' && shadows.soft,
        fullWidth && styles.fullWidth,
        pressed && styles.pressed,
        (disabled || loading) && styles.disabled,
        style,
      ]}
      {...props}
    >
      {loading ? (
        <ActivityIndicator color={currentVariant.spinner} />
      ) : (
        <View style={styles.row}>
          {icon ? <Text style={[styles.icon, currentVariant.label]}>{icon}</Text> : null}
          <Text style={[styles.label, currentVariant.label]}>{label ?? children}</Text>
        </View>
      )}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  button: {
    minHeight: 54,
    borderRadius: radii.pill,
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fullWidth: {
    width: '100%',
  },
  pressed: {
    transform: [{ scale: 0.99 }],
  },
  disabled: {
    opacity: 0.6,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  label: {
    fontFamily: fontFamilies.bodySemiBold,
    fontSize: fontSizes.md,
  },
  icon: {
    fontSize: fontSizes.md,
  },
});
