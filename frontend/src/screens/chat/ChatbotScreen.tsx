import { useCallback, useEffect, useRef } from 'react';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { useFocusEffect } from '@react-navigation/native';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { ChatBubble } from '../../components/chat/ChatBubble';
import { Button } from '../../components/common/Button';
import { Card } from '../../components/common/Card';
import { InlineAlert } from '../../components/common/InlineAlert';
import { Input } from '../../components/common/Input';
import { Screen } from '../../components/common/Screen';
import { useAuthStore } from '../../store/authStore';
import { useChatStore } from '../../store/chatStore';
import { useFridgeStore } from '../../store/fridgeStore';
import { colors, fontFamilies, fontSizes, radii, screenSharedStyles, spacing } from '../../theme';
import type { MainTabParamList } from '../../types';

const quickPrompts = [
  'What can I cook quickly tonight?',
  'Use my fridge items for a healthy lunch idea.',
  'Give me a tip for making softer scrambled eggs.',
];

type Props = BottomTabScreenProps<MainTabParamList, 'Chatbot'>;

export const ChatbotScreen = ({ navigation }: Props) => {
  const scrollRef = useRef<ScrollView | null>(null);
  const user = useAuthStore(state => state.user);
  const items = useFridgeStore(state => state.items);
  const loadItems = useFridgeStore(state => state.loadItems);
  const messages = useChatStore(state => state.messages);
  const isSending = useChatStore(state => state.isSending);
  const draft = useChatStore(state => state.draft);
  const error = useChatStore(state => state.error);
  const setDraft = useChatStore(state => state.setDraft);
  const loadMessages = useChatStore(state => state.loadMessages);
  const sendMessage = useChatStore(state => state.sendMessage);

  useFocusEffect(
    useCallback(() => {
      const uid = user?.uid ?? 'anonymous';
      void loadMessages(uid);
      if (items.length === 0) {
        void loadItems(uid);
      }
    }, [items.length, loadItems, loadMessages, user?.uid])
  );

  useEffect(() => {
    scrollRef.current?.scrollToEnd({ animated: true });
  }, [messages]);

  return (
    <Screen scroll={false}>
      <Card>
        <Text style={screenSharedStyles.pageTitle}>KatChef Chat</Text>
        <Text style={screenSharedStyles.pageSubtitle}>
          Ask for recipe ideas, ingredient rescue plans, or cooking tips. KatChef can use MyFridge when it helps.
        </Text>
        <Text style={styles.contextText}>
          {items.length > 0
            ? `Fridge context attached: ${items.length} ingredients available.`
            : 'No fridge items loaded yet. Add ingredients for smarter suggestions.'}
        </Text>
      </Card>

      <ScrollView
        ref={scrollRef}
        style={styles.chatPane}
        contentContainerStyle={styles.chatContent}
        showsVerticalScrollIndicator={false}
      >
        {messages.map(message => (
          <ChatBubble key={message.id} message={message} />
        ))}
      </ScrollView>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.quickPromptRow}>
        {quickPrompts.map(prompt => (
          <Pressable key={prompt} onPress={() => setDraft(prompt)} style={styles.quickPromptChip}>
            <Text style={styles.quickPromptText}>{prompt}</Text>
          </Pressable>
        ))}
      </ScrollView>

      {error ? <InlineAlert variant="error" message={error} /> : null}

      <Card>
        <Input
          value={draft}
          onChangeText={setDraft}
          placeholder="Ask KatChef what to make..."
          multiline
        />
        <View style={styles.composerActions}>
          <Button label="Open MyFridge" variant="ghost" fullWidth={false} onPress={() => navigation.navigate('MyFridge')} />
          <Button
            label="Send"
            fullWidth={false}
            onPress={() => {
              const uid = user?.uid ?? 'anonymous';
              void sendMessage(uid, draft, items);
            }}
            loading={isSending}
          />
        </View>
      </Card>
    </Screen>
  );
};

const styles = StyleSheet.create({
  contextText: {
    fontFamily: fontFamilies.bodyMedium,
    fontSize: fontSizes.sm,
    color: colors.secondaryDark,
  },
  chatPane: {
    flex: 1,
  },
  chatContent: {
    gap: spacing.md,
    paddingBottom: spacing.sm,
  },
  quickPromptRow: {
    gap: spacing.sm,
  },
  quickPromptChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radii.pill,
    backgroundColor: colors.surfaceMuted,
  },
  quickPromptText: {
    fontFamily: fontFamilies.bodyMedium,
    fontSize: fontSizes.sm,
    color: colors.text,
  },
  composerActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
});
