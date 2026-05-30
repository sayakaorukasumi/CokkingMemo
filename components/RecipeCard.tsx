import Link from "next/link";
import Image from "next/image";
import { Heart, Clock, Zap } from "lucide-react";
import type { Recipe } from "@/lib/types";
import { ENERGY_LEVEL_LABELS } from "@/lib/types";

export default function RecipeCard({ recipe }: { recipe: Recipe }) {
  return (
    <Link href={`/recipes/${recipe.id}`} className="group block">
      <div className="bg-white rounded-2xl shadow-sm border border-pink-50 overflow-hidden hover:shadow-md transition-shadow">
        <div className="relative aspect-[4/3] bg-pink-50">
          {recipe.photo ? (
            <Image
              src={recipe.photo}
              alt={recipe.name}
              fill
              className="object-cover"
            />
          ) : (
            <div className="flex items-center justify-center h-full text-4xl">
              🍽️
            </div>
          )}
          {recipe.isFavorite && (
            <div className="absolute top-2 right-2">
              <Heart size={18} className="fill-pink-400 text-pink-400" />
            </div>
          )}
        </div>
        <div className="p-3">
          <h3 className="font-semibold text-gray-800 text-sm leading-tight group-hover:text-pink-500 transition-colors line-clamp-2">
            {recipe.name}
          </h3>
          <div className="flex items-center gap-3 mt-2 text-xs text-gray-400">
            <span className="flex items-center gap-0.5">
              <Clock size={12} />
              {recipe.cookingTime}分
            </span>
            <span className="flex items-center gap-0.5">
              <Zap size={12} />
              {ENERGY_LEVEL_LABELS[recipe.energyLevel]}
            </span>
          </div>
          {recipe.tags && (
            <div className="flex flex-wrap gap-1 mt-2">
              {recipe.tags
                .split(",")
                .slice(0, 3)
                .map((tag) =>
                  tag.trim() ? (
                    <span
                      key={tag}
                      className="bg-pink-50 text-pink-400 text-xs px-2 py-0.5 rounded-full"
                    >
                      {tag.trim()}
                    </span>
                  ) : null
                )}
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}
