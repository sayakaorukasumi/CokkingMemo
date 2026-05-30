import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/lib/prisma";
import { VEG_PRESENCE_LABELS, ENERGY_LEVEL_LABELS, DISHWASHING_LABELS } from "@/lib/types";
import FavoriteButton from "@/components/FavoriteButton";
import DeleteButton from "@/components/DeleteButton";
import CookingLogForm from "@/components/CookingLogForm";
import DeleteLogButton from "@/components/DeleteLogButton";
import { ChevronLeft, Pencil, Clock, Zap, Droplets, Leaf } from "lucide-react";

export default async function RecipeDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const recipe = await prisma.recipe.findUnique({
    where: { id: parseInt(id) },
    include: { cookingLogs: { orderBy: { cookedAt: "desc" } } },
  });

  if (!recipe) notFound();

  const hasNutrition = recipe.calorie || recipe.protein || recipe.fat || recipe.carbs || recipe.fiber;

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-5">
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <Link href="/recipes" style={{ color: "#9ca3af", display: "flex", alignItems: "center" }}>
          <ChevronLeft size={20} />
        </Link>
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <FavoriteButton id={recipe.id} isFavorite={recipe.isFavorite} />
          <Link href={`/recipes/${recipe.id}/edit`} style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "0.875rem", color: "#9ca3af" }}>
            <Pencil size={15} />
            編集
          </Link>
          <DeleteButton id={recipe.id} />
        </div>
      </div>

      {recipe.photo && (
        <div style={{ position: "relative", width: "100%", aspectRatio: "16/9", borderRadius: "1rem", overflow: "hidden", background: "#fdf2f8" }}>
          <Image src={recipe.photo} alt={recipe.name} fill style={{ objectFit: "cover" }} />
        </div>
      )}

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

      {recipe.ingredients && (
        <div className="card">
          <h2 style={{ fontWeight: 600, color: "#374151", marginBottom: "0.5rem" }}>材料</h2>
          <p style={{ whiteSpace: "pre-line", fontSize: "0.875rem", color: "#4b5563", lineHeight: 1.8 }}>{recipe.ingredients}</p>
        </div>
      )}

      {recipe.instructions && (
        <div className="card">
          <h2 style={{ fontWeight: 600, color: "#374151", marginBottom: "0.5rem" }}>作り方</h2>
          <p style={{ whiteSpace: "pre-line", fontSize: "0.875rem", color: "#4b5563", lineHeight: 1.8 }}>{recipe.instructions}</p>
        </div>
      )}

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

      {(recipe.kaoriComment || recipe.kasumiComment || recipe.personalMemo) && (
        <div className="card space-y-3">
          {recipe.kaoriComment && (
            <div>
              <p style={{ fontSize: "0.75rem", fontWeight: 600, color: "#ec4899", marginBottom: "2px" }}>💬 薫コメント</p>
              <p style={{ fontSize: "0.875rem", color: "#4b5563", whiteSpace: "pre-line" }}>{recipe.kaoriComment}</p>
            </div>
          )}
          {recipe.kasumiComment && (
            <div>
              <p style={{ fontSize: "0.75rem", fontWeight: 600, color: "#8b5cf6", marginBottom: "2px" }}>💬 霞コメント</p>
              <p style={{ fontSize: "0.875rem", color: "#4b5563", whiteSpace: "pre-line" }}>{recipe.kasumiComment}</p>
            </div>
          )}
          {recipe.personalMemo && (
            <div>
              <p style={{ fontSize: "0.75rem", fontWeight: 600, color: "#6b7280", marginBottom: "2px" }}>📝 自分用メモ</p>
              <p style={{ fontSize: "0.875rem", color: "#4b5563", whiteSpace: "pre-line" }}>{recipe.personalMemo}</p>
            </div>
          )}
        </div>
      )}

      <div>
        <h2 style={{ fontWeight: 600, color: "#374151", marginBottom: "0.75rem" }}>
          作った記録
          <span style={{ marginLeft: "0.5rem", fontSize: "0.875rem", color: "#9ca3af", fontWeight: 400 }}>{recipe.cookingLogs.length}回</span>
        </h2>
        <CookingLogForm recipeId={recipe.id} />
        {recipe.cookingLogs.length > 0 && (
          <div style={{ marginTop: "0.75rem", display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            {recipe.cookingLogs.map((log) => (
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
                <DeleteLogButton logId={log.id} recipeId={recipe.id} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
