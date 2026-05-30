"use client";

import { useState } from "react";
import { Heart } from "lucide-react";
import { toggleFavoriteById, getRecipe } from "@/lib/storage";

export default function FavoriteButton({
  id,
  isFavorite: initialFavorite,
  onToggle,
}: {
  id: number;
  isFavorite: boolean;
  onToggle?: () => void;
}) {
  const [isFavorite, setIsFavorite] = useState(initialFavorite);

  function handleClick() {
    toggleFavoriteById(id);
    const updated = getRecipe(id);
    setIsFavorite(updated?.isFavorite ?? !isFavorite);
    onToggle?.();
  }

  return (
    <button
      onClick={handleClick}
      className={`flex items-center gap-1.5 text-sm font-medium transition-colors px-3 py-1.5 rounded-full border ${
        isFavorite
          ? "bg-pink-50 border-pink-200 text-pink-500"
          : "bg-white border-gray-200 text-gray-400 hover:border-pink-200 hover:text-pink-400"
      }`}
    >
      <Heart size={16} className={isFavorite ? "fill-pink-400" : ""} />
      {isFavorite ? "お気に入り" : "お気に入りに追加"}
    </button>
  );
}
