import { StyleSheet, Text } from 'react-native';

import { Button } from '../../components/common/Button';
import { Card } from '../../components/common/Card';
import { Screen } from '../../components/common/Screen';
import { config, dataMode } from '../../constants/config';
import { useSignOutAction } from '../../hooks/useSignOutAction';
import { colors, fontFamilies, fontSizes, screenSharedStyles } from '../../theme';

export const SettingsScreen = () => {
  const { signingOut, runSignOut } = useSignOutAction();

  return (
    <Screen scroll>
      <Card>
        <Text style={screenSharedStyles.pageTitle}>Settings</Text>
        <Text style={screenSharedStyles.pageSubtitle}>
          Phase 1 keeps this screen intentionally light, with placeholders ready for future preferences.
        </Text>
      </Card>

      <Card>
        <Text style={screenSharedStyles.settingsSectionTitle}>Notifications</Text>
        <Text style={styles.copy}>Placeholder for reminders, cooking nudges, and milestone celebrations.</Text>
      </Card>

      <Card>
        <Text style={screenSharedStyles.settingsSectionTitle}>Preferences</Text>
        <Text style={styles.copy}>Placeholder for dietary filters, theme tweaks, and smarter personalization.</Text>
      </Card>

      <Card>
        <Text style={screenSharedStyles.settingsSectionTitle}>App info</Text>
        <Text style={styles.copy}>Version: {config.appVersion}</Text>
        <Text style={styles.copy}>Data mode: {dataMode}</Text>
        <Text style={styles.copy}>
          Backend API: {config.apiBaseUrl ? config.apiBaseUrl : 'Not configured, using mock fallbacks'}
        </Text>
      </Card>

      <Button label="Sign out" variant="danger" loading={signingOut} onPress={() => void runSignOut()} />
    </Screen>
  );
};

const styles = StyleSheet.create({
  copy: {
    fontFamily: fontFamilies.body,
    fontSize: fontSizes.sm,
    lineHeight: 20,
    color: colors.textMuted,
  },
});
