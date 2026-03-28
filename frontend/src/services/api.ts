import { config } from '../constants/config';
import type {
  ChatRequestPayload,
  ChatbotResponse,
  IngredientDetection,
  RecipeSuggestResponse,
  VisionDetectResponse,
} from '../types';

const buildUrl = (path: string) => `${config.apiBaseUrl}${path}`;

const demoDetections: IngredientDetection[] = [
  { name: 'Tomato', quantity: '2 items', confidence: 0.92 },
  { name: 'Eggs', quantity: '4 eggs', confidence: 0.89 },
  { name: 'Basil', quantity: '1 handful', confidence: 0.81 },
];

export const demoScanImageUri = `data:image/svg+xml;utf8,${encodeURIComponent(`
  <svg xmlns="http://www.w3.org/2000/svg" width="480" height="640" viewBox="0 0 480 640">
    <rect width="480" height="640" fill="#FFF4E8"/>
    <rect x="40" y="70" width="400" height="500" rx="28" fill="#FFE1CC"/>
    <circle cx="150" cy="250" r="62" fill="#FF8B67"/>
    <circle cx="270" cy="220" r="52" fill="#F4C95D"/>
    <circle cx="330" cy="330" r="48" fill="#7BC67E"/>
    <rect x="105" y="390" width="250" height="70" rx="18" fill="#FFFFFF"/>
    <text x="240" y="435" text-anchor="middle" font-family="Arial" font-size="26" fill="#2F241F">KatLens Demo Scan</text>
  </svg>
`)}`;

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const buildMockChatResponse = async (payload: ChatRequestPayload): Promise<ChatbotResponse> => {
  await delay(700);

  const ingredients = payload.ingredients.map(i => i.toLowerCase());
  const prompt = payload.message.toLowerCase();
  const hasEggs = ingredients.some(i => i.includes('egg'));
  const hasTomato = ingredients.some(i => i.includes('tomato'));
  const wantsBreakfast = prompt.includes('breakfast') || prompt.includes('omelette');

  if (hasEggs && (hasTomato || wantsBreakfast)) {
    return {
      reply:
        'You can make a quick tomato omelette with your eggs. Whisk the eggs, saute the tomatoes briefly, then cook everything together over medium heat.',
    };
  }

  if (ingredients.length > 0) {
    const summary = ingredients.slice(0, 3).join(', ');
    return {
      reply: `With ${summary}, I'd build a fast skillet meal or toast topper. Start with the most delicate ingredients last so they stay bright.`,
    };
  }

  return {
    reply:
      'Tell me what mood you are cooking for and I can suggest a simple dish. If you add fridge ingredients, I can tailor the recipe much more closely.',
  };
};

const withMockFallback = async <T>(
  performRequest: () => Promise<T>,
  buildFallback: () => Promise<T>
) => {
  if (!config.apiBaseUrl || config.useMockApi) {
    return buildFallback();
  }

  try {
    return await performRequest();
  } catch (error) {
    if (__DEV__) {
      return buildFallback();
    }

    throw error;
  }
};

const uriToBlob = async (uri: string) => {
  const response = await fetch(uri);
  return response.blob();
};

export const detectIngredients = async (imageUri: string): Promise<VisionDetectResponse> =>
  withMockFallback(
    async () => {
      const blob = await uriToBlob(imageUri);
      const formData = new FormData();
      formData.append('file', blob, 'katlens-scan.jpg');

      const response = await fetch(buildUrl('/api/vision/ingredients'), {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Ingredient detection failed.');
      }

      return (await response.json()) as VisionDetectResponse;
    },
    async () => {
      await delay(900);
      return { ingredients: demoDetections };
    }
  );

export const sendChatMessage = async (payload: ChatRequestPayload): Promise<ChatbotResponse> =>
  withMockFallback(
    async () => {
      const response = await fetch(buildUrl('/api/chat'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error('Chat request failed.');
      }

      return (await response.json()) as ChatbotResponse;
    },
    () => buildMockChatResponse(payload)
  );

export const suggestRecipes = async (
  sessionId?: string,
  diet?: string,
  style?: string,
  maxTimeMins?: number
): Promise<RecipeSuggestResponse> => {
  const params = new URLSearchParams();
  if (sessionId) params.set('session_id', sessionId);
  if (diet) params.set('diet', diet);
  if (style) params.set('style', style);
  if (maxTimeMins) params.set('max_time_mins', maxTimeMins.toString());

  const response = await fetch(buildUrl(`/api/recipes/suggest?${params.toString()}`));

  if (!response.ok) {
    throw new Error('Recipe suggestion failed.');
  }

  return (await response.json()) as RecipeSuggestResponse;
};

export const apiClient = {
  detectIngredients,
  sendChatMessage,
  suggestRecipes,
};
