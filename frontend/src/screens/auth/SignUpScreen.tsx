import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Controller, useForm } from 'react-hook-form';
import { Text, View } from 'react-native';

import { Button } from '../../components/common/Button';
import { Card } from '../../components/common/Card';
import { InlineAlert } from '../../components/common/InlineAlert';
import { Input } from '../../components/common/Input';
import { Screen } from '../../components/common/Screen';
import { signUpWithEmail } from '../../services/auth';
import { useAuthStore } from '../../store/authStore';
import { authScreenStyles } from '../../theme/authScreen';
import type { AuthStackParamList, SignUpFormValues } from '../../types';
import { getErrorMessage } from '../../utils/error';
import { signUpSchema } from '../../utils/validation';

type Props = NativeStackScreenProps<AuthStackParamList, 'SignUp'>;

export const SignUpScreen = ({ navigation }: Props) => {
  const dataMode = useAuthStore(state => state.dataMode);
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
      <Card style={authScreenStyles.heroSecondary}>
        <Text style={authScreenStyles.kicker}>KatChef</Text>
        <Text style={authScreenStyles.heroTitle}>Create your KatChef account.</Text>
        <Text style={authScreenStyles.heroSubtitle}>
          Start building your smart fridge, unlock XP, and get recipe ideas in minutes.
        </Text>
      </Card>

      {dataMode === 'demo' ? (
        <View style={authScreenStyles.demoBanner}>
          <Text style={authScreenStyles.demoBannerTitle}>Demo mode is active.</Text>
          <Text style={authScreenStyles.demoBannerCopy}>
            Thêm EXPO_PUBLIC_FIREBASE_* trong frontend/.env để đăng ký/đăng nhập qua Firebase.
          </Text>
        </View>
      ) : null}

      <Card>
        <Text style={authScreenStyles.sectionTitle}>Let&apos;s set up your kitchen</Text>

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

        {localError ? <InlineAlert variant="error" message={localError} /> : null}

        <Button label="Create account" onPress={onSubmit} loading={submitting} />
        <Button label="Back to login" variant="ghost" onPress={() => navigation.goBack()} />
      </Card>
    </Screen>
  );
};
