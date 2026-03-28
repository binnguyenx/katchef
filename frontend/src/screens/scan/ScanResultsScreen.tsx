import { useMemo, useState } from 'react';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Image, StyleSheet, Text, View } from 'react-native';

import { Button } from '../../components/common/Button';
import { Card } from '../../components/common/Card';
import { InlineAlert } from '../../components/common/InlineAlert';
import { Input } from '../../components/common/Input';
import { Screen } from '../../components/common/Screen';
import { CategoryChipPicker } from '../../components/fridge/CategoryChipPicker';
import { getUserProfile } from '../../services/firestore';
import { useAuthStore } from '../../store/authStore';
import { useFridgeStore } from '../../store/fridgeStore';
import { colors, fontFamilies, fontSizes, radii, screenSharedStyles, spacing } from '../../theme';
import type { IngredientCategory, RootStackParamList } from '../../types';
import { getErrorMessage } from '../../utils/error';
import { formatConfidence } from '../../utils/format';

type ScanItem = {
  id: string;
  name: string;
  quantity: string;
  category: IngredientCategory;
  confidence: number;
};

type Props = NativeStackScreenProps<RootStackParamList, 'ScanResults'>;

export const ScanResultsScreen = ({ navigation, route }: Props) => {
  const user = useAuthStore(state => state.user);
  const setProfile = useAuthStore(state => state.setProfile);
  const saveScanResults = useFridgeStore(state => state.saveScanResults);
  const [ingredients, setIngredients] = useState<ScanItem[]>(
    route.params.detections.map(ingredient => ({
      id: `${ingredient.name}-${Math.random().toString(36).slice(2, 8)}`,
      name: ingredient.name,
      quantity: ingredient.quantity ?? '1',
      category: 'Other' as IngredientCategory,
      confidence: ingredient.confidence ?? 0,
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

  const updateIngredient = (id: string, patch: Partial<ScanItem>) => {
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
        category: 'Pantry' as IngredientCategory,
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
      const saved = await saveScanResults(user.uid, cleanIngredients);
      if (!saved) {
        setError(useFridgeStore.getState().error ?? 'We could not save those ingredients right now.');
        return;
      }

      try {
        const profile = await getUserProfile(user.uid);
        if (profile) {
          setProfile(profile);
        }
      } catch (profileErr) {
        setError(getErrorMessage(profileErr, 'Saved ingredients, but profile could not refresh.'));
        navigation.navigate('MainTabs', { screen: 'MyFridge' });
        return;
      }

      navigation.navigate('MainTabs', { screen: 'MyFridge' });
    } catch (err) {
      setError(getErrorMessage(err, 'We could not save those ingredients right now.'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Screen scroll>
      {route.params.imageUri ? <Image source={{ uri: route.params.imageUri }} style={styles.previewImage} /> : null}

      <Card>
        <Text style={screenSharedStyles.pageTitle}>Confirm detections</Text>
        <Text style={screenSharedStyles.pageSubtitle}>
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

          <CategoryChipPicker
            value={ingredient.category}
            onChange={category => updateIngredient(ingredient.id, { category })}
            accent="secondary"
          />

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

      {error ? <InlineAlert variant="error" message={error} /> : null}

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
});
