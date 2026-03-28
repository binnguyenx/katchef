import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Controller, useForm } from 'react-hook-form';
import { Text } from 'react-native';

import { Button } from '../../components/common/Button';
import { Card } from '../../components/common/Card';
import { InlineAlert } from '../../components/common/InlineAlert';
import { Input } from '../../components/common/Input';
import { Screen } from '../../components/common/Screen';
import { requestPasswordReset } from '../../services/auth';
import { useAuthStore } from '../../store/authStore';
import { screenSharedStyles } from '../../theme/screenShared';
import type { AuthStackParamList, ForgotPasswordFormValues } from '../../types';
import { getErrorMessage } from '../../utils/error';
import { forgotPasswordSchema } from '../../utils/validation';

type Props = NativeStackScreenProps<AuthStackParamList, 'ForgotPassword'>;

export const ForgotPasswordScreen = ({ navigation }: Props) => {
  const dataMode = useAuthStore(state => state.dataMode);
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: '',
    },
  });
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [localError, setLocalError] = useState<string | null>(null);

  const onSubmit = handleSubmit(async values => {
    setSubmitting(true);
    setStatus(null);
    setLocalError(null);

    try {
      await requestPasswordReset(values.email);
      setStatus(
        dataMode === 'demo'
          ? 'Demo mode does not send emails, but the flow is wired and ready for Firebase.'
          : 'Password reset sent. Check your inbox for the reset link.'
      );
    } catch (error) {
      setLocalError(getErrorMessage(error, 'We could not send the reset email.'));
    } finally {
      setSubmitting(false);
    }
  });

  return (
    <Screen scroll>
      <Card>
        <Text style={screenSharedStyles.pageTitle}>Reset your password</Text>
        <Text style={screenSharedStyles.pageSubtitle}>
          Enter the email tied to your KatChef account and we&apos;ll help you get back in.
        </Text>

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

        {status ? <InlineAlert variant="success" message={status} /> : null}
        {localError ? <InlineAlert variant="error" message={localError} /> : null}

        <Button label="Send reset link" onPress={onSubmit} loading={submitting} />
        <Button label="Back to login" variant="ghost" onPress={() => navigation.goBack()} />
      </Card>
    </Screen>
  );
};
