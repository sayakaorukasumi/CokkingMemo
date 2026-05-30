import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import RecipeForm from "@/components/RecipeForm";
import { ChevronLeft } from "lucide-react";

export default async function EditRecipePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const recipe = await prisma.recipe.findUnique({ where: { id: parseInt(id) } });
  if (!recipe) notFound();

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1.5rem" }}>
        <Link href={`/recipes/${recipe.id}`} style={{ color: "#9ca3af", display: "flex", alignItems: "center" }}>
          <ChevronLeft size={20} />
        </Link>
        <h1 style={{ fontSize: "1.25rem", fontWeight: 700, color: "#374151" }}>レシピを編集</h1>
      </div>
      <RecipeForm recipe={recipe} />
    </div>
  );
}
