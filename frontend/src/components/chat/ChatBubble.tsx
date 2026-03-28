import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import type { ChatMessage } from '../../types';
import { colors, fontFamilies, fontSizes, radii, spacing } from '../../theme';

type ChatBubbleProps = {
  message: ChatMessage;
};

export const ChatBubble = ({ message }: ChatBubbleProps) => {
  const isUser = message.role === 'user';

  return (
    <View style={[styles.row, isUser ? styles.rowUser : styles.rowAssistant]}>
      <View style={[styles.bubble, isUser ? styles.userBubble : styles.assistantBubble]}>
        {message.pending ? (
          <View style={styles.pendingRow}>
            <ActivityIndicator size="small" color={colors.primary} />
            <Text style={styles.pendingText}>{message.content}</Text>
          </View>
        ) : (
          <Text style={[styles.copy, isUser && styles.copyUser]}>{message.content}</Text>
        )}

        {!isUser && message.suggestedRecipes?.length ? (
          <View style={styles.block}>
            <Text style={styles.blockTitle}>Suggested recipes</Text>
            <Text style={styles.blockText}>{message.suggestedRecipes.join(', ')}</Text>
          </View>
        ) : null}

        {!isUser && message.tips?.length ? (
          <View style={styles.block}>
            <Text style={styles.blockTitle}>Tips</Text>
            <Text style={styles.blockText}>{message.tips.join(', ')}</Text>
          </View>
        ) : null}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  row: {
    width: '100%',
  },
  rowUser: {
    alignItems: 'flex-end',
  },
  rowAssistant: {
    alignItems: 'flex-start',
  },
  bubble: {
    maxWidth: '88%',
    borderRadius: radii.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    gap: spacing.sm,
  },
  userBubble: {
    backgroundColor: colors.primary,
    borderBottomRightRadius: spacing.xs,
  },
  assistantBubble: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    borderBottomLeftRadius: spacing.xs,
  },
  copy: {
    fontFamily: fontFamilies.body,
    fontSize: fontSizes.md,
    lineHeight: 22,
    color: colors.text,
  },
  copyUser: {
    color: colors.white,
  },
  pendingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  pendingText: {
    fontFamily: fontFamilies.bodyMedium,
    fontSize: fontSizes.sm,
    color: colors.textMuted,
  },
  block: {
    backgroundColor: colors.surfaceMuted,
    borderRadius: radii.md,
    padding: spacing.sm,
    gap: spacing.xxs,
  },
  blockTitle: {
    fontFamily: fontFamilies.bodySemiBold,
    fontSize: fontSizes.xs,
    color: colors.secondaryDark,
    textTransform: 'uppercase',
  },
  blockText: {
    fontFamily: fontFamilies.body,
    fontSize: fontSizes.sm,
    color: colors.text,
    lineHeight: 20,
  },
});
