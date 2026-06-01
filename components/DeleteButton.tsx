"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";
import { deleteRecipeById } from "@/lib/storage";

export default function DeleteButton({
  id,
  onDelete,
}: {
  id: number;
  onDelete: () => void;
}) {
  const [deleting, setDeleting] = useState(false);

  async function handleClick() {
    if (!confirm("このレシピを削除しますか？")) return;
    setDeleting(true);
    await deleteRecipeById(id);
    onDelete();
  }

  return (
    <button
      onClick={handleClick}
      disabled={deleting}
      className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-red-400 transition-colors disabled:opacity-50"
    >
      <Trash2 size={16} />
      {deleting ? "削除中..." : "削除"}
    </button>
  );
}
