import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { sendChatMessage } from '../services/api';
import { awardXp, getChatMessages, saveChatMessage } from '../services/firestore';
import { storageKeys } from '../constants/storageKeys';
import type { ChatMessage, FridgeItem } from '../types';
import { getErrorMessage } from '../utils/error';

const DEFAULT_SESSION_ID = 'default';

const buildMessage = (
  role: ChatMessage['role'],
  content: string,
  extras: Partial<ChatMessage> = {}
): ChatMessage => ({
  id: `${role}-${Math.random().toString(36).slice(2, 10)}-${Date.now().toString(36)}`,
  role,
  content,
  createdAt: new Date().toISOString(),
  ...extras,
});

const buildWelcomeMessage = (): ChatMessage =>
  buildMessage('assistant', "Hi, I'm KatChef. Ask me for quick recipes, fridge rescue ideas, or cooking tips.", {
    suggestedRecipes: ['Quick Omelette', '15-Minute Rice Bowl'],
    tips: ['Share your fridge ingredients for more tailored suggestions.'],
  });

type ChatState = {
  messages: ChatMessage[];
  isSending: boolean;
  error: string | null;
  activeSessionId: string;
  draft: string;
  setDraft: (value: string) => void;
  loadMessages: (userId: string) => Promise<void>;
  sendMessage: (userId: string, content: string, fridgeItems?: FridgeItem[]) => Promise<void>;
  clear: () => void;
};

export const useChatStore = create<ChatState>()(
  persist(
    (set, get) => ({
      messages: [],
      isSending: false,
      error: null,
      activeSessionId: DEFAULT_SESSION_ID,
      draft: '',
      setDraft: draft => set({ draft }),
      loadMessages: async userId => {
        try {
          const messages = await getChatMessages(userId, get().activeSessionId);
          set({
            messages: messages.length > 0 ? messages : [buildWelcomeMessage()],
            error: null,
          });
        } catch (error) {
          set({
            error: getErrorMessage(error, 'We could not load your chat history.'),
            messages: [buildWelcomeMessage()],
          });
        }
      },
      sendMessage: async (userId, content, fridgeItems = []) => {
        const trimmedContent = content.trim();

        if (!trimmedContent || get().isSending) {
          return;
        }

        const sessionId = get().activeSessionId;
        const userMessage = buildMessage('user', trimmedContent);
        const pendingMessage = buildMessage('assistant', 'KatChef is tasting ideas...', {
          pending: true,
        });

        set(state => ({
          draft: '',
          isSending: true,
          error: null,
          messages: [...state.messages.filter(message => !message.pending), userMessage, pendingMessage],
        }));

        try {
          await saveChatMessage(userId, userMessage, sessionId);

          const response = await sendChatMessage({
            message: trimmedContent,
            fridgeItems: fridgeItems.map(item => ({
              name: item.name,
              quantity: item.quantity,
              category: item.category,
            })),
            sessionId,
          });

          const assistantMessage = buildMessage('assistant', response.reply, {
            suggestedRecipes: response.suggestedRecipes,
            tips: response.tips,
          });

          await saveChatMessage(userId, assistantMessage, sessionId);
          await awardXp(userId, 6, { recipesSuggested: response.suggestedRecipes.length });

          set(state => ({
            isSending: false,
            messages: [
              ...state.messages.filter(message => message.id !== pendingMessage.id),
              assistantMessage,
            ],
          }));
        } catch (error) {
          set(state => ({
            isSending: false,
            error: getErrorMessage(error, 'KatChef could not answer just yet.'),
            messages: state.messages.filter(message => message.id !== pendingMessage.id),
          }));
        }
      },
      clear: () =>
        set({
          messages: [],
          isSending: false,
          error: null,
          draft: '',
        }),
    }),
    {
      name: storageKeys.chatStore,
      storage: createJSONStorage(() => AsyncStorage),
      partialize: state => ({
        activeSessionId: state.activeSessionId,
        draft: state.draft,
      }),
    }
  )
);
