import { useCallback, useEffect, useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useFocusEffect } from '@react-navigation/native';
import { Controller, useForm } from 'react-hook-form';
import { Alert, StyleSheet, Text, View } from 'react-native';

import { Button } from '../../components/common/Button';
import { Card } from '../../components/common/Card';
import { InlineAlert } from '../../components/common/InlineAlert';
import { Input } from '../../components/common/Input';
import { Screen } from '../../components/common/Screen';
import { CategoryChipPicker } from '../../components/fridge/CategoryChipPicker';
import { getUserProfile } from '../../services/firestore';
import { useAuthStore } from '../../store/authStore';
import { useFridgeStore } from '../../store/fridgeStore';
import { colors, fontFamilies, fontSizes, screenSharedStyles, spacing } from '../../theme';
import type { IngredientFormValues, RootStackParamList } from '../../types';
import { ingredientSchema } from '../../utils/validation';

type Props = NativeStackScreenProps<RootStackParamList, 'EditIngredient'>;

export const EditIngredientScreen = ({ navigation, route }: Props) => {
  const user = useAuthStore(state => state.user);
  const setProfile = useAuthStore(state => state.setProfile);
  const items = useFridgeStore(state => state.items);
  const upsertItem = useFridgeStore(state => state.upsertItem);
  const removeItem = useFridgeStore(state => state.removeItem);
  const fridgeError = useFridgeStore(state => state.error);
  const clearFridgeError = useFridgeStore(state => state.clearError);
  const existingItem = items.find(item => item.id === route.params?.itemId);
  const [saving, setSaving] = useState(false);

  useFocusEffect(
    useCallback(() => {
      clearFridgeError();
    }, [clearFridgeError])
  );

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<IngredientFormValues>({
    resolver: zodResolver(ingredientSchema),
    defaultValues: {
      name: existingItem?.name ?? '',
      quantity: existingItem?.quantity ?? '',
      category: existingItem?.category ?? 'Pantry',
    },
  });

  useEffect(() => {
    reset({
      name: existingItem?.name ?? '',
      quantity: existingItem?.quantity ?? '',
      category: existingItem?.category ?? 'Pantry',
    });
  }, [existingItem, reset]);

  const selectedCategory = watch('category');

  const onSubmit = handleSubmit(async values => {
    if (!user?.uid) {
      return;
    }

    setSaving(true);

    try {
      const saved = await upsertItem(user.uid, values, existingItem?.id);

      if (saved) {
        try {
          const profile = await getUserProfile(user.uid);
          if (profile) {
            setProfile(profile);
          }
        } catch {
          /* profile refresh failed — ingredient still saved */
        }
        navigation.goBack();
      }
    } finally {
      setSaving(false);
    }
  });

  return (
    <Screen scroll>
      <Card>
        <Text style={screenSharedStyles.pageTitle}>{existingItem ? 'Edit ingredient' : 'Add ingredient'}</Text>
        <Text style={screenSharedStyles.pageSubtitle}>
          Keep names, categories, and quantities tidy so future recipe suggestions stay useful.
        </Text>

        {fridgeError ? <InlineAlert variant="error" message={fridgeError} /> : null}

        <Controller
          control={control}
          name="name"
          render={({ field: { onChange, value } }) => (
            <Input
              label="Ingredient name"
              value={value}
              onChangeText={onChange}
              error={errors.name?.message}
              placeholder="Spinach"
            />
          )}
        />

        <Controller
          control={control}
          name="quantity"
          render={({ field: { onChange, value } }) => (
            <Input
              label="Quantity"
              value={value}
              onChangeText={onChange}
              error={errors.quantity?.message}
              placeholder="1 bag"
            />
          )}
        />

        <View style={styles.categorySection}>
          <Text style={styles.categoryLabel}>Category</Text>
          <CategoryChipPicker
            value={selectedCategory}
            onChange={category => setValue('category', category, { shouldValidate: true })}
            accent="primary"
          />
          {errors.category?.message ? <Text style={styles.fieldError}>{errors.category.message}</Text> : null}
        </View>

        <Button label={existingItem ? 'Save changes' : 'Add ingredient'} onPress={onSubmit} loading={saving} />

        {existingItem ? (
          <Button
            label="Delete ingredient"
            variant="ghost"
            onPress={() =>
              Alert.alert('Delete ingredient', `Remove ${existingItem.name} from MyFridge?`, [
                { text: 'Cancel', style: 'cancel' },
                {
                  text: 'Delete',
                  style: 'destructive',
                  onPress: () => {
                    if (user?.uid) {
                      void removeItem(user.uid, existingItem.id).then(async () => {
                        const profile = await getUserProfile(user.uid);

                        if (profile) {
                          setProfile(profile);
                        }

                        navigation.goBack();
                      });
                    }
                  },
                },
              ])
            }
          />
        ) : null}
      </Card>
    </Screen>
  );
};

const styles = StyleSheet.create({
  categorySection: {
    gap: spacing.sm,
  },
  categoryLabel: {
    fontFamily: fontFamilies.bodySemiBold,
    fontSize: fontSizes.sm,
    color: colors.text,
  },
  fieldError: {
    fontFamily: fontFamilies.bodyMedium,
    fontSize: fontSizes.xs,
    color: colors.danger,
  },
});
