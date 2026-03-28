import { useState } from 'react';
import { StyleSheet, Text } from 'react-native';

import { Button } from '../../components/common/Button';
import { Card } from '../../components/common/Card';
import { Screen } from '../../components/common/Screen';
import { config, dataMode } from '../../constants/config';
import { signOut } from '../../services/auth';
import { colors, fontFamilies, fontSizes } from '../../theme';

export const SettingsScreen = () => {
  const [loggingOut, setLoggingOut] = useState(false);

  return (
    <Screen scroll>
      <Card>
        <Text style={styles.title}>Settings</Text>
        <Text style={styles.subtitle}>
          Phase 1 keeps this screen intentionally light, with placeholders ready for future preferences.
        </Text>
      </Card>

      <Card>
        <Text style={styles.sectionTitle}>Notifications</Text>
        <Text style={styles.copy}>Placeholder for reminders, cooking nudges, and milestone celebrations.</Text>
      </Card>

      <Card>
        <Text style={styles.sectionTitle}>Preferences</Text>
        <Text style={styles.copy}>Placeholder for dietary filters, theme tweaks, and smarter personalization.</Text>
      </Card>

      <Card>
        <Text style={styles.sectionTitle}>App info</Text>
        <Text style={styles.copy}>Version: {config.appVersion}</Text>
        <Text style={styles.copy}>Data mode: {dataMode}</Text>
        <Text style={styles.copy}>
          Backend API: {config.apiBaseUrl ? config.apiBaseUrl : 'Not configured, using mock fallbacks'}
        </Text>
      </Card>

      <Button
        label="Sign out"
        variant="danger"
        loading={loggingOut}
        onPress={async () => {
          setLoggingOut(true);
          try {
            await signOut();
          } finally {
            setLoggingOut(false);
          }
        }}
      />
    </Screen>
  );
};

const styles = StyleSheet.create({
  title: {
    fontFamily: fontFamilies.heading,
    fontSize: fontSizes.xxl,
    color: colors.text,
  },
  subtitle: {
    fontFamily: fontFamilies.body,
    fontSize: fontSizes.md,
    lineHeight: 24,
    color: colors.textMuted,
  },
  sectionTitle: {
    fontFamily: fontFamilies.headingMedium,
    fontSize: fontSizes.lg,
    color: colors.text,
  },
  copy: {
    fontFamily: fontFamilies.body,
    fontSize: fontSizes.sm,
    lineHeight: 20,
    color: colors.textMuted,
  },
});
