import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { bootstrapUserProfile } from '../../services/firestore';
import { useAuthStore } from '../../store/authStore';
import { colors, fontFamilies, fontSizes, radii, spacing } from '../../theme';
import { getErrorMessage } from '../../utils/error';
import { Button } from './Button';

export const SessionSyncBanner = () => {
  const user = useAuthStore(state => state.user);
  const authError = useAuthStore(state => state.authError);
  const setAuthError = useAuthStore(state => state.setAuthError);
  const setProfile = useAuthStore(state => state.setProfile);
  const [retrying, setRetrying] = useState(false);

  if (!user || !authError) {
    return null;
  }

  const onRetry = async () => {
    setRetrying(true);
    setAuthError(null);
    try {
      const profile = await bootstrapUserProfile(user);
      setProfile(profile);
    } catch (error) {
      setProfile(null);
      setAuthError(getErrorMessage(error, 'We could not restore your KatChef session.'));
    } finally {
      setRetrying(false);
    }
  };

  const onDismiss = () => {
    setAuthError(null);
  };

  return (
    <SafeAreaView edges={['top']} style={styles.safe}>
      <View style={styles.box}>
        <Text style={styles.title}>Could not sync your account</Text>
        <Text style={styles.copy}>{authError}</Text>
        <View style={styles.actions}>
          <Button label="Retry" onPress={() => void onRetry()} loading={retrying} fullWidth={false} />
          <Button label="Dismiss" variant="ghost" onPress={onDismiss} fullWidth={false} />
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: {
    backgroundColor: 'rgba(217, 90, 90, 0.12)',
  },
  box: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.sm,
    gap: spacing.xs,
  },
  title: {
    fontFamily: fontFamilies.bodySemiBold,
    fontSize: fontSizes.sm,
    color: colors.danger,
  },
  copy: {
    fontFamily: fontFamilies.body,
    fontSize: fontSizes.sm,
    color: colors.text,
    lineHeight: 20,
  },
  actions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
});
