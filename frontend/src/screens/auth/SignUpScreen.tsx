import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Controller, useForm } from 'react-hook-form';
import { StyleSheet, Text, View } from 'react-native';

import { Button } from '../../components/common/Button';
import { Card } from '../../components/common/Card';
import { Input } from '../../components/common/Input';
import { Screen } from '../../components/common/Screen';
import { signUpWithEmail } from '../../services/auth';
import { colors, fontFamilies, fontSizes, radii, spacing } from '../../theme';
import type { AuthStackParamList, SignUpFormValues } from '../../types';
import { getErrorMessage } from '../../utils/error';
import { signUpSchema } from '../../utils/validation';

type Props = NativeStackScreenProps<AuthStackParamList, 'SignUp'>;

export const SignUpScreen = ({ navigation }: Props) => {
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<SignUpFormValues>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      displayName: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  });
  const [submitting, setSubmitting] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const onSubmit = handleSubmit(async values => {
    setSubmitting(true);
    setLocalError(null);

    try {
      await signUpWithEmail(values);
    } catch (error) {
      setLocalError(getErrorMessage(error, 'We could not create your account.'));
    } finally {
      setSubmitting(false);
    }
  });

  return (
    <Screen scroll>
      <Card style={styles.hero}>
        <Text style={styles.kicker}>Phase 1 Frontend</Text>
        <Text style={styles.title}>Create your KatChef account.</Text>
        <Text style={styles.subtitle}>
          Start building your smart fridge, unlock XP, and get recipe ideas in minutes.
        </Text>
      </Card>

      <Card>
        <Text style={styles.sectionTitle}>Let&apos;s set up your kitchen</Text>

        <Controller
          control={control}
          name="displayName"
          render={({ field: { onChange, value } }) => (
            <Input
              label="Display name"
              value={value}
              onChangeText={onChange}
              error={errors.displayName?.message}
              placeholder="Chef Kat"
            />
          )}
        />

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
              placeholder="At least 6 characters"
            />
          )}
        />

        <Controller
          control={control}
          name="confirmPassword"
          render={({ field: { onChange, value } }) => (
            <Input
              label="Confirm password"
              secureTextEntry
              value={value}
              onChangeText={onChange}
              error={errors.confirmPassword?.message}
              placeholder="Re-enter your password"
            />
          )}
        />

        {localError ? (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{localError}</Text>
          </View>
        ) : null}

        <Button label="Create account" onPress={onSubmit} loading={submitting} />
        <Button label="Back to login" variant="ghost" onPress={() => navigation.goBack()} />
      </Card>
    </Screen>
  );
};

const styles = StyleSheet.create({
  hero: {
    backgroundColor: colors.secondary,
  },
  kicker: {
    fontFamily: fontFamilies.bodySemiBold,
    fontSize: fontSizes.sm,
    color: 'rgba(255,255,255,0.84)',
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
    color: 'rgba(255,255,255,0.92)',
  },
  sectionTitle: {
    fontFamily: fontFamilies.headingMedium,
    fontSize: fontSizes.xl,
    color: colors.text,
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
