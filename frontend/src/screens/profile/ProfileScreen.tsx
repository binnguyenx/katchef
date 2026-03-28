import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import type { CompositeScreenProps } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { StyleSheet, Text, View } from 'react-native';

import { Button } from '../../components/common/Button';
import { Card } from '../../components/common/Card';
import { Screen } from '../../components/common/Screen';
import { getLevelProgress } from '../../constants/levels';
import { useProfileFridgeOnFocus } from '../../hooks/useProfileFridgeOnFocus';
import { useSignOutAction } from '../../hooks/useSignOutAction';
import { useAuthStore } from '../../store/authStore';
import { useFridgeStore } from '../../store/fridgeStore';
import { colors, fontFamilies, fontSizes, radii, spacing } from '../../theme';
import type { MainTabParamList, RootStackParamList } from '../../types';
import { formatDisplayName } from '../../utils/format';

type Props = CompositeScreenProps<
  BottomTabScreenProps<MainTabParamList, 'Profile'>,
  NativeStackScreenProps<RootStackParamList>
>;

export const ProfileScreen = ({ navigation }: Props) => {
  const user = useAuthStore(state => state.user);
  const profile = useAuthStore(state => state.profile);
  const dataMode = useAuthStore(state => state.dataMode);
  const fridgeItems = useFridgeStore(state => state.items);
  const { signingOut, runSignOut } = useSignOutAction();

  useProfileFridgeOnFocus(user?.uid);

  const displayName = formatDisplayName(profile?.displayName, user?.email);
  const initials = displayName.slice(0, 2).toUpperCase();
  const progress = getLevelProgress(profile?.xp ?? 0);

  return (
    <Screen scroll>
      <Card>
        <View style={styles.headerRow}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{initials}</Text>
          </View>
          <View style={styles.headerCopy}>
            <Text style={styles.name}>{displayName}</Text>
            <Text style={styles.email}>{user?.email}</Text>
            <Text style={styles.modeTag}>{dataMode === 'demo' ? 'Demo workspace' : 'Firebase connected'}</Text>
          </View>
        </View>
      </Card>

      <Card>
        <Text style={styles.sectionTitle}>Progress</Text>
        <Text style={styles.levelLabel}>
          Level {progress.current.level} - {progress.current.title}
        </Text>
        <Text style={styles.levelCopy}>
          {progress.next ? `${progress.xpRemaining} XP to ${progress.next.title}` : 'You have reached the top tier for Phase 1.'}
        </Text>
        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${Math.max(14, progress.progress * 100)}%` }]} />
        </View>
      </Card>

      <View style={styles.statsGrid}>
        <Card style={styles.statTile}>
          <Text style={styles.statValue}>{profile?.xp ?? 0}</Text>
          <Text style={styles.statLabel}>XP</Text>
        </Card>
        <Card style={styles.statTile}>
          <Text style={styles.statValue}>{profile?.stats.scans ?? 0}</Text>
          <Text style={styles.statLabel}>Scans</Text>
        </Card>
        <Card style={styles.statTile}>
          <Text style={styles.statValue}>{fridgeItems.length}</Text>
          <Text style={styles.statLabel}>Fridge items</Text>
        </Card>
        <Card style={styles.statTile}>
          <Text style={styles.statValue}>{profile?.stats.recipesSuggested ?? 0}</Text>
          <Text style={styles.statLabel}>Recipes surfaced</Text>
        </Card>
      </View>

      <Card>
        <Text style={styles.sectionTitle}>Badges</Text>
        <View style={styles.badgesWrap}>
          {(profile?.badges ?? []).map(badge => (
            <View key={badge} style={styles.badge}>
              <Text style={styles.badgeText}>{badge}</Text>
            </View>
          ))}
        </View>
      </Card>

      <Button label="Settings" variant="outline" onPress={() => navigation.navigate('Settings')} />
      <Button label="Log out" variant="danger" loading={signingOut} onPress={() => void runSignOut()} />
    </Screen>
  );
};

const styles = StyleSheet.create({
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: radii.pill,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontFamily: fontFamilies.headingMedium,
    fontSize: fontSizes.xl,
    color: colors.white,
  },
  headerCopy: {
    flex: 1,
    gap: spacing.xxs,
  },
  name: {
    fontFamily: fontFamilies.headingMedium,
    fontSize: fontSizes.xl,
    color: colors.text,
  },
  email: {
    fontFamily: fontFamilies.body,
    fontSize: fontSizes.sm,
    color: colors.textMuted,
  },
  modeTag: {
    fontFamily: fontFamilies.bodySemiBold,
    fontSize: fontSizes.xs,
    color: colors.secondaryDark,
    textTransform: 'uppercase',
  },
  sectionTitle: {
    fontFamily: fontFamilies.headingMedium,
    fontSize: fontSizes.lg,
    color: colors.text,
  },
  levelLabel: {
    fontFamily: fontFamilies.heading,
    fontSize: fontSizes.xxl,
    color: colors.text,
  },
  levelCopy: {
    fontFamily: fontFamilies.body,
    fontSize: fontSizes.sm,
    color: colors.textMuted,
  },
  progressTrack: {
    height: 12,
    borderRadius: radii.pill,
    backgroundColor: colors.backgroundAlt,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: radii.pill,
    backgroundColor: colors.accent,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  statTile: {
    width: '47%',
  },
  statValue: {
    fontFamily: fontFamilies.heading,
    fontSize: fontSizes.xxl,
    color: colors.text,
  },
  statLabel: {
    fontFamily: fontFamilies.body,
    fontSize: fontSizes.sm,
    color: colors.textMuted,
  },
  badgesWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  badge: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radii.pill,
    backgroundColor: colors.surfaceMuted,
  },
  badgeText: {
    fontFamily: fontFamilies.bodySemiBold,
    fontSize: fontSizes.sm,
    color: colors.primaryDark,
  },
});
