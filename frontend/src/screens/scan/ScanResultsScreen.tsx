import { useMemo, useState } from 'react';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';

import { Button } from '../../components/common/Button';
import { Card } from '../../components/common/Card';
import { Input } from '../../components/common/Input';
import { Screen } from '../../components/common/Screen';
import { editableIngredientCategories } from '../../constants/categories';
import { getUserProfile } from '../../services/firestore';
import { useAuthStore } from '../../store/authStore';
import { useFridgeStore } from '../../store/fridgeStore';
import { colors, fontFamilies, fontSizes, radii, spacing } from '../../theme';
import type { IngredientDetection, RootStackParamList } from '../../types';
import { formatConfidence } from '../../utils/format';

type Props = NativeStackScreenProps<RootStackParamList, 'ScanResults'>;

export const ScanResultsScreen = ({ navigation, route }: Props) => {
  const user = useAuthStore(state => state.user);
  const setProfile = useAuthStore(state => state.setProfile);
  const saveScanResults = useFridgeStore(state => state.saveScanResults);
  const [ingredients, setIngredients] = useState<IngredientDetection[]>(
    route.params.detections.map(ingredient => ({
      ...ingredient,
      id: ingredient.id ?? `${ingredient.name}-${Math.random().toString(36).slice(2, 8)}`,
    }))
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const cleanIngredients = useMemo(
    () =>
      ingredients.filter(
        ingredient => ingredient.name.trim().length > 0 && ingredient.quantity.trim().length > 0
      ),
    [ingredients]
  );

  const updateIngredient = (id: string, patch: Partial<IngredientDetection>) => {
    setIngredients(current =>
      current.map(ingredient => (ingredient.id === id ? { ...ingredient, ...patch } : ingredient))
    );
  };

  const addIngredient = () => {
    setIngredients(current => [
      ...current,
      {
        id: `manual-${Math.random().toString(36).slice(2, 8)}`,
        name: '',
        quantity: '',
        category: 'Pantry',
        confidence: 0,
      },
    ]);
  };

  const onSave = async () => {
    if (!user?.uid || cleanIngredients.length === 0) {
      setError('Add at least one ingredient before saving.');
      return;
    }

    setSaving(true);
    setError(null);

    try {
      await saveScanResults(user.uid, cleanIngredients);
      const profile = await getUserProfile(user.uid);

      if (profile) {
        setProfile(profile);
      }

      navigation.navigate('MainTabs', { screen: 'MyFridge' });
    } catch {
      setError('We could not save those ingredients right now.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Screen scroll>
      {route.params.imageUri ? <Image source={{ uri: route.params.imageUri }} style={styles.previewImage} /> : null}

      <Card>
        <Text style={styles.title}>Confirm detections</Text>
        <Text style={styles.subtitle}>
          Review each ingredient, tweak names or quantities, and remove anything KatLens got wrong.
        </Text>
      </Card>

      {ingredients.map(ingredient => (
        <Card key={ingredient.id}>
          <View style={styles.ingredientHeader}>
            <Text style={styles.ingredientTitle}>{ingredient.name || 'New ingredient'}</Text>
            <View style={styles.confidenceChip}>
              <Text style={styles.confidenceText}>{formatConfidence(ingredient.confidence)}</Text>
            </View>
          </View>

          <Input
            label="Ingredient name"
            value={ingredient.name}
            onChangeText={value => updateIngredient(ingredient.id, { name: value })}
            placeholder="Tomato"
          />
          <Input
            label="Quantity"
            value={ingredient.quantity}
            onChangeText={value => updateIngredient(ingredient.id, { quantity: value })}
            placeholder="2 items"
          />

          <View style={styles.categoriesWrap}>
            {editableIngredientCategories.map(category => {
              const active = ingredient.category === category;

              return (
                <Pressable
                  key={`${ingredient.id}-${category}`}
                  onPress={() => updateIngredient(ingredient.id, { category })}
                  style={[styles.categoryChip, active && styles.categoryChipActive]}
                >
                  <Text style={[styles.categoryChipText, active && styles.categoryChipTextActive]}>{category}</Text>
                </Pressable>
              );
            })}
          </View>

          <Button
            label="Remove ingredient"
            variant="ghost"
            fullWidth={false}
            onPress={() =>
              setIngredients(current => current.filter(currentIngredient => currentIngredient.id !== ingredient.id))
            }
          />
        </Card>
      ))}

      {error ? (
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : null}

      <Button label="Add another ingredient" variant="outline" onPress={addIngredient} />
      <Button label="Save to MyFridge" onPress={onSave} loading={saving} />
    </Screen>
  );
};

const styles = StyleSheet.create({
  previewImage: {
    width: '100%',
    height: 260,
    borderRadius: radii.lg,
    backgroundColor: colors.backgroundAlt,
  },
  title: {
    fontFamily: fontFamilies.heading,
    fontSize: fontSizes.xxl,
    color: colors.text,
  },
  subtitle: {
    fontFamily: fontFamilies.body,
    fontSize: fontSizes.md,
    lineHeight: 24,
    color: colors.textMuted,
  },
  ingredientHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: spacing.sm,
  },
  ingredientTitle: {
    fontFamily: fontFamilies.headingMedium,
    fontSize: fontSizes.lg,
    color: colors.text,
  },
  confidenceChip: {
    backgroundColor: colors.surfaceMuted,
    borderRadius: radii.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  confidenceText: {
    fontFamily: fontFamilies.bodySemiBold,
    fontSize: fontSizes.xs,
    color: colors.primaryDark,
  },
  categoriesWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  categoryChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radii.pill,
    backgroundColor: colors.surfaceMuted,
  },
  categoryChipActive: {
    backgroundColor: colors.secondary,
  },
  categoryChipText: {
    fontFamily: fontFamilies.bodyMedium,
    fontSize: fontSizes.xs,
    color: colors.text,
  },
  categoryChipTextActive: {
    color: colors.white,
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
});
