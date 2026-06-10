import type { FoodItem, MacroTotals } from "../types/app";

export const DAILY_TARGETS: MacroTotals = {
  calories: 2400,
  protein: 180,
  carbs: 250,
  fats: 75,
};

export const FOOD_LIBRARY: FoodItem[] = [
  {
    name: "Chicken Breast",
    servingLabel: "grams",
    macrosPerUnit: { calories: 1.65, protein: 0.31, carbs: 0, fats: 0.036 },
  },
  {
    name: "White Rice",
    servingLabel: "grams",
    macrosPerUnit: { calories: 1.3, protein: 0.027, carbs: 0.28, fats: 0.003 },
  },
  {
    name: "Eggs",
    servingLabel: "egg",
    macrosPerUnit: { calories: 72, protein: 6.3, carbs: 0.4, fats: 4.8 },
  },
  {
    name: "Avocado",
    servingLabel: "grams",
    macrosPerUnit: { calories: 1.6, protein: 0.02, carbs: 0.085, fats: 0.147 },
  },
  {
    name: "Salmon",
    servingLabel: "grams",
    macrosPerUnit: { calories: 2.08, protein: 0.2, carbs: 0, fats: 0.13 },
  },
  {
    name: "Whey Protein",
    servingLabel: "scoop",
    macrosPerUnit: { calories: 120, protein: 24, carbs: 3, fats: 1.5 },
  },
  {
    name: "Oats",
    servingLabel: "grams",
    macrosPerUnit: { calories: 3.89, protein: 0.169, carbs: 0.663, fats: 0.069 },
  },
  {
    name: "Banana",
    servingLabel: "banana",
    macrosPerUnit: { calories: 105, protein: 1.3, carbs: 27, fats: 0.4 },
  },
  {
    name: "Protein Bar",
    servingLabel: "bar",
    macrosPerUnit: { calories: 210, protein: 20, carbs: 24, fats: 7 },
  },
];

export const multiplyMacros = (macros: MacroTotals, quantity: number): MacroTotals => ({
  calories: macros.calories * quantity,
  protein: macros.protein * quantity,
  carbs: macros.carbs * quantity,
  fats: macros.fats * quantity,
});

export const emptyMacros = (): MacroTotals => ({
  calories: 0,
  protein: 0,
  carbs: 0,
  fats: 0,
});

export const addMacros = (a: MacroTotals, b: MacroTotals): MacroTotals => ({
  calories: a.calories + b.calories,
  protein: a.protein + b.protein,
  carbs: a.carbs + b.carbs,
  fats: a.fats + b.fats,
});
