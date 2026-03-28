import { Pressable, StyleSheet, Text, View } from 'react-native';

import { editableIngredientCategories } from '../../constants/categories';
import { colors, fontFamilies, fontSizes, radii, spacing } from '../../theme';
import type { IngredientCategory } from '../../types';

type Accent = 'primary' | 'secondary';

type Props = {
  value: IngredientCategory;
  onChange: (category: IngredientCategory) => void;
  categories?: readonly IngredientCategory[];
  accent?: Accent;
};

const accentBg: Record<Accent, string> = {
  primary: colors.primary,
  secondary: colors.secondary,
};

export const CategoryChipPicker = ({
  value,
  onChange,
  categories = editableIngredientCategories,
  accent = 'primary',
}: Props) => (
  <View style={styles.wrap}>
    {categories.map(category => {
      const active = value === category;

      return (
        <Pressable
          key={category}
          onPress={() => onChange(category)}
          style={[styles.chip, active && { backgroundColor: accentBg[accent] }]}
        >
          <Text style={[styles.chipText, active && styles.chipTextActive]}>{category}</Text>
        </Pressable>
      );
    })}
  </View>
);

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radii.pill,
    backgroundColor: colors.surfaceMuted,
  },
  chipText: {
    fontFamily: fontFamilies.bodyMedium,
    fontSize: fontSizes.xs,
    color: colors.text,
  },
  chipTextActive: {
    color: colors.white,
  },
});
