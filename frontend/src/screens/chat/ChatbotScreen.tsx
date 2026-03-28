import { useCallback, useEffect, useRef } from 'react';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { useFocusEffect } from '@react-navigation/native';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { ChatBubble } from '../../components/chat/ChatBubble';
import { Button } from '../../components/common/Button';
import { Card } from '../../components/common/Card';
import { Input } from '../../components/common/Input';
import { Screen } from '../../components/common/Screen';
import { useAuthStore } from '../../store/authStore';
import { useChatStore } from '../../store/chatStore';
import { useFridgeStore } from '../../store/fridgeStore';
import { colors, fontFamilies, fontSizes, radii, spacing } from '../../theme';
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
      if (user?.uid) {
        void loadMessages(user.uid);
        if (items.length === 0) {
          void loadItems(user.uid);
        }
      }
    }, [items.length, loadItems, loadMessages, user?.uid])
  );

  useEffect(() => {
    scrollRef.current?.scrollToEnd({ animated: true });
  }, [messages]);

  return (
    <Screen scroll={false}>
      <Card>
        <Text style={styles.title}>KatChef Chat</Text>
        <Text style={styles.subtitle}>
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

      {error ? (
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : null}

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
              if (user?.uid) {
                void sendMessage(user.uid, draft, items);
              }
            }}
            loading={isSending}
          />
        </View>
      </Card>
    </Screen>
  );
};

const styles = StyleSheet.create({
  title: {
    fontFamily: fontFamilies.heading,
    fontSize: fontSizes.xxl,
    color: colors.text,
  },
  subtitle: {
    fontFamily: fontFamilies.body,
    fontSize: fontSizes.md,
    color: colors.textMuted,
    lineHeight: 24,
  },
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
  errorBox: {
    backgroundColor: 'rgba(217, 90, 90, 0.12)',
    borderRadius: radii.md,
    padding: spacing.md,
  },
  errorText: {
    fontFamily: fontFamilies.bodyMedium,
    fontSize: fontSizes.sm,
    color: colors.danger,
  },
  composerActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
});
