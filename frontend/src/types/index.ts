import type { NavigatorScreenParams } from '@react-navigation/native';

export type AuthProviderType = 'password' | 'google.com' | 'demo';
export type MascotState = 'idle' | 'thinking' | 'happy' | 'alert';
export type IngredientCategory =
  | 'Vegetable'
  | 'Fruit'
  | 'Protein'
  | 'Dairy'
  | 'Grain'
  | 'Spice'
  | 'Pantry'
  | 'Drink'
  | 'Bakery'
  | 'Frozen'
  | 'Other';
export type ChatRole = 'user' | 'assistant' | 'system';

export interface AuthSession {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string | null;
  providerId: AuthProviderType;
}

export interface UserProfile {
  id: string;
  email: string;
  displayName: string;
  photoURL?: string | null;
  xp: number;
  level: number;
  levelTitle: string;
  streak: number;
  badges: string[];
  stats: {
    scans: number;
    recipesSuggested: number;
    fridgeItemsSaved: number;
    chatsStarted: number;
  };
  createdAt: string;
  updatedAt: string;
}

export interface FridgeItem {
  id: string;
  name: string;
  quantity: string;
  category: IngredientCategory;
  source: 'manual' | 'scan';
  createdAt: string;
  updatedAt: string;
}

export interface IngredientDetection {
  id: string;
  name: string;
  quantity: string;
  category: IngredientCategory;
  confidence: number;
}

export interface VisionDetectResponse {
  ingredients: IngredientDetection[];
}

export interface ChatRequestPayload {
  message: string;
  fridgeItems?: Array<Pick<FridgeItem, 'name' | 'quantity' | 'category'>>;
  sessionId?: string;
}

export interface ChatbotResponse {
  reply: string;
  suggestedRecipes: string[];
  tips: string[];
}

export interface ChatMessage {
  id: string;
  role: ChatRole;
  content: string;
  createdAt: string;
  suggestedRecipes?: string[];
  tips?: string[];
  pending?: boolean;
}

export interface LoginFormValues {
  email: string;
  password: string;
}

export interface SignUpFormValues {
  displayName: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface ForgotPasswordFormValues {
  email: string;
}

export interface IngredientFormValues {
  name: string;
  quantity: string;
  category: IngredientCategory;
}

export type MainTabParamList = {
  Home: undefined;
  Scan: undefined;
  MyFridge: undefined;
  Chatbot: undefined;
  Profile: undefined;
};

export type RootStackParamList = {
  MainTabs: NavigatorScreenParams<MainTabParamList>;
  ScanResults: {
    imageUri?: string;
    detections: IngredientDetection[];
  };
  EditIngredient: {
    itemId?: string;
  };
  Settings: undefined;
};

export type AuthStackParamList = {
  Login: undefined;
  SignUp: undefined;
  ForgotPassword: undefined;
};
