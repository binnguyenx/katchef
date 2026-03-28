import 'react-native-gesture-handler';

import { useEffect } from 'react';
import { StyleSheet } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';

import { LoadingState } from './src/components/common/LoadingState';
import { useAuthBootstrap } from './src/hooks/useAuthBootstrap';
import { useFontsLoader } from './src/hooks/useFontsLoader';
import { NavigationRoot } from './src/navigation';

void SplashScreen.preventAutoHideAsync().catch(() => undefined);

export default function App() {
  const [fontsLoaded] = useFontsLoader();

  useAuthBootstrap();

  useEffect(() => {
    if (fontsLoaded) {
      void SplashScreen.hideAsync().catch(() => undefined);
    }
  }, [fontsLoaded]);

  return (
    <GestureHandlerRootView style={styles.container}>
      <SafeAreaProvider>
        <StatusBar style="dark" />
        {fontsLoaded ? <NavigationRoot /> : <LoadingState fullScreen label="Plating KatChef..." />}
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
