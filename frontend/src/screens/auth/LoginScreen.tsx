import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Controller, useForm } from 'react-hook-form';
import { StyleSheet, Text, View } from 'react-native';

import { Button } from '../../components/common/Button';
import { Card } from '../../components/common/Card';
import { Input } from '../../components/common/Input';
import { Screen } from '../../components/common/Screen';
import { signInWithEmail, signInWithGoogle } from '../../services/auth';
import { useAuthStore } from '../../store/authStore';
import { colors, fontFamilies, fontSizes, radii, spacing } from '../../theme';
import type { AuthStackParamList, LoginFormValues } from '../../types';
import { getErrorMessage } from '../../utils/error';
import { loginSchema } from '../../utils/validation';

type Props = NativeStackScreenProps<AuthStackParamList, 'Login'>;

export const LoginScreen = ({ navigation }: Props) => {
  const dataMode = useAuthStore(state => state.dataMode);
  const bootstrapError = useAuthStore(state => state.authError);
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });
  const [submitting, setSubmitting] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const onSubmit = handleSubmit(async values => {
    setSubmitting(true);
    setLocalError(null);

    try {
      await signInWithEmail(values.email, values.password);
    } catch (error) {
      setLocalError(getErrorMessage(error, 'We could not sign you in.'));
    } finally {
      setSubmitting(false);
    }
  });

  const onGoogle = async () => {
    setSubmitting(true);
    setLocalError(null);

    try {
      await signInWithGoogle();
    } catch (error) {
      setLocalError(getErrorMessage(error));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Screen scroll>
      <Card style={styles.hero}>
        <Text style={styles.kicker}>KatChef</Text>
        <Text style={styles.title}>Your cat-powered cooking sidekick.</Text>
        <Text style={styles.subtitle}>
          Scan ingredients, organize your fridge, and chat your way into faster meals.
        </Text>
      </Card>

      {dataMode === 'demo' ? (
        <View style={styles.banner}>
          <Text style={styles.bannerTitle}>Demo mode is active.</Text>
          <Text style={styles.bannerCopy}>
            Firebase config is missing, so KatChef stores everything locally for now.
          </Text>
        </View>
      ) : null}

      {bootstrapError ? (
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>{bootstrapError}</Text>
        </View>
      ) : null}

      <Card>
        <Text style={styles.sectionTitle}>Welcome back</Text>

        <Controller
          control={control}
          name="email"
          render={({ field: { onChange, value } }) => (
            <Input
              label="Email"
              autoCapitalize="none"
              autoComplete="email"
              keyboardType="email-address"
              value={value}
              onChangeText={onChange}
              error={errors.email?.message}
              placeholder="chef@katchef.app"
            />
          )}
        />

        <Controller
          control={control}
          name="password"
          render={({ field: { onChange, value } }) => (
            <Input
              label="Password"
              secureTextEntry
              value={value}
              onChangeText={onChange}
              error={errors.password?.message}
              placeholder="********"
            />
          )}
        />

        {localError ? (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{localError}</Text>
          </View>
        ) : null}

        <Button label="Log In" onPress={onSubmit} loading={submitting} />
        <Button label="Continue with Google" variant="outline" onPress={onGoogle} disabled={submitting} />
        <Button
          label="Forgot password?"
          variant="ghost"
          fullWidth={false}
          onPress={() => navigation.navigate('ForgotPassword')}
        />
      </Card>

      <Card style={styles.footerCard}>
        <Text style={styles.footerCopy}>New around here?</Text>
        <Button label="Create an account" variant="secondary" onPress={() => navigation.navigate('SignUp')} />
      </Card>
    </Screen>
  );
};

const styles = StyleSheet.create({
  hero: {
    backgroundColor: colors.primary,
  },
  kicker: {
    fontFamily: fontFamilies.bodySemiBold,
    fontSize: fontSizes.sm,
    color: 'rgba(255,255,255,0.8)',
    textTransform: 'uppercase',
  },
  title: {
    fontFamily: fontFamilies.heading,
    fontSize: fontSizes.hero,
    lineHeight: 42,
    color: colors.white,
  },
  subtitle: {
    fontFamily: fontFamilies.body,
    fontSize: fontSizes.md,
    lineHeight: 24,
    color: 'rgba(255,255,255,0.9)',
  },
  banner: {
    backgroundColor: colors.surfaceMuted,
    borderRadius: radii.md,
    padding: spacing.md,
    gap: spacing.xxs,
  },
  bannerTitle: {
    fontFamily: fontFamilies.bodySemiBold,
    fontSize: fontSizes.sm,
    color: colors.secondaryDark,
  },
  bannerCopy: {
    fontFamily: fontFamilies.body,
    fontSize: fontSizes.sm,
    color: colors.text,
    lineHeight: 20,
  },
  sectionTitle: {
    fontFamily: fontFamilies.headingMedium,
    fontSize: fontSizes.xl,
    color: colors.text,
  },
  footerCard: {
    alignItems: 'flex-start',
  },
  footerCopy: {
    fontFamily: fontFamilies.body,
    fontSize: fontSizes.md,
    color: colors.textMuted,
  },
  errorBox: {
    backgroundColor: 'rgba(217, 90, 90, 0.12)',
    borderRadius: radii.md,
    padding: spacing.md,
  },
  errorText: {
    fontFamily: fontFamilies.bodyMedium,
    fontSize: fontSizes.sm,
    color: colors.danger,
  },
});
