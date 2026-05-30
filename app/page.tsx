import Link from "next/link";
import { prisma } from "@/lib/prisma";
import RecipeCard from "@/components/RecipeCard";
import { ENERGY_LEVEL_LABELS } from "@/lib/types";
import { Zap, Clock, ChevronRight } from "lucide-react";

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ energy?: string; maxTime?: string }>;
}) {
  const params = await searchParams;
  const energyFilter = params.energy ? parseInt(params.energy) : null;
  const maxTimeFilter = params.maxTime ? parseInt(params.maxTime) : null;

  const candidates = await prisma.recipe.findMany({
    where: {
      ...(energyFilter !== null ? { energyLevel: { lte: energyFilter } } : {}),
      ...(maxTimeFilter !== null ? { cookingTime: { lte: maxTimeFilter } } : {}),
    },
    orderBy: { updatedAt: "desc" },
    take: 12,
  });

  const favorites = await prisma.recipe.findMany({
    where: { isFavorite: true },
    orderBy: { updatedAt: "desc" },
    take: 6,
  });

  const recent = await prisma.recipe.findMany({
    orderBy: { createdAt: "desc" },
    take: 6,
  });

  const isFiltered = energyFilter !== null || maxTimeFilter !== null;

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-8">
      <div className="text-center py-4">
        <h1 className="text-2xl font-bold" style={{ color: "#d4719c" }}>
          今日、何を作ろうか？
        </h1>
        <p className="text-sm text-gray-400 mt-1">気力と時間で絞り込んでみよう</p>
      </div>

      <form className="card space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label" style={{ display: "flex", alignItems: "center", gap: "4px" }}>
              <Zap size={14} style={{ color: "#facc15" }} />
              今日の気力
            </label>
            <select name="energy" defaultValue={params.energy ?? ""} className="input">
              <option value="">気力を選ばない</option>
              {[1, 2, 3, 4].map((v) => (
                <option key={v} value={v}>{v} - {ENERGY_LEVEL_LABELS[v]}以下</option>
              ))}
            </select>
          </div>
          <div>
            <label className="label" style={{ display: "flex", alignItems: "center", gap: "4px" }}>
              <Clock size={14} style={{ color: "#60a5fa" }} />
              最大調理時間
            </label>
            <select name="maxTime" defaultValue={params.maxTime ?? ""} className="input">
              <option value="">時間を選ばない</option>
              <option value="15">15分以内</option>
              <option value="30">30分以内</option>
              <option value="45">45分以内</option>
              <option value="60">1時間以内</option>
            </select>
          </div>
        </div>
        <button type="submit" className="btn-primary" style={{ width: "100%" }}>
          候補を表示
        </button>
        {isFiltered && (
          <Link href="/" style={{ display: "block", textAlign: "center", fontSize: "0.75rem", color: "#9ca3af" }}>
            絞り込みをクリア
          </Link>
        )}
      </form>

      {isFiltered && (
        <section>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.75rem" }}>
            <h2 style={{ fontWeight: 600, color: "#374151" }}>
              今日の候補
              <span style={{ marginLeft: "0.5rem", fontSize: "0.875rem", color: "#9ca3af", fontWeight: 400 }}>{candidates.length}件</span>
            </h2>
          </div>
          {candidates.length === 0 ? (
            <div className="card" style={{ textAlign: "center", padding: "2rem", color: "#9ca3af" }}>
              <p>条件に合うレシピが見つかりませんでした</p>
              <Link href="/recipes/new" style={{ display: "block", marginTop: "0.75rem", color: "#f472b6", fontSize: "0.875rem" }}>
                + 新しいレシピを登録する
              </Link>
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
              {candidates.map((r) => <RecipeCard key={r.id} recipe={r} />)}
            </div>
          )}
        </section>
      )}

      {favorites.length > 0 && (
        <section>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.75rem" }}>
            <h2 style={{ fontWeight: 600, color: "#374151" }}>⭐ お気に入り</h2>
            <Link href="/recipes?favorite=1" style={{ fontSize: "0.75rem", color: "#f472b6", display: "flex", alignItems: "center", gap: "2px" }}>
              もっと見る <ChevronRight size={12} />
            </Link>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
            {favorites.map((r) => <RecipeCard key={r.id} recipe={r} />)}
          </div>
        </section>
      )}

      <section>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.75rem" }}>
          <h2 style={{ fontWeight: 600, color: "#374151" }}>最近追加したレシピ</h2>
          <Link href="/recipes" style={{ fontSize: "0.75rem", color: "#f472b6", display: "flex", alignItems: "center", gap: "2px" }}>
            すべて見る <ChevronRight size={12} />
          </Link>
        </div>
        {recent.length === 0 ? (
          <div className="card" style={{ textAlign: "center", padding: "2rem", color: "#9ca3af" }}>
            <p>まだレシピがありません</p>
            <Link href="/recipes/new" style={{ display: "block", marginTop: "0.75rem", color: "#f472b6", fontSize: "0.875rem", fontWeight: 500 }}>
              + 最初のレシピを登録する
            </Link>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
            {recent.map((r) => <RecipeCard key={r.id} recipe={r} />)}
          </div>
        )}
      </section>
    </div>
  );
}
