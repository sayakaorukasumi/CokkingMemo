"use client";

import { useTransition } from "react";
import { Heart } from "lucide-react";
import { toggleFavorite } from "@/lib/actions";

export default function FavoriteButton({ id, isFavorite }: { id: number; isFavorite: boolean }) {
  const [isPending, startTransition] = useTransition();

  return (
    <button
      onClick={() => startTransition(() => toggleFavorite(id, isFavorite))}
      disabled={isPending}
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
