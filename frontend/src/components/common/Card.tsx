import type { PropsWithChildren } from 'react';
import {
  Pressable,
  StyleSheet,
  View,
  type PressableProps,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

import { colors, radii, shadows, spacing } from '../../theme';

type CardProps = PropsWithChildren<{
  onPress?: PressableProps['onPress'];
  style?: StyleProp<ViewStyle>;
}>;

export const Card = ({ children, onPress, style }: CardProps) => {
  if (onPress) {
    return (
      <Pressable onPress={onPress} style={({ pressed }) => [styles.card, pressed && styles.pressed, style]}>
        {children}
      </Pressable>
    );
  }

  return <View style={[styles.card, style]}>{children}</View>;
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    gap: spacing.md,
    ...shadows.card,
  },
  pressed: {
    transform: [{ translateY: 1 }],
    opacity: 0.96,
  },
});
