"use client";

import { useState } from "react";
import { addLog } from "@/lib/storage";

export default function CookingLogForm({
  recipeId,
  onAdd,
}: {
  recipeId: number;
  onAdd: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const today = new Date().toISOString().split("T")[0];

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    const fd = new FormData(e.currentTarget);
    addLog({
      recipeId,
      cookedAt: fd.get("cookedAt") as string,
      wentWell: fd.get("wentWell") === "true",
      makeAgain: fd.get("makeAgain") === "true",
      improvementNote: (fd.get("improvementNote") as string) || "",
    });
    setSaving(false);
    setOpen(false);
    onAdd();
  }

  if (!open) {
    return (
      <button onClick={() => setOpen(true)} className="btn-secondary text-sm">
        + 作った記録を追加
      </button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="bg-pink-50 rounded-2xl p-4 space-y-4">
      <h3 className="font-semibold text-gray-700">作った記録を追加</h3>
      <div>
        <label className="label">作った日</label>
        <input name="cookedAt" type="date" defaultValue={today} required className="input" />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="label">うまくできたか</label>
          <select name="wentWell" className="input">
            <option value="true">✓ うまくできた</option>
            <option value="false">△ まあまあ</option>
          </select>
        </div>
        <div>
          <label className="label">また作りたいか</label>
          <select name="makeAgain" className="input">
            <option value="true">✓ また作りたい</option>
            <option value="false">△ 一旦いいかな</option>
          </select>
        </div>
      </div>
      <div>
        <label className="label">次回の改善メモ</label>
        <textarea name="improvementNote" rows={2} className="input resize-none" placeholder="次はもう少し甘くしてみよう..." />
      </div>
      <div className="flex gap-2">
        <button type="submit" disabled={saving} className="btn-primary flex-1 disabled:opacity-50">
          {saving ? "保存中..." : "保存"}
        </button>
        <button type="button" onClick={() => setOpen(false)} className="btn-secondary flex-1">
          キャンセル
        </button>
      </div>
    </form>
  );
}
