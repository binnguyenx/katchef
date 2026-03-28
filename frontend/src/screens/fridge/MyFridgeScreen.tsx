import { useCallback, useDeferredValue, useMemo } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import type { CompositeScreenProps } from '@react-navigation/native';
import { useFocusEffect } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { IngredientCard } from '../../components/fridge/IngredientCard';
import { Button } from '../../components/common/Button';
import { Card } from '../../components/common/Card';
import { InlineAlert } from '../../components/common/InlineAlert';
import { Input } from '../../components/common/Input';
import { LoadingState } from '../../components/common/LoadingState';
import { Screen } from '../../components/common/Screen';
import { ingredientCategories } from '../../constants/categories';
import { useAuthStore } from '../../store/authStore';
import { useFridgeStore } from '../../store/fridgeStore';
import { colors, fontFamilies, fontSizes, radii, screenSharedStyles, spacing } from '../../theme';
import type { MainTabParamList, RootStackParamList } from '../../types';
import { pluralize } from '../../utils/format';

type Props = CompositeScreenProps<
  BottomTabScreenProps<MainTabParamList, 'MyFridge'>,
  NativeStackScreenProps<RootStackParamList>
>;

export const MyFridgeScreen = ({ navigation }: Props) => {
  const user = useAuthStore(state => state.user);
  const items = useFridgeStore(state => state.items);
  const isLoading = useFridgeStore(state => state.isLoading);
  const error = useFridgeStore(state => state.error);
  const searchQuery = useFridgeStore(state => state.searchQuery);
  const categoryFilter = useFridgeStore(state => state.categoryFilter);
  const loadItems = useFridgeStore(state => state.loadItems);
  const removeItem = useFridgeStore(state => state.removeItem);
  const setSearchQuery = useFridgeStore(state => state.setSearchQuery);
  const setCategoryFilter = useFridgeStore(state => state.setCategoryFilter);
  const deferredSearch = useDeferredValue(searchQuery);

  useFocusEffect(
    useCallback(() => {
      if (user?.uid) {
        void loadItems(user.uid);
      }
    }, [loadItems, user?.uid])
  );

  const filteredItems = useMemo(
    () =>
      items.filter(item => {
        const matchesSearch =
          deferredSearch.trim().length === 0 ||
          item.name.toLowerCase().includes(deferredSearch.trim().toLowerCase());
        const matchesCategory = categoryFilter === 'All' || item.category === categoryFilter;

        return matchesSearch && matchesCategory;
      }),
    [categoryFilter, deferredSearch, items]
  );

  return (
    <Screen scroll>
      <Card>
        <Text style={screenSharedStyles.pageTitle}>MyFridge</Text>
        <Text style={screenSharedStyles.pageSubtitle}>
          {pluralize(items.length, 'ingredient')} tracked and ready for recipe suggestions.
        </Text>
        <Button label="Add ingredient" onPress={() => navigation.navigate('EditIngredient', {})} />
      </Card>

      <Input
        label="Search ingredients"
        value={searchQuery}
        onChangeText={setSearchQuery}
        placeholder="Search by ingredient name"
      />

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterRow}>
        {ingredientCategories.map(category => {
          const active = categoryFilter === category;

          return (
            <Pressable
              key={category}
              onPress={() => setCategoryFilter(category)}
              style={[styles.filterChip, active && styles.filterChipActive]}
            >
              <Text style={[styles.filterChipText, active && styles.filterChipTextActive]}>{category}</Text>
            </Pressable>
          );
        })}
      </ScrollView>

      {isLoading ? <LoadingState label="Refreshing your fridge..." /> : null}

      {error ? <InlineAlert variant="error" message={error} /> : null}

      {!isLoading && filteredItems.length === 0 ? (
        <Card>
          <Text style={styles.emptyTitle}>Your fridge is feeling roomy.</Text>
          <Text style={styles.emptyCopy}>
            Add ingredients manually or run a KatLens scan to start building recipe context.
          </Text>
          <Button label="Run KatLens scan" variant="secondary" onPress={() => navigation.navigate('Scan')} />
        </Card>
      ) : null}

      {filteredItems.map(item => (
        <IngredientCard
          key={item.id}
          item={item}
          onEdit={() => navigation.navigate('EditIngredient', { itemId: item.id })}
          onDelete={() =>
            Alert.alert('Delete ingredient', `Remove ${item.name} from MyFridge?`, [
              { text: 'Cancel', style: 'cancel' },
              {
                text: 'Delete',
                style: 'destructive',
                onPress: () => {
                  if (user?.uid) {
                    void removeItem(user.uid, item.id);
                  }
                },
              },
            ])
          }
        />
      ))}
    </Screen>
  );
};

const styles = StyleSheet.create({
  filterRow: {
    gap: spacing.sm,
  },
  filterChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radii.pill,
    backgroundColor: colors.surfaceMuted,
  },
  filterChipActive: {
    backgroundColor: colors.primary,
  },
  filterChipText: {
    fontFamily: fontFamilies.bodyMedium,
    fontSize: fontSizes.sm,
    color: colors.text,
  },
  filterChipTextActive: {
    color: colors.white,
  },
  emptyTitle: {
    fontFamily: fontFamilies.headingMedium,
    fontSize: fontSizes.lg,
    color: colors.text,
  },
  emptyCopy: {
    fontFamily: fontFamilies.body,
    fontSize: fontSizes.sm,
    color: colors.textMuted,
    lineHeight: 20,
  },
});
