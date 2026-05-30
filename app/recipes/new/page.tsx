"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import RecipeForm from "@/components/RecipeForm";
import { ChevronLeft } from "lucide-react";

export default function NewRecipePage() {
  const router = useRouter();

  return (
    <div className="max-w-2xl mx-auto px-4 py-6" style={{ paddingBottom: "5rem" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1.5rem" }}>
        <Link href="/recipes" style={{ color: "#9ca3af", display: "flex", alignItems: "center" }}>
          <ChevronLeft size={20} />
        </Link>
        <h1 style={{ fontSize: "1.25rem", fontWeight: 700, color: "#374151" }}>レシピを登録</h1>
      </div>
      <RecipeForm onSuccess={(id) => router.push(`/recipes?id=${id}`)} />
    </div>
  );
}
