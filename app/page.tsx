"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { getRecipes, initStorage } from "@/lib/storage";
import type { Recipe } from "@/lib/types";
import RecipeCard from "@/components/RecipeCard";
import { ENERGY_LEVEL_LABELS } from "@/lib/types";
import { Zap, Clock, ChevronRight } from "lucide-react";
import HomeHero from "@/components/HomeHero";

export default function HomePage() {
  const [allRecipes, setAllRecipes] = useState<Recipe[]>([]);
  const [energyFilter, setEnergyFilter] = useState("");
  const [maxTimeFilter, setMaxTimeFilter] = useState("");

  useEffect(() => {
    initStorage().then(() => setAllRecipes(getRecipes()));
  }, []);

  const isFiltered = energyFilter !== "" || maxTimeFilter !== "";

  const candidates = allRecipes
    .filter((r) => {
      if (energyFilter && r.energyLevel > parseInt(energyFilter)) return false;
      if (maxTimeFilter && r.cookingTime > parseInt(maxTimeFilter)) return false;
      return true;
    })
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
    .slice(0, 12);

  const favorites = allRecipes
    .filter((r) => r.isFavorite)
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
    .slice(0, 6);

  const recent = allRecipes
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, 6);

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-8">
      <HomeHero />

      {/* フィルター */}
      <div className="card space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label" style={{ display: "flex", alignItems: "center", gap: "4px" }}>
              <Zap size={14} style={{ color: "#facc15" }} />
              今日の気力
            </label>
            <select
              value={energyFilter}
              onChange={(e) => setEnergyFilter(e.target.value)}
              className="input"
            >
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
            <select
              value={maxTimeFilter}
              onChange={(e) => setMaxTimeFilter(e.target.value)}
              className="input"
            >
              <option value="">時間を選ばない</option>
              <option value="15">15分以内</option>
              <option value="30">30分以内</option>
              <option value="45">45分以内</option>
              <option value="60">1時間以内</option>
            </select>
          </div>
        </div>
        {isFiltered && (
          <button
            onClick={() => { setEnergyFilter(""); setMaxTimeFilter(""); }}
            style={{ display: "block", width: "100%", textAlign: "center", fontSize: "0.75rem", color: "#9ca3af", background: "none", border: "none", cursor: "pointer" }}
          >
            絞り込みをクリア
          </button>
        )}
      </div>

      {/* 今日の候補 */}
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

      {/* お気に入り */}
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

      {/* 最近追加したレシピ */}
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
