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

// Matches backend IngredientItem schema
export interface IngredientDetection {
  name: string;
  quantity?: string | null;
  confidence?: number | null;
}

export interface VisionDetectResponse {
  ingredients: IngredientDetection[];
}

// Matches backend RecipeSuggestion schema
export interface RecipeSuggestion {
  id: string;
  title: string;
  estimated_time_mins: number;
  summary: string;
  ingredients_used: string[];
  image_hint?: string | null;
}

export interface RecipeSuggestResponse {
  recipes: RecipeSuggestion[];
}

// Matches backend ChatRequest schema
export interface ChatRequestPayload {
  message: string;
  ingredients: string[];
  session_id?: string;
}

// Matches backend ChatResponse schema
export interface ChatbotResponse {
  reply: string;
  recipe?: {
    title: string;
    estimated_time_mins: number;
    steps: string[];
  } | null;
}

export interface ChatMessage {
  id: string;
  role: ChatRole;
  content: string;
  createdAt: string;
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
