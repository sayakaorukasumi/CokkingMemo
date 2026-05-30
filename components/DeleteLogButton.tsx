"use client";

import { useTransition } from "react";
import { X } from "lucide-react";
import { deleteCookingLog } from "@/lib/actions";

export default function DeleteLogButton({ logId, recipeId }: { logId: number; recipeId: number }) {
  const [isPending, startTransition] = useTransition();

  return (
    <button
      onClick={() => startTransition(() => deleteCookingLog(logId, recipeId))}
      disabled={isPending}
      className="text-gray-300 hover:text-red-400 transition-colors"
    >
      <X size={14} />
    </button>
  );
}
