import { StyleSheet, Text, View } from 'react-native';

import type { FridgeItem } from '../../types';
import { colors, fontFamilies, fontSizes, radii, spacing } from '../../theme';
import { Button } from '../common/Button';
import { Card } from '../common/Card';

type IngredientCardProps = {
  item: FridgeItem;
  onEdit?: () => void;
  onDelete?: () => void;
};

export const IngredientCard = ({ item, onEdit, onDelete }: IngredientCardProps) => (
  <Card style={styles.card}>
    <View style={styles.row}>
      <View style={styles.copy}>
        <Text style={styles.name}>{item.name}</Text>
        <Text style={styles.quantity}>{item.quantity}</Text>
      </View>
      <View style={styles.categoryChip}>
        <Text style={styles.categoryChipText}>{item.category}</Text>
      </View>
    </View>

    <View style={styles.footer}>
      <Text style={styles.source}>{item.source === 'scan' ? 'Added from KatLens' : 'Added manually'}</Text>
      <View style={styles.actions}>
        {onEdit ? <Button label="Edit" variant="outline" fullWidth={false} onPress={onEdit} /> : null}
        {onDelete ? <Button label="Delete" variant="ghost" fullWidth={false} onPress={onDelete} /> : null}
      </View>
    </View>
  </Card>
);

const styles = StyleSheet.create({
  card: {
    gap: spacing.md,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: spacing.sm,
  },
  copy: {
    flex: 1,
    gap: spacing.xxs,
  },
  name: {
    fontFamily: fontFamilies.headingMedium,
    fontSize: fontSizes.lg,
    color: colors.text,
  },
  quantity: {
    fontFamily: fontFamilies.body,
    fontSize: fontSizes.sm,
    color: colors.textMuted,
  },
  categoryChip: {
    backgroundColor: colors.surfaceMuted,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radii.pill,
  },
  categoryChipText: {
    fontFamily: fontFamilies.bodySemiBold,
    fontSize: fontSizes.xs,
    color: colors.secondaryDark,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: spacing.sm,
  },
  source: {
    flex: 1,
    fontFamily: fontFamilies.body,
    fontSize: fontSizes.xs,
    color: colors.textMuted,
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
});
