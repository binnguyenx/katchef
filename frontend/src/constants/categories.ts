import type { IngredientCategory } from '../types';

export const ingredientCategories = [
  'All',
  'Vegetable',
  'Fruit',
  'Protein',
  'Dairy',
  'Grain',
  'Spice',
  'Pantry',
  'Drink',
  'Bakery',
  'Frozen',
  'Other',
] as const;

export const editableIngredientCategories = ingredientCategories.filter(
  category => category !== 'All'
) as readonly IngredientCategory[];
