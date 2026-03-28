import { config } from '../constants/config';
import type {
  ChatRequestPayload,
  ChatbotResponse,
  IngredientDetection,
  RecipeSuggestResponse,
  VisionDetectResponse,
} from '../types';
import {
  getErrorMessage,
  getNetworkFailureMessage,
  HttpApiError,
  parseHttpErrorBody,
} from '../utils/error';

const buildUrl = (path: string) => `${config.apiBaseUrl}${path}`;

const VISION_PATH = '/api/vision/ingredients';
const CHAT_PATH = '/api/chat';

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
    throw new Error(getErrorMessage(error, 'Request failed.'));
  }
};

const fetchOrThrow = async (url: string, init?: RequestInit): Promise<Response> => {
  try {
    return await fetch(url, init);
  } catch (error) {
    throw new Error(getNetworkFailureMessage(error));
  }
};

const readJsonOk = async <T>(response: Response, errorFallback: string): Promise<T> => {
  const text = await response.text();

  if (response.ok) {
    if (!text.trim()) {
      return {} as T;
    }
    try {
      return JSON.parse(text) as T;
    } catch {
      throw new HttpApiError('The server returned invalid data.', response.status);
    }
  }

  const msg = parseHttpErrorBody(response.status, text, errorFallback);
  throw new HttpApiError(msg, response.status);
};

type BackendIngredientItem = {
  name: string;
  quantity?: string | null;
  confidence?: number | null;
};

type BackendVisionResponse = {
  ingredients: BackendIngredientItem[];
};

const mapVisionResponse = (data: BackendVisionResponse): VisionDetectResponse => ({
  ingredients: data.ingredients.map(item => ({
    name: item.name.trim(),
    quantity: (item.quantity && item.quantity.trim()) || '1 item',
    confidence: typeof item.confidence === 'number' ? item.confidence : 0.85,
  })),
});

type BackendChatResponse = {
  reply: string;
  recipe?: {
    title: string;
    estimated_time_mins?: number;
    steps?: string[];
  } | null;
};

const mapChatResponse = (data: BackendChatResponse): ChatbotResponse => ({
  reply: data.reply,
  recipe: data.recipe ?? null,
});

const uriToBlob = async (uri: string) => {
  const response = await fetchOrThrow(uri);
  if (!response.ok) {
    throw new Error(`Could not read image (HTTP ${response.status}).`);
  }
  return response.blob();
};

export const detectIngredients = async (imageUri: string): Promise<VisionDetectResponse> =>
  withMockFallback(
    async () => {
      const blob = await uriToBlob(imageUri);
      const formData = new FormData();
      formData.append('file', blob, 'katlens-scan.jpg');

      const response = await fetchOrThrow(buildUrl(VISION_PATH), {
        method: 'POST',
        body: formData,
      });

      const raw = await readJsonOk<BackendVisionResponse>(response, 'Ingredient detection failed.');
      return mapVisionResponse(raw);
    },
    async () => {
      await delay(900);
      return { ingredients: demoDetections };
    }
  );

export const sendChatMessage = async (payload: ChatRequestPayload): Promise<ChatbotResponse> =>
  withMockFallback(
    async () => {
      const response = await fetchOrThrow(buildUrl(CHAT_PATH), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const raw = await readJsonOk<BackendChatResponse>(response, 'Chat request failed.');
      return mapChatResponse(raw);
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

  const response = await fetchOrThrow(buildUrl(`/api/recipes/suggest?${params.toString()}`));
  return readJsonOk<RecipeSuggestResponse>(response, 'Recipe suggestion failed.');
};

export const apiClient = {
  detectIngredients,
  sendChatMessage,
  suggestRecipes,
};
