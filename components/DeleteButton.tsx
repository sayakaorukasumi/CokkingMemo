"use client";

import { useTransition } from "react";
import { Trash2 } from "lucide-react";
import { deleteRecipe } from "@/lib/actions";

export default function DeleteButton({ id }: { id: number }) {
  const [isPending, startTransition] = useTransition();

  function handleClick() {
    if (!confirm("このレシピを削除しますか？")) return;
    startTransition(() => deleteRecipe(id));
  }

  return (
    <button
      onClick={handleClick}
      disabled={isPending}
      className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-red-400 transition-colors disabled:opacity-50"
    >
      <Trash2 size={16} />
      {isPending ? "削除中..." : "削除"}
    </button>
  );
}
