"use client";

import { useRef, useState, useTransition } from "react";
import Image from "next/image";
import { Upload, X } from "lucide-react";
import { createRecipe, updateRecipe } from "@/lib/actions";
import { VEG_PRESENCE_LABELS, ENERGY_LEVEL_LABELS, DISHWASHING_LABELS } from "@/lib/types";
import type { Recipe } from "@/lib/types";

type Props = { recipe?: Recipe };

export default function RecipeForm({ recipe }: Props) {
  const [isPending, startTransition] = useTransition();
  const [photo, setPhoto] = useState<string>(recipe?.photo || "");
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const json = await res.json();
      setPhoto(json.path);
    } finally {
      setUploading(false);
    }
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    formData.set("photo", photo);
    startTransition(() => {
      if (recipe) {
        updateRecipe(recipe.id, formData);
      } else {
        createRecipe(formData);
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl mx-auto">
      <div>
        <label className="label">写真</label>
        <div
          className="relative w-full aspect-[16/9] bg-pink-50 rounded-2xl border-2 border-dashed border-pink-200 flex items-center justify-center cursor-pointer overflow-hidden"
          onClick={() => fileRef.current?.click()}
        >
          {photo ? (
            <>
              <Image src={photo} alt="料理写真" fill className="object-cover" />
              <button
                type="button"
                className="absolute top-2 right-2 bg-white/80 rounded-full p-1"
                onClick={(e) => { e.stopPropagation(); setPhoto(""); }}
              >
                <X size={16} />
              </button>
            </>
          ) : (
            <div className="flex flex-col items-center gap-2 text-pink-300">
              <Upload size={32} />
              <span className="text-sm">{uploading ? "アップロード中..." : "写真を追加"}</span>
            </div>
          )}
        </div>
        <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
      </div>

      <div>
        <label className="label">料理名 <span className="text-pink-400">*</span></label>
        <input name="name" defaultValue={recipe?.name} required className="input" placeholder="例：鶏むね肉の照り焼き" />
      </div>

      <div>
        <label className="label">材料</label>
        <textarea name="ingredients" defaultValue={recipe?.ingredients} rows={4} className="input resize-none" placeholder="鶏むね肉 200g&#10;しょうゆ 大さじ2&#10;..." />
      </div>
      <div>
        <label className="label">作り方</label>
        <textarea name="instructions" defaultValue={recipe?.instructions} rows={5} className="input resize-none" placeholder="1. 鶏肉を一口大に切る&#10;2. ..." />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="label">調理時間（分）</label>
          <input name="cookingTime" type="number" min={1} defaultValue={recipe?.cookingTime ?? 30} className="input" />
        </div>
        <div>
          <label className="label">気力レベル</label>
          <select name="energyLevel" defaultValue={recipe?.energyLevel ?? 2} className="input">
            {[1, 2, 3, 4].map((v) => (
              <option key={v} value={v}>{v} - {ENERGY_LEVEL_LABELS[v]}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="label">洗い物の少なさ</label>
          <select name="dishwashing" defaultValue={recipe?.dishwashing ?? 2} className="input">
            {[1, 2, 3, 4].map((v) => (
              <option key={v} value={v}>{v} - {DISHWASHING_LABELS[v]}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="label">野菜の存在感</label>
          <select name="vegPresence" defaultValue={recipe?.vegPresence ?? "FINE"} className="input">
            {Object.entries(VEG_PRESENCE_LABELS).map(([k, v]) => (
              <option key={k} value={k}>{v}</option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="label">栄養メモ（任意）</label>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
          {[
            { name: "calorie", label: "kcal", val: recipe?.calorie },
            { name: "protein", label: "たんぱく質 g", val: recipe?.protein },
            { name: "fat", label: "脂質 g", val: recipe?.fat },
            { name: "carbs", label: "炭水化物 g", val: recipe?.carbs },
            { name: "fiber", label: "食物繊維 g", val: recipe?.fiber },
          ].map(({ name, label, val }) => (
            <div key={name}>
              <p className="text-xs text-gray-400 mb-1">{label}</p>
              <input name={name} type="number" step="0.1" min="0" defaultValue={val ?? ""} className="input text-sm" placeholder="—" />
            </div>
          ))}
        </div>
      </div>

      <div>
        <label className="label">タグ（カンマ区切り）</label>
        <input name="tags" defaultValue={recipe?.tags} className="input" placeholder="和食, 鶏肉, スピード, お弁当" />
      </div>

      <div className="space-y-3">
        <div>
          <label className="label">薫コメント</label>
          <textarea name="kaoriComment" defaultValue={recipe?.kaoriComment ?? ""} rows={2} className="input resize-none" placeholder="薫さんの感想..." />
        </div>
        <div>
          <label className="label">霞コメント</label>
          <textarea name="kasumiComment" defaultValue={recipe?.kasumiComment ?? ""} rows={2} className="input resize-none" placeholder="霞さんの感想..." />
        </div>
        <div>
          <label className="label">自分用メモ</label>
          <textarea name="personalMemo" defaultValue={recipe?.personalMemo ?? ""} rows={2} className="input resize-none" placeholder="次回こうしてみよう..." />
        </div>
      </div>

      <button
        type="submit"
        disabled={isPending || uploading}
        className="w-full btn-primary py-3 text-base font-semibold disabled:opacity-50"
      >
        {isPending ? "保存中..." : recipe ? "更新する" : "登録する"}
      </button>
    </form>
  );
}
