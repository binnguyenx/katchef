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
import { signInWithEmail, signInWithGoogle } from '../../services/auth';
import { useAuthStore } from '../../store/authStore';
import { authScreenStyles } from '../../theme/authScreen';
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
      <Card style={authScreenStyles.heroPrimary}>
        <Text style={authScreenStyles.kicker}>KatChef</Text>
        <Text style={authScreenStyles.heroTitle}>Your cat-powered cooking sidekick.</Text>
        <Text style={authScreenStyles.heroSubtitle}>
          Scan ingredients, organize your fridge, and chat your way into faster meals.
        </Text>
      </Card>

      {dataMode === 'demo' ? (
        <View style={authScreenStyles.demoBanner}>
          <Text style={authScreenStyles.demoBannerTitle}>Demo mode is active.</Text>
          <Text style={authScreenStyles.demoBannerCopy}>
            Firebase config is missing, so KatChef stores everything locally for now.
          </Text>
        </View>
      ) : null}

      {bootstrapError ? <InlineAlert variant="error" message={bootstrapError} /> : null}

      <Card>
        <Text style={authScreenStyles.sectionTitle}>Welcome back</Text>

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

        {localError ? <InlineAlert variant="error" message={localError} /> : null}

        <Button label="Log In" onPress={onSubmit} loading={submitting} />
        <Button label="Continue with Google" variant="outline" onPress={onGoogle} disabled={submitting} />
        <Button
          label="Forgot password?"
          variant="ghost"
          fullWidth={false}
          onPress={() => navigation.navigate('ForgotPassword')}
        />
      </Card>

      <Card style={authScreenStyles.footerCard}>
        <Text style={authScreenStyles.footerCopy}>New around here?</Text>
        <Button label="Create an account" variant="secondary" onPress={() => navigation.navigate('SignUp')} />
      </Card>
    </Screen>
  );
};
