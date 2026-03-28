import { Text } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { HomeScreen } from '../screens/home/HomeScreen';
import { ScanScreen } from '../screens/scan/ScanScreen';
import { ScanResultsScreen } from '../screens/scan/ScanResultsScreen';
import { MyFridgeScreen } from '../screens/fridge/MyFridgeScreen';
import { EditIngredientScreen } from '../screens/fridge/EditIngredientScreen';
import { ChatbotScreen } from '../screens/chat/ChatbotScreen';
import { ProfileScreen } from '../screens/profile/ProfileScreen';
import { SettingsScreen } from '../screens/settings/SettingsScreen';
import type { MainTabParamList, RootStackParamList } from '../types';
import { colors, fontFamilies, fontSizes } from '../theme';

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<MainTabParamList>();

const icons: Record<keyof MainTabParamList, string> = {
  Home: 'Home',
  Scan: 'Scan',
  MyFridge: 'Fridge',
  Chatbot: 'Chat',
  Profile: 'Profile',
};

const MainTabs = () => (
  <Tab.Navigator
    screenOptions={({ route }) => ({
      headerShown: false,
      tabBarActiveTintColor: colors.primary,
      tabBarInactiveTintColor: colors.textMuted,
      tabBarStyle: {
        height: 72,
        paddingBottom: 10,
        paddingTop: 10,
        backgroundColor: colors.surface,
        borderTopColor: colors.border,
      },
      tabBarLabelStyle: {
        fontFamily: fontFamilies.bodyMedium,
        fontSize: fontSizes.xs,
      },
      tabBarIcon: ({ color }) => (
        <Text
          style={{
            color,
            fontFamily: fontFamilies.bodySemiBold,
            fontSize: fontSizes.xs,
          }}
        >
          {icons[route.name]}
        </Text>
      ),
    })}
  >
    <Tab.Screen name="Home" component={HomeScreen} />
    <Tab.Screen name="Scan" component={ScanScreen} />
    <Tab.Screen name="MyFridge" component={MyFridgeScreen} options={{ title: 'Fridge' }} />
    <Tab.Screen name="Chatbot" component={ChatbotScreen} options={{ title: 'Chat' }} />
    <Tab.Screen name="Profile" component={ProfileScreen} />
  </Tab.Navigator>
);

export const AppNavigator = () => (
  <Stack.Navigator
    screenOptions={{
      animation: 'slide_from_right',
      headerTintColor: colors.text,
      headerTitleStyle: {
        fontFamily: fontFamilies.headingMedium,
        fontSize: fontSizes.md,
      },
      contentStyle: {
        backgroundColor: colors.background,
      },
    }}
  >
    <Stack.Screen name="MainTabs" component={MainTabs} options={{ headerShown: false }} />
    <Stack.Screen name="ScanResults" component={ScanResultsScreen} options={{ title: 'Confirm Scan' }} />
    <Stack.Screen name="EditIngredient" component={EditIngredientScreen} options={{ title: 'Ingredient' }} />
    <Stack.Screen name="Settings" component={SettingsScreen} />
  </Stack.Navigator>
);
