import { DefaultTheme, NavigationContainer } from '@react-navigation/native';

import { LoadingState } from '../components/common/LoadingState';
import { useAuthStore } from '../store/authStore';
import { colors } from '../theme';
import { AppNavigator } from './AppNavigator';
import { AuthNavigator } from './AuthNavigator';

const navigationTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: colors.primary,
    background: colors.background,
    card: colors.surface,
    text: colors.text,
    border: colors.border,
    notification: colors.accent,
  },
};

export const NavigationRoot = () => {
  const user = useAuthStore(state => state.user);
  const isBootstrapping = useAuthStore(state => state.isBootstrapping);

  if (isBootstrapping) {
    return <LoadingState fullScreen label="Restoring your kitchen..." />;
  }

  return (
    <NavigationContainer theme={navigationTheme}>
      {user ? <AppNavigator /> : <AuthNavigator />}
    </NavigationContainer>
  );
};
