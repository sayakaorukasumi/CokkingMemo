import type { Recipe, CookingLog } from "./types";

/**
 * 保存先は IndexedDB。
 * iOS Safari は github.io 等のドメインで localStorage の容量を強く制限する
 * （小さい画像でも QuotaExceededError になる）ため、画像を含むデータは
 * より頑丈な IndexedDB に保存する。
 * 読み取りは同期的に使えるよう、起動時に全件をメモリキャッシュへ読み込む。
 */

const DB_NAME = "cokkingmemo";
const DB_VERSION = 1;
const RECIPE_STORE = "recipes";
const LOG_STORE = "logs";

// 旧 localStorage キー（初回のみ移行に使う）
const LS_RECIPES = "cokkingmemo_recipes";
const LS_LOGS = "cokkingmemo_logs";

let dbPromise: Promise<IDBDatabase> | null = null;

function openDB(): Promise<IDBDatabase> {
  if (dbPromise) return dbPromise;
  dbPromise = new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(RECIPE_STORE)) {
        db.createObjectStore(RECIPE_STORE, { keyPath: "id" });
      }
      if (!db.objectStoreNames.contains(LOG_STORE)) {
        db.createObjectStore(LOG_STORE, { keyPath: "id" });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
  return dbPromise;
}

function idbGetAll<T>(db: IDBDatabase, store: string): Promise<T[]> {
  return new Promise((resolve, reject) => {
    const tx = db.transaction(store, "readonly");
    const req = tx.objectStore(store).getAll();
    req.onsuccess = () => resolve(req.result as T[]);
    req.onerror = () => reject(req.error);
  });
}

function idbPut(db: IDBDatabase, store: string, value: unknown): Promise<void> {
  return new Promise((resolve, reject) => {
    const tx = db.transaction(store, "readwrite");
    tx.objectStore(store).put(value);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

function idbDelete(db: IDBDatabase, store: string, key: number): Promise<void> {
  return new Promise((resolve, reject) => {
    const tx = db.transaction(store, "readwrite");
    tx.objectStore(store).delete(key);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

function readLegacy<T>(key: string): T[] {
  try {
    return JSON.parse(localStorage.getItem(key) || "[]") as T[];
  } catch {
    return [];
  }
}

/* ─── メモリキャッシュ ─────────────────────────────── */

let recipesCache: Recipe[] = [];
let logsCache: CookingLog[] = [];
let initialized = false;

function nextId(items: { id: number }[]): number {
  return items.length === 0 ? 1 : Math.max(...items.map((i) => i.id)) + 1;
}

/** アプリ起動時に呼び出す。IndexedDB から全件読み込み、旧データがあれば移行する。 */
export async function initStorage(): Promise<void> {
  if (initialized) return;
  if (typeof window === "undefined") return;

  const db = await openDB();
  recipesCache = await idbGetAll<Recipe>(db, RECIPE_STORE);
  logsCache = await idbGetAll<CookingLog>(db, LOG_STORE);

  // localStorage に残っている旧データを一度だけ移行
  if (recipesCache.length === 0) {
    const legacy = readLegacy<Recipe>(LS_RECIPES);
    if (legacy.length) {
      for (const r of legacy) await idbPut(db, RECIPE_STORE, r);
      recipesCache = legacy;
    }
  }
  if (logsCache.length === 0) {
    const legacy = readLegacy<CookingLog>(LS_LOGS);
    if (legacy.length) {
      for (const l of legacy) await idbPut(db, LOG_STORE, l);
      logsCache = legacy;
    }
  }

  initialized = true;
}

/* ─── レシピ ───────────────────────────────────────── */

export function getRecipes(): Recipe[] {
  return [...recipesCache];
}

export function getRecipe(id: number): Recipe | null {
  return recipesCache.find((r) => r.id === id) ?? null;
}

export async function createRecipe(
  data: Omit<Recipe, "id" | "createdAt" | "updatedAt">
): Promise<Recipe> {
  const db = await openDB();
  const now = new Date().toISOString();
  const recipe: Recipe = {
    ...data,
    id: nextId(recipesCache),
    createdAt: now,
    updatedAt: now,
  };
  await idbPut(db, RECIPE_STORE, recipe);
  recipesCache = [...recipesCache, recipe];
  return recipe;
}

export async function updateRecipe(
  id: number,
  data: Partial<Omit<Recipe, "id" | "createdAt">>
): Promise<Recipe | null> {
  const idx = recipesCache.findIndex((r) => r.id === id);
  if (idx === -1) return null;
  const db = await openDB();
  const updated: Recipe = {
    ...recipesCache[idx],
    ...data,
    updatedAt: new Date().toISOString(),
  };
  await idbPut(db, RECIPE_STORE, updated);
  const next = [...recipesCache];
  next[idx] = updated;
  recipesCache = next;
  return updated;
}

export async function deleteRecipeById(id: number): Promise<void> {
  const db = await openDB();
  await idbDelete(db, RECIPE_STORE, id);
  recipesCache = recipesCache.filter((r) => r.id !== id);

  // 関連する調理ログも削除
  const relatedLogs = logsCache.filter((l) => l.recipeId === id);
  for (const log of relatedLogs) {
    await idbDelete(db, LOG_STORE, log.id);
  }
  logsCache = logsCache.filter((l) => l.recipeId !== id);
}

export async function toggleFavoriteById(id: number): Promise<void> {
  const recipe = getRecipe(id);
  if (recipe) await updateRecipe(id, { isFavorite: !recipe.isFavorite });
}

/* ─── 調理ログ ─────────────────────────────────────── */

export function getLogs(): CookingLog[] {
  return [...logsCache];
}

export function getLogsForRecipe(recipeId: number): CookingLog[] {
  return logsCache
    .filter((l) => l.recipeId === recipeId)
    .sort((a, b) => b.cookedAt.localeCompare(a.cookedAt));
}

export async function addLog(
  data: Omit<CookingLog, "id" | "createdAt">
): Promise<CookingLog> {
  const db = await openDB();
  const log: CookingLog = {
    ...data,
    id: nextId(logsCache),
    createdAt: new Date().toISOString(),
  };
  await idbPut(db, LOG_STORE, log);
  logsCache = [...logsCache, log];
  return log;
}

export async function deleteLogById(id: number): Promise<void> {
  const db = await openDB();
  await idbDelete(db, LOG_STORE, id);
  logsCache = logsCache.filter((l) => l.id !== id);
}
