import { useCallback } from 'react';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { useFocusEffect } from '@react-navigation/native';
import { StyleSheet, Text, View } from 'react-native';

import { Button } from '../../components/common/Button';
import { Card } from '../../components/common/Card';
import { Screen } from '../../components/common/Screen';
import { KatChefMascot } from '../../components/mascot/KatChefMascot';
import { getLevelProgress } from '../../constants/levels';
import { getUserProfile } from '../../services/firestore';
import { useAuthStore } from '../../store/authStore';
import { useFridgeStore } from '../../store/fridgeStore';
import { colors, fontFamilies, fontSizes, radii, spacing } from '../../theme';
import type { MainTabParamList } from '../../types';
import { formatDisplayName, pluralize } from '../../utils/format';

type Props = BottomTabScreenProps<MainTabParamList, 'Home'>;

export const HomeScreen = ({ navigation }: Props) => {
  const user = useAuthStore(state => state.user);
  const profile = useAuthStore(state => state.profile);
  const setProfile = useAuthStore(state => state.setProfile);
  const dataMode = useAuthStore(state => state.dataMode);
  const items = useFridgeStore(state => state.items);
  const loadItems = useFridgeStore(state => state.loadItems);

  useFocusEffect(
    useCallback(() => {
      if (!user?.uid) {
        return;
      }

      void loadItems(user.uid);
      void getUserProfile(user.uid).then(nextProfile => {
        if (nextProfile) {
          setProfile(nextProfile);
        }
      });
    }, [loadItems, setProfile, user?.uid])
  );

  const xp = profile?.xp ?? 0;
  const progress = getLevelProgress(xp);
  const displayName = formatDisplayName(profile?.displayName, user?.email);
  const mascotState = items.length === 0 ? 'alert' : xp >= 40 ? 'happy' : 'thinking';

  return (
    <Screen scroll>
      <Card style={styles.hero}>
        <View style={styles.heroRow}>
          <View style={styles.heroCopy}>
            <Text style={styles.eyebrow}>Good to see you, {displayName}</Text>
            <Text style={styles.heroTitle}>Let&apos;s turn what you have into something delicious.</Text>
            <Text style={styles.heroSubtitle}>
              {dataMode === 'demo'
                ? 'Demo mode is on, so this workspace stays fully clickable in Codespaces.'
                : 'Your profile, fridge, and chat are synced with Firebase.'}
            </Text>
          </View>
          <KatChefMascot state={mascotState} />
        </View>

        <View style={styles.metricsRow}>
          <View style={styles.metricTile}>
            <Text style={styles.metricLabel}>XP</Text>
            <Text style={styles.metricValue}>{xp}</Text>
          </View>
          <View style={styles.metricTile}>
            <Text style={styles.metricLabel}>Level</Text>
            <Text style={styles.metricValue}>{progress.current.level}</Text>
          </View>
        </View>

        <View style={styles.progressBlock}>
          <View style={styles.progressMeta}>
            <Text style={styles.progressTitle}>{progress.current.title}</Text>
            <Text style={styles.progressHint}>
              {progress.next ? `${progress.xpRemaining} XP to ${progress.next.title}` : 'Top level reached'}
            </Text>
          </View>
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: `${Math.max(12, progress.progress * 100)}%` }]} />
          </View>
        </View>

        <Button label="Open KatLens Scan" onPress={() => navigation.navigate('Scan')} />
      </Card>

      <Card>
        <Text style={styles.sectionTitle}>MyFridge preview</Text>
        <Text style={styles.sectionSubtitle}>
          {items.length > 0
            ? `${pluralize(items.length, 'ingredient')} ready to use.`
            : 'Start with a scan or add ingredients manually.'}
        </Text>

        <View style={styles.previewList}>
          {items.slice(0, 3).map(item => (
            <View key={item.id} style={styles.previewItem}>
              <View>
                <Text style={styles.previewName}>{item.name}</Text>
                <Text style={styles.previewMeta}>{item.quantity}</Text>
              </View>
              <View style={styles.previewChip}>
                <Text style={styles.previewChipText}>{item.category}</Text>
              </View>
            </View>
          ))}
        </View>

        <Button label="Open MyFridge" variant="outline" onPress={() => navigation.navigate('MyFridge')} />
      </Card>

      <Text style={styles.sectionTitle}>Suggested actions</Text>

      <Card onPress={() => navigation.navigate('Scan')} style={styles.actionCard}>
        <Text style={styles.actionTitle}>Run a KatLens scan</Text>
        <Text style={styles.actionCopy}>Capture ingredients and confirm detections before saving them.</Text>
      </Card>

      <Card onPress={() => navigation.navigate('Chatbot')} style={styles.actionCard}>
        <Text style={styles.actionTitle}>Ask Gemini-style chat for a fast meal</Text>
        <Text style={styles.actionCopy}>KatChef can use your fridge context to suggest recipes and tips.</Text>
      </Card>

      <Card onPress={() => navigation.navigate('MyFridge')} style={styles.actionCard}>
        <Text style={styles.actionTitle}>Refresh your fridge list</Text>
        <Text style={styles.actionCopy}>Tidy quantities and categories so future recommendations feel sharper.</Text>
      </Card>
    </Screen>
  );
};

