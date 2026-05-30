import Link from "next/link";
import { prisma } from "@/lib/prisma";
import RecipeCard from "@/components/RecipeCard";
import { VEG_PRESENCE_LABELS, ENERGY_LEVEL_LABELS } from "@/lib/types";
import { PlusCircle, Search } from "lucide-react";
import type { Prisma } from "@/app/generated/prisma/client";

export default async function RecipesPage({
  searchParams,
}: {
  searchParams: Promise<{
    q?: string;
    energy?: string;
    maxTime?: string;
    veg?: string;
    favorite?: string;
  }>;
}) {
  const params = await searchParams;
  const q = params.q?.trim() || "";
  const energyFilter = params.energy ? parseInt(params.energy) : null;
  const maxTimeFilter = params.maxTime ? parseInt(params.maxTime) : null;
  const vegFilter = params.veg || "";
  const favoriteFilter = params.favorite === "1";

  const where: Prisma.RecipeWhereInput = {
    ...(q ? { name: { contains: q } } : {}),
    ...(energyFilter !== null ? { energyLevel: { lte: energyFilter } } : {}),
    ...(maxTimeFilter !== null ? { cookingTime: { lte: maxTimeFilter } } : {}),
    ...(vegFilter ? { vegPresence: vegFilter } : {}),
    ...(favoriteFilter ? { isFavorite: true } : {}),
  };

  const recipes = await prisma.recipe.findMany({
    where,
    orderBy: { updatedAt: "desc" },
  });

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-4">
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <h1 style={{ fontSize: "1.25rem", fontWeight: 700, color: "#374151" }}>レシピ一覧</h1>
        <Link href="/recipes/new" className="btn-primary" style={{ display: "flex", alignItems: "center", gap: "4px" }}>
          <PlusCircle size={16} />
          追加
        </Link>
      </div>

      <form className="card space-y-3">
        <div style={{ position: "relative" }}>
          <Search size={16} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "#d1d5db" }} />
          <input
            name="q"
            defaultValue={q}
            className="input"
            style={{ paddingLeft: "2rem" }}
            placeholder="料理名で検索..."
          />
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem" }}>
          <select name="energy" defaultValue={params.energy ?? ""} className="input">
            <option value="">気力レベル（全て）</option>
            {[1, 2, 3, 4].map((v) => (
              <option key={v} value={v}>{ENERGY_LEVEL_LABELS[v]}以下</option>
            ))}
          </select>
          <select name="maxTime" defaultValue={params.maxTime ?? ""} className="input">
            <option value="">調理時間（全て）</option>
            <option value="15">15分以内</option>
            <option value="30">30分以内</option>
            <option value="45">45分以内</option>
            <option value="60">1時間以内</option>
          </select>
          <select name="veg" defaultValue={params.veg ?? ""} className="input">
            <option value="">野菜の存在感（全て）</option>
            {Object.entries(VEG_PRESENCE_LABELS).map(([k, v]) => (
              <option key={k} value={k}>{v}</option>
            ))}
          </select>
          <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.875rem", color: "#4b5563", cursor: "pointer", paddingLeft: "0.5rem" }}>
            <input type="checkbox" name="favorite" value="1" defaultChecked={favoriteFilter} />
            お気に入りのみ
          </label>
        </div>
        <div style={{ display: "flex", gap: "0.5rem" }}>
          <button type="submit" className="btn-primary" style={{ flex: 1 }}>絞り込む</button>
          <Link href="/recipes" className="btn-secondary" style={{ flex: 1, textAlign: "center", lineHeight: "2rem" }}>リセット</Link>
        </div>
      </form>

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
