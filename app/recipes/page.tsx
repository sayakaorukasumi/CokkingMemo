"use client";

import { Suspense, useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  getRecipes,
  getRecipe,
  getLogsForRecipe,
  deleteRecipeById,
  toggleFavoriteById,
  initStorage,
} from "@/lib/storage";
import type { Recipe, CookingLog } from "@/lib/types";
import {
  VEG_PRESENCE_LABELS,
  ENERGY_LEVEL_LABELS,
  DISHWASHING_LABELS,
} from "@/lib/types";
import RecipeCard from "@/components/RecipeCard";
import RecipeForm from "@/components/RecipeForm";
import FavoriteButton from "@/components/FavoriteButton";
import CookingLogForm from "@/components/CookingLogForm";
import DeleteLogButton from "@/components/DeleteLogButton";
import {
  PlusCircle,
  Search,
  ChevronLeft,
  Pencil,
  Trash2,
  Clock,
  Zap,
  Droplets,
  Leaf,
} from "lucide-react";

/* ─── Comment Bubble ────────────────────────── */

function CommentBubble({
  name,
  emoji,
  comment,
  label,
  avatarBg,
  avatarColor,
  bubbleBg,
  bubbleBorder,
  nameColor,
}: {
  name: string;
  emoji: string;
  comment: string;
  label?: string;
  avatarBg: string;
  avatarColor: string;
  bubbleBg: string;
  bubbleBorder: string;
  nameColor: string;
}) {
  return (
    <div style={{ display: "flex", alignItems: "flex-start", gap: "0.625rem" }}>
      {/* アバター */}
      <div
        style={{
          flexShrink: 0,
          width: "2.75rem",
          height: "2.75rem",
          borderRadius: "9999px",
          background: avatarBg,
          color: avatarColor,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: "0 2px 6px rgba(0,0,0,0.06)",
        }}
      >
        <span style={{ fontSize: "1.125rem", lineHeight: 1 }}>{emoji}</span>
        <span style={{ fontSize: "0.625rem", fontWeight: 700, marginTop: "1px" }}>{name}</span>
      </div>

      {/* 吹き出し */}
      <div style={{ position: "relative", flex: 1, minWidth: 0 }}>
        {/* しっぽ */}
        <div
          style={{
            position: "absolute",
            left: "-6px",
            top: "0.875rem",
            width: 0,
            height: 0,
            borderTop: "6px solid transparent",
            borderBottom: "6px solid transparent",
            borderRight: `7px solid ${bubbleBorder}`,
          }}
        />
        <div
          style={{
            background: bubbleBg,
            border: `1px solid ${bubbleBorder}`,
            borderRadius: "1rem",
            padding: "0.625rem 0.875rem",
          }}
        >
          <p style={{ fontSize: "0.75rem", fontWeight: 700, color: nameColor, marginBottom: "0.25rem" }}>
            {label ? `${name}（${label}）` : `${name}コメント`}
          </p>
          <p style={{ fontSize: "0.875rem", color: "#4b5563", whiteSpace: "pre-line", lineHeight: 1.7 }}>
            {comment}
          </p>
        </div>
      </div>
    </div>
  );
}

/* ─── Detail Overlay ─────────────────────────── */

