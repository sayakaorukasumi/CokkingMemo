"use client";

import { X } from "lucide-react";
import { deleteLogById } from "@/lib/storage";

export default function DeleteLogButton({
  logId,
  onDelete,
}: {
  logId: number;
  onDelete: () => void;
}) {
  function handleClick() {
    deleteLogById(logId);
    onDelete();
  }

  return (
    <button
      onClick={handleClick}
      className="text-gray-300 hover:text-red-400 transition-colors"
    >
      <X size={14} />
    </button>
  );
}
