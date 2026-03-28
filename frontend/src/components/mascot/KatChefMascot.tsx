import { useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
  FadeInDown,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

import { mascotTips } from '../../constants/mascotTips';
import type { MascotState } from '../../types';
import { colors, fontFamilies, fontSizes, radii, shadows, spacing } from '../../theme';

type KatChefMascotProps = {
  state?: MascotState;
  tip?: string;
};

const faceByState: Record<MascotState, string> = {
  idle: '=^.^=',
  thinking: '=o.o=',
  happy: '=^w^=',
  alert: '=^o^=',
};

const chipByState: Record<MascotState, string> = {
  idle: 'Ready to cook',
  thinking: 'Thinking',
  happy: 'Pawsitive',
  alert: 'Heads up',
};

export const KatChefMascot = ({ state = 'idle', tip }: KatChefMascotProps) => {
  const bob = useSharedValue(0);
  const [showTip, setShowTip] = useState(false);
  const [tipIndex, setTipIndex] = useState(0);

  useEffect(() => {
    bob.value = withRepeat(
      withSequence(
        withTiming(-8, { duration: 1600 }),
        withTiming(8, { duration: 1600 })
      ),
      -1,
      true
    );
  }, [bob]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: bob.value }],
  }));

  const activeTip = useMemo(() => tip ?? mascotTips[tipIndex % mascotTips.length], [tip, tipIndex]);

  return (
    <View style={styles.wrapper}>
      {showTip ? (
        <Animated.View entering={FadeInDown.duration(250)} style={styles.tipBubble}>
          <Text style={styles.tipTitle}>Did you know?</Text>
          <Text style={styles.tipText}>{activeTip}</Text>
        </Animated.View>
      ) : null}

      <Animated.View style={animatedStyle}>
        <Pressable
          accessibilityRole="button"
          onPress={() => {
            setTipIndex(previous => previous + 1);
            setShowTip(previous => !previous);
          }}
          style={({ pressed }) => [styles.shell, pressed && styles.pressed]}
        >
          <View style={styles.earLeft} />
          <View style={styles.earRight} />
          <View style={styles.body}>
            <Text style={styles.face}>{faceByState[state]}</Text>
            <Text style={styles.title}>KatChef</Text>
            <View style={styles.stateChip}>
              <Text style={styles.stateChipText}>{chipByState[state]}</Text>
            </View>
          </View>
        </Pressable>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'flex-end',
    gap: spacing.sm,
  },
  tipBubble: {
    maxWidth: 250,
    backgroundColor: colors.white,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    gap: spacing.xs,
    ...shadows.card,
  },
  tipTitle: {
    fontFamily: fontFamilies.headingMedium,
    fontSize: fontSizes.sm,
    color: colors.primaryDark,
  },
  tipText: {
    fontFamily: fontFamilies.body,
    fontSize: fontSizes.sm,
    color: colors.text,
    lineHeight: 20,
  },
  shell: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: {
    opacity: 0.96,
  },
  earLeft: {
    position: 'absolute',
    top: 12,
    left: 18,
    width: 28,
    height: 28,
    borderRadius: 10,
    transform: [{ rotate: '-22deg' }],
    backgroundColor: colors.primaryDark,
  },
  earRight: {
    position: 'absolute',
    top: 12,
    right: 18,
    width: 28,
    height: 28,
    borderRadius: 10,
    transform: [{ rotate: '22deg' }],
    backgroundColor: colors.primaryDark,
  },
  body: {
    width: 138,
    height: 140,
    borderRadius: 40,
    backgroundColor: colors.primary,
    borderWidth: 5,
    borderColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    ...shadows.card,
  },
  face: {
    fontFamily: fontFamilies.bodyBold,
    fontSize: 26,
    color: colors.white,
  },
  title: {
    fontFamily: fontFamilies.headingMedium,
    fontSize: fontSizes.md,
    color: colors.white,
  },
  stateChip: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xxs,
    borderRadius: radii.pill,
  },
  stateChipText: {
    fontFamily: fontFamilies.bodyMedium,
    fontSize: fontSizes.xs,
    color: colors.white,
  },
});