const styles = StyleSheet.create({
  hero: {
    backgroundColor: colors.surface,
  },
  heroRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  heroCopy: {
    flex: 1,
    gap: spacing.sm,
  },
  eyebrow: {
    fontFamily: fontFamilies.bodySemiBold,
    fontSize: fontSizes.sm,
    color: colors.primaryDark,
  },
  heroTitle: {
    fontFamily: fontFamilies.heading,
    fontSize: fontSizes.xxl,
    lineHeight: 36,
    color: colors.text,
  },
  heroSubtitle: {
    fontFamily: fontFamilies.body,
    fontSize: fontSizes.md,
    lineHeight: 24,
    color: colors.textMuted,
  },
  metricsRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  metricTile: {
    flex: 1,
    backgroundColor: colors.surfaceMuted,
    borderRadius: radii.md,
    padding: spacing.md,
    gap: spacing.xxs,
  },
  metricLabel: {
    fontFamily: fontFamilies.bodyMedium,
    fontSize: fontSizes.xs,
    color: colors.textMuted,
    textTransform: 'uppercase',
  },
  metricValue: {
    fontFamily: fontFamilies.headingMedium,
    fontSize: fontSizes.xxl,
    color: colors.text,
  },
  progressBlock: {
    gap: spacing.sm,
  },
  progressMeta: {
    gap: spacing.xxs,
  },
  progressTitle: {
    fontFamily: fontFamilies.headingMedium,
    fontSize: fontSizes.lg,
    color: colors.text,
  },
  progressHint: {
    fontFamily: fontFamilies.body,
    fontSize: fontSizes.sm,
    color: colors.textMuted,
  },
  progressTrack: {
    height: 12,
    backgroundColor: colors.backgroundAlt,
    borderRadius: radii.pill,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: radii.pill,
    backgroundColor: colors.accent,
  },
  sectionTitle: {
    fontFamily: fontFamilies.headingMedium,
    fontSize: fontSizes.xl,
    color: colors.text,
  },
  sectionSubtitle: {
    fontFamily: fontFamilies.body,
    fontSize: fontSizes.sm,
    color: colors.textMuted,
  },
  previewList: {
    gap: spacing.sm,
  },
  previewItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  previewName: {
    fontFamily: fontFamilies.bodySemiBold,
    fontSize: fontSizes.md,
    color: colors.text,
  },
  previewMeta: {
    fontFamily: fontFamilies.body,
    fontSize: fontSizes.sm,
    color: colors.textMuted,
  },
  previewChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radii.pill,
    backgroundColor: colors.surfaceMuted,
  },
  previewChipText: {
    fontFamily: fontFamilies.bodyMedium,
    fontSize: fontSizes.xs,
    color: colors.secondaryDark,
  },
  actionCard: {
    gap: spacing.xs,
  },
  actionTitle: {
    fontFamily: fontFamilies.headingMedium,
    fontSize: fontSizes.lg,
    color: colors.text,
  },
  actionCopy: {
    fontFamily: fontFamilies.body,
    fontSize: fontSizes.sm,
    lineHeight: 20,
    color: colors.textMuted,
  },
});