function RecipeDetail({
  id,
  onBack,
  onEdit,
  onDeleted,
}: {
  id: number;
  onBack: () => void;
  onEdit: () => void;
  onDeleted: () => void;
}) {
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [logs, setLogs] = useState<CookingLog[]>([]);
  const [loadError, setLoadError] = useState(false);

  const refresh = useCallback(() => {
    const r = getRecipe(id);
    setRecipe(r);
    setLogs(getLogsForRecipe(id));
  }, [id]);

  useEffect(() => {
    initStorage().then(refresh).catch(() => setLoadError(true));
  }, [refresh]);

  async function handleDelete() {
    if (!confirm("このレシピを削除しますか？")) return;
    await deleteRecipeById(id);
    onDeleted();
  }

  async function handleToggleFavorite() {
    await toggleFavoriteById(id);
    refresh();
  }

  if (loadError) {
    return (
      <div style={{ position: "fixed", inset: 0, zIndex: 50, background: "white", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "1rem" }}>
        <p style={{ color: "#dc2626" }}>データを読み込めませんでした</p>
        <button onClick={onBack} style={{ color: "#f472b6", background: "none", border: "none", cursor: "pointer", textDecoration: "underline" }}>← 戻る</button>
      </div>
    );
  }

  if (!recipe) {
    return (
      <div style={{ position: "fixed", inset: 0, zIndex: 50, background: "white", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "1rem" }}>
        <p style={{ color: "#9ca3af" }}>読み込み中...</p>
        <button onClick={onBack} style={{ color: "#9ca3af", background: "none", border: "none", cursor: "pointer", fontSize: "0.875rem" }}>← 戻る</button>
      </div>
    );
  }

  const hasNutrition = recipe.calorie || recipe.protein || recipe.fat || recipe.carbs || recipe.fiber;

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 50, background: "var(--background)", overflowY: "scroll", WebkitOverflowScrolling: "touch" } as React.CSSProperties}>
      <div className="max-w-2xl mx-auto px-4 py-6 space-y-5" style={{ paddingBottom: "5rem" }}>
        {/* ヘッダー */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <button onClick={onBack} style={{ color: "#9ca3af", display: "flex", alignItems: "center", background: "none", border: "none", cursor: "pointer" }}>
            <ChevronLeft size={20} />
          </button>
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <FavoriteButton id={recipe.id} isFavorite={recipe.isFavorite} onToggle={handleToggleFavorite} />
            <button
              onClick={onEdit}
              style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "0.875rem", color: "#9ca3af", background: "none", border: "none", cursor: "pointer" }}
            >
              <Pencil size={15} />
              編集
            </button>
            <button
              onClick={handleDelete}
              style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "0.875rem", color: "#9ca3af", background: "none", border: "none", cursor: "pointer" }}
              className="hover:text-red-400"
            >
              <Trash2 size={15} />
              削除
            </button>
          </div>
        </div>

        {/* 写真 */}
        {recipe.photo && (
          <div style={{ display: "flex", justifyContent: "center" }}>
            <div
              style={{
                position: "relative",
                width: "100%",
                maxWidth: "320px",
                aspectRatio: "1/1",
                borderRadius: "1.5rem",
                overflow: "hidden",
                background: "linear-gradient(135deg, #fdf2f8 0%, #fce7f3 100%)",
                padding: "0.75rem",
                boxShadow: "0 4px 16px rgba(236, 72, 153, 0.12)",
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={recipe.photo}
                alt={recipe.name}
                style={{ width: "100%", height: "100%", objectFit: "contain", borderRadius: "1rem" }}
              />
            </div>
          </div>
        )}

        {/* タイトル・タグ */}
        <div>
          <h1 style={{ fontSize: "1.5rem", fontWeight: 700, color: "#374151", lineHeight: 1.3 }}>{recipe.name}</h1>
          {recipe.tags && (
            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", marginTop: "0.5rem" }}>
              {recipe.tags.split(",").map((t) =>
                t.trim() ? (
                  <span key={t} style={{ background: "#fce7f3", color: "#ec4899", borderRadius: "9999px", padding: "2px 10px", fontSize: "0.75rem" }}>
                    {t.trim()}
                  </span>
                ) : null
              )}
            </div>
          )}
        </div>

        {/* 指標バッジ */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
          <span style={{ display: "flex", alignItems: "center", gap: "4px", background: "#fff7ed", color: "#ea580c", borderRadius: "9999px", padding: "4px 12px", fontSize: "0.875rem" }}>
            <Clock size={14} /> {recipe.cookingTime}分
          </span>
          <span style={{ display: "flex", alignItems: "center", gap: "4px", background: "#fefce8", color: "#ca8a04", borderRadius: "9999px", padding: "4px 12px", fontSize: "0.875rem" }}>
            <Zap size={14} /> {ENERGY_LEVEL_LABELS[recipe.energyLevel]}
          </span>
          <span style={{ display: "flex", alignItems: "center", gap: "4px", background: "#f0fdf4", color: "#16a34a", borderRadius: "9999px", padding: "4px 12px", fontSize: "0.875rem" }}>
            <Droplets size={14} /> 洗い物: {DISHWASHING_LABELS[recipe.dishwashing]}
          </span>
          <span style={{ display: "flex", alignItems: "center", gap: "4px", background: "#f0fdf4", color: "#15803d", borderRadius: "9999px", padding: "4px 12px", fontSize: "0.875rem" }}>
            <Leaf size={14} /> {VEG_PRESENCE_LABELS[recipe.vegPresence]}
          </span>
        </div>

        {/* 材料 */}
        {recipe.ingredients && (
          <div className="card">
            <h2 style={{ fontWeight: 600, color: "#374151", marginBottom: "0.5rem" }}>材料</h2>
            <p style={{ whiteSpace: "pre-line", fontSize: "0.875rem", color: "#4b5563", lineHeight: 1.8 }}>{recipe.ingredients}</p>
          </div>
        )}

        {/* 作り方 */}
        {recipe.instructions && (
          <div className="card">
            <h2 style={{ fontWeight: 600, color: "#374151", marginBottom: "0.5rem" }}>作り方</h2>
            <p style={{ whiteSpace: "pre-line", fontSize: "0.875rem", color: "#4b5563", lineHeight: 1.8 }}>{recipe.instructions}</p>
          </div>
        )}

        {/* 栄養メモ */}
        {hasNutrition && (
          <div className="card">
            <h2 style={{ fontWeight: 600, color: "#374151", marginBottom: "0.75rem" }}>栄養メモ</h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: "0.5rem", textAlign: "center" }}>
              {[
                { label: "kcal", value: recipe.calorie },
                { label: "たんぱく質", value: recipe.protein ? `${recipe.protein}g` : null },
                { label: "脂質", value: recipe.fat ? `${recipe.fat}g` : null },
                { label: "炭水化物", value: recipe.carbs ? `${recipe.carbs}g` : null },
                { label: "食物繊維", value: recipe.fiber ? `${recipe.fiber}g` : null },
              ].map(({ label, value }) => (
                <div key={label} style={{ background: "#fdf2f8", borderRadius: "0.75rem", padding: "0.5rem" }}>
                  <p style={{ fontSize: "0.6875rem", color: "#9ca3af" }}>{label}</p>
                  <p style={{ fontWeight: 600, fontSize: "0.875rem", color: "#374151" }}>{value ?? "—"}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* コメント（吹き出しUI） */}
        {(recipe.kaoriComment || recipe.kasumiComment || recipe.personalMemo) && (
          <div style={{ display: "flex", flexDirection: "column", gap: "0.875rem" }}>
            {recipe.kaoriComment && (
              <CommentBubble
                name="薫"
                emoji="🍮"
                comment={recipe.kaoriComment}
                avatarBg="#fcd9b6"
                avatarColor="#b45309"
                bubbleBg="#fff7ed"
                bubbleBorder="#fde0c4"
                nameColor="#d97706"
              />
            )}
            {recipe.kasumiComment && (
              <CommentBubble
                name="霞"
                emoji="🌸"
                comment={recipe.kasumiComment}
                avatarBg="#e9d5ff"
                avatarColor="#7c3aed"
                bubbleBg="#faf5ff"
                bubbleBorder="#e9d5ff"
                nameColor="#8b5cf6"
              />
            )}
            {recipe.personalMemo && (
              <CommentBubble
                name="さや"
                label="自分用メモ"
                emoji="🐥"
                comment={recipe.personalMemo}
                avatarBg="#fbcfe8"
                avatarColor="#be185d"
                bubbleBg="#fdf2f8"
                bubbleBorder="#fbcfe8"
                nameColor="#ec4899"
              />
            )}
          </div>
        )}

        {/* 作った記録 */}
        <div>
          <h2 style={{ fontWeight: 600, color: "#374151", marginBottom: "0.75rem" }}>
            作った記録
            <span style={{ marginLeft: "0.5rem", fontSize: "0.875rem", color: "#9ca3af", fontWeight: 400 }}>{logs.length}回</span>
          </h2>
          <CookingLogForm recipeId={recipe.id} onAdd={refresh} />
          {logs.length > 0 && (
            <div style={{ marginTop: "0.75rem", display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              {logs.map((log) => (
                <div key={log.id} className="card" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.25rem" }}>
                      <span style={{ fontSize: "0.875rem", fontWeight: 500, color: "#374151" }}>
                        {new Date(log.cookedAt).toLocaleDateString("ja-JP")}
                      </span>
                      <span style={{ fontSize: "0.75rem", color: log.wentWell ? "#16a34a" : "#9ca3af" }}>
                        {log.wentWell ? "✓ うまくできた" : "△ まあまあ"}
                      </span>
                      <span style={{ fontSize: "0.75rem", color: log.makeAgain ? "#2563eb" : "#9ca3af" }}>
                        {log.makeAgain ? "♻ また作りたい" : "一旦いいかな"}
                      </span>
                    </div>
                    {log.improvementNote && (
                      <p style={{ fontSize: "0.8125rem", color: "#6b7280", whiteSpace: "pre-line" }}>{log.improvementNote}</p>
                    )}
                  </div>
                  <DeleteLogButton logId={log.id} onDelete={refresh} />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ─── Edit Overlay ────────────────────────── */

function RecipeEdit({
  id,
  onSave,
  onCancel,
}: {
  id: number;
  onSave: (savedId: number) => void;
  onCancel: () => void;
}) {
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    initStorage().then(() => setRecipe(getRecipe(id))).catch(() => setLoadError(true));
  }, [id]);

  if (loadError) {
    return (
      <div style={{ position: "fixed", inset: 0, zIndex: 50, background: "white", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "1rem" }}>
        <p style={{ color: "#dc2626" }}>データを読み込めませんでした</p>
        <button onClick={onCancel} style={{ color: "#f472b6", background: "none", border: "none", cursor: "pointer", textDecoration: "underline" }}>← 戻る</button>
      </div>
    );
  }

  if (!recipe) {
    return (
      <div style={{ position: "fixed", inset: 0, zIndex: 50, background: "white", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "1rem" }}>
        <p style={{ color: "#9ca3af" }}>読み込み中...</p>
        <button onClick={onCancel} style={{ color: "#9ca3af", background: "none", border: "none", cursor: "pointer", fontSize: "0.875rem" }}>← 戻る</button>
      </div>
    );
  }

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 50, background: "var(--background)", overflowY: "scroll", WebkitOverflowScrolling: "touch" } as React.CSSProperties}>
      <div className="max-w-2xl mx-auto px-4 py-6" style={{ paddingBottom: "5rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1.5rem" }}>
          <button onClick={onCancel} style={{ color: "#9ca3af", display: "flex", alignItems: "center", background: "none", border: "none", cursor: "pointer" }}>
            <ChevronLeft size={20} />
          </button>
          <h1 style={{ fontSize: "1.25rem", fontWeight: 700, color: "#374151" }}>レシピを編集</h1>
        </div>
        <RecipeForm recipe={recipe} onSuccess={onSave} />
      </div>
    </div>
  );
}

/* ─── Main Content ────────────────────────── */

function RecipesContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const rawId = searchParams.get("id");
  const selectedId = rawId ? parseInt(rawId) : null;
  const isEditing = searchParams.has("edit");
  const favoritesOnly = searchParams.get("favorite") === "1";

  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [q, setQ] = useState("");
  const [energyFilter, setEnergyFilter] = useState("");
  const [maxTimeFilter, setMaxTimeFilter] = useState("");
  const [vegFilter, setVegFilter] = useState("");
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(favoritesOnly);

  function loadRecipes() {
    setRecipes(getRecipes());
  }

  useEffect(() => {
    initStorage().then(loadRecipes).catch(() => setRecipes([]));
  }, []);

  const filtered = recipes
    .filter((r) => {
      if (q && !r.name.toLowerCase().includes(q.toLowerCase())) return false;
      if (energyFilter && r.energyLevel > parseInt(energyFilter)) return false;
      if (maxTimeFilter && r.cookingTime > parseInt(maxTimeFilter)) return false;
      if (vegFilter && r.vegPresence !== vegFilter) return false;
      if (showFavoritesOnly && !r.isFavorite) return false;
      return true;
    })
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));

  // Show detail overlay
  if (selectedId !== null && !isEditing) {
    return (
      <>
        <ListContent
          recipes={filtered}
          q={q} setQ={setQ}
          energyFilter={energyFilter} setEnergyFilter={setEnergyFilter}
          maxTimeFilter={maxTimeFilter} setMaxTimeFilter={setMaxTimeFilter}
          vegFilter={vegFilter} setVegFilter={setVegFilter}
          showFavoritesOnly={showFavoritesOnly} setShowFavoritesOnly={setShowFavoritesOnly}
        />
        <RecipeDetail
          id={selectedId}
          onBack={() => router.back()}
          onEdit={() => router.push(`/recipes?id=${selectedId}&edit`)}
          onDeleted={() => { loadRecipes(); router.replace("/recipes"); }}
        />
      </>
    );
  }

  // Show edit overlay
  if (selectedId !== null && isEditing) {
    return (
      <>
        <ListContent
          recipes={filtered}
          q={q} setQ={setQ}
          energyFilter={energyFilter} setEnergyFilter={setEnergyFilter}
          maxTimeFilter={maxTimeFilter} setMaxTimeFilter={setMaxTimeFilter}
          vegFilter={vegFilter} setVegFilter={setVegFilter}
          showFavoritesOnly={showFavoritesOnly} setShowFavoritesOnly={setShowFavoritesOnly}
        />
        <RecipeEdit
          id={selectedId}
          onSave={(savedId) => { loadRecipes(); router.replace(`/recipes?id=${savedId}`); }}
          onCancel={() => router.back()}
        />
      </>
    );
  }

  return (
    <ListContent
      recipes={filtered}
      q={q} setQ={setQ}
      energyFilter={energyFilter} setEnergyFilter={setEnergyFilter}
      maxTimeFilter={maxTimeFilter} setMaxTimeFilter={setMaxTimeFilter}
      vegFilter={vegFilter} setVegFilter={setVegFilter}
      showFavoritesOnly={showFavoritesOnly} setShowFavoritesOnly={setShowFavoritesOnly}
    />
  );
}

function ListContent({
  recipes,
  q, setQ,
  energyFilter, setEnergyFilter,
  maxTimeFilter, setMaxTimeFilter,
  vegFilter, setVegFilter,
  showFavoritesOnly, setShowFavoritesOnly,
}: {
  recipes: Recipe[];
  q: string; setQ: (v: string) => void;
  energyFilter: string; setEnergyFilter: (v: string) => void;
  maxTimeFilter: string; setMaxTimeFilter: (v: string) => void;
  vegFilter: string; setVegFilter: (v: string) => void;
  showFavoritesOnly: boolean; setShowFavoritesOnly: (v: boolean) => void;
}) {
  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-4">
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <h1 style={{ fontSize: "1.25rem", fontWeight: 700, color: "#374151" }}>レシピ一覧</h1>
        <Link href="/recipes/new" className="btn-primary" style={{ display: "flex", alignItems: "center", gap: "4px" }}>
          <PlusCircle size={16} />
          追加
        </Link>
      </div>

      {/* 検索・フィルター */}
      <div className="card space-y-3">
        <div style={{ position: "relative" }}>
          <Search size={16} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "#d1d5db" }} />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="input"
            style={{ paddingLeft: "2rem" }}
            placeholder="料理名で検索..."
          />
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem" }}>
          <select value={energyFilter} onChange={(e) => setEnergyFilter(e.target.value)} className="input">
            <option value="">気力レベル（全て）</option>
            {[1, 2, 3, 4].map((v) => (
              <option key={v} value={v}>{ENERGY_LEVEL_LABELS[v]}以下</option>
            ))}
          </select>
          <select value={maxTimeFilter} onChange={(e) => setMaxTimeFilter(e.target.value)} className="input">
            <option value="">調理時間（全て）</option>
            <option value="15">15分以内</option>
            <option value="30">30分以内</option>
            <option value="45">45分以内</option>
            <option value="60">1時間以内</option>
          </select>
          <select value={vegFilter} onChange={(e) => setVegFilter(e.target.value)} className="input">
            <option value="">野菜の存在感（全て）</option>
            {Object.entries(VEG_PRESENCE_LABELS).map(([k, v]) => (
              <option key={k} value={k}>{v}</option>
            ))}
          </select>
          <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.875rem", color: "#4b5563", cursor: "pointer", paddingLeft: "0.5rem" }}>
            <input
              type="checkbox"
              checked={showFavoritesOnly}
              onChange={(e) => setShowFavoritesOnly(e.target.checked)}
            />
            お気に入りのみ
          </label>
        </div>
      </div>

      <p style={{ fontSize: "0.875rem", color: "#9ca3af" }}>{recipes.length}件のレシピ</p>

      {recipes.length === 0 ? (
        <div className="card" style={{ textAlign: "center", padding: "3rem", color: "#9ca3af" }}>
          <p>レシピが見つかりませんでした</p>
          <Link href="/recipes/new" style={{ display: "block", marginTop: "0.75rem", color: "#f472b6", fontSize: "0.875rem" }}>
            + 新しいレシピを登録する
          </Link>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
          {recipes.map((r) => <RecipeCard key={r.id} recipe={r} />)}
        </div>
      )}
    </div>
  );
}

/* ─── Page Export ─────────────────────────── */

export default function RecipesPage() {
  return (
    <Suspense
      fallback={
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "60vh" }}>
          <p style={{ color: "#9ca3af" }}>読み込み中...</p>
        </div>
      }
    >
      <RecipesContent />
    </Suspense>
  );
}
