import type { Recipe, CookingLog } from "./types";

const RECIPES_KEY = "cokkingmemo_recipes";
const LOGS_KEY = "cokkingmemo_logs";

function nextId(items: { id: number }[]): number {
  return items.length === 0 ? 1 : Math.max(...items.map((i) => i.id)) + 1;
}

export function getRecipes(): Recipe[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(RECIPES_KEY) || "[]");
  } catch {
    return [];
  }
}

function saveRecipes(recipes: Recipe[]): void {
  localStorage.setItem(RECIPES_KEY, JSON.stringify(recipes));
}

export function getRecipe(id: number): Recipe | null {
  return getRecipes().find((r) => r.id === id) ?? null;
}

export function createRecipe(
  data: Omit<Recipe, "id" | "createdAt" | "updatedAt">
): Recipe {
  const recipes = getRecipes();
  const recipe: Recipe = {
    ...data,
    id: nextId(recipes),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  saveRecipes([...recipes, recipe]);
  return recipe;
}

export function updateRecipe(
  id: number,
  data: Partial<Omit<Recipe, "id" | "createdAt">>
): Recipe | null {
  const recipes = getRecipes();
  const idx = recipes.findIndex((r) => r.id === id);
  if (idx === -1) return null;
  const updated = {
    ...recipes[idx],
    ...data,
    updatedAt: new Date().toISOString(),
  };
  recipes[idx] = updated;
  saveRecipes(recipes);
  return updated;
}

export function deleteRecipeById(id: number): void {
  saveRecipes(getRecipes().filter((r) => r.id !== id));
  saveLogs(getLogs().filter((l) => l.recipeId !== id));
}

export function toggleFavoriteById(id: number): void {
  const recipe = getRecipe(id);
  if (recipe) updateRecipe(id, { isFavorite: !recipe.isFavorite });
}

export function getLogs(): CookingLog[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(LOGS_KEY) || "[]");
  } catch {
    return [];
  }
}

function saveLogs(logs: CookingLog[]): void {
  localStorage.setItem(LOGS_KEY, JSON.stringify(logs));
}

export function getLogsForRecipe(recipeId: number): CookingLog[] {
  return getLogs()
    .filter((l) => l.recipeId === recipeId)
    .sort((a, b) => b.cookedAt.localeCompare(a.cookedAt));
}

export function addLog(
  data: Omit<CookingLog, "id" | "createdAt">
): CookingLog {
  const logs = getLogs();
  const log: CookingLog = {
    ...data,
    id: nextId(logs),
    createdAt: new Date().toISOString(),
  };
  saveLogs([...logs, log]);
  return log;
}

export function deleteLogById(id: number): void {
  saveLogs(getLogs().filter((l) => l.id !== id));
}
