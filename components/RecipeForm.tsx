"use client";

import { useState } from "react";
import { Upload, X } from "lucide-react";
import { createRecipe, updateRecipe } from "@/lib/storage";
import { VEG_PRESENCE_LABELS, ENERGY_LEVEL_LABELS, DISHWASHING_LABELS } from "@/lib/types";
import type { Recipe } from "@/lib/types";

type Props = { recipe?: Recipe; onSuccess: (id: number) => void };

// localStorage は容量が小さいので、1枚あたり約 250KB 以下を目標に
// 解像度と画質を段階的に下げながら圧縮する。
const TARGET_BYTES = 250_000;

function compressImage(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new window.Image();
    const reader = new FileReader();
    reader.onload = (e) => {
      img.onload = () => {
        // 試す解像度と画質の組み合わせ（大きい→小さい）
        const attempts: { max: number; quality: number }[] = [
          { max: 720, quality: 0.6 },
          { max: 600, quality: 0.55 },
          { max: 480, quality: 0.5 },
          { max: 360, quality: 0.45 },
        ];

        let result = "";
        for (const { max, quality } of attempts) {
          const ratio = Math.min(max / img.width, max / img.height, 1);
          const canvas = document.createElement("canvas");
          canvas.width = Math.round(img.width * ratio);
          canvas.height = Math.round(img.height * ratio);
          const ctx = canvas.getContext("2d");
          if (!ctx) {
            reject(new Error("IMAGE_DECODE"));
            return;
          }
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          result = canvas.toDataURL("image/jpeg", quality);
          // dataURL の長さからおおよそのバイト数を見積もる
          const approxBytes = Math.ceil((result.length - "data:image/jpeg;base64,".length) * 0.75);
          if (approxBytes <= TARGET_BYTES) break;
        }
        resolve(result);
      };
      img.onerror = () => reject(new Error("IMAGE_DECODE"));
      img.src = e.target!.result as string;
    };
    reader.onerror = () => reject(new Error("IMAGE_DECODE"));
    reader.readAsDataURL(file);
  });
}

export default function RecipeForm({ recipe, onSuccess }: Props) {
  const [photo, setPhoto] = useState<string>(recipe?.photo || "");
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setSaveError(null);
    try {
      const compressed = await compressImage(file);
      setPhoto(compressed);
    } catch {
      setSaveError("写真を読み込めませんでした。別の写真で試してみてください。");
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    setSaveError(null);
    try {
      const fd = new FormData(e.currentTarget);
      const data = {
        name: fd.get("name") as string,
        photo,
        ingredients: (fd.get("ingredients") as string) || "",
        instructions: (fd.get("instructions") as string) || "",
        cookingTime: parseInt(fd.get("cookingTime") as string) || 30,
        energyLevel: parseInt(fd.get("energyLevel") as string) || 2,
        dishwashing: parseInt(fd.get("dishwashing") as string) || 2,
        vegPresence: (fd.get("vegPresence") as string) || "FINE",
        calorie: fd.get("calorie") ? parseFloat(fd.get("calorie") as string) : null,
        protein: fd.get("protein") ? parseFloat(fd.get("protein") as string) : null,
        fat: fd.get("fat") ? parseFloat(fd.get("fat") as string) : null,
        carbs: fd.get("carbs") ? parseFloat(fd.get("carbs") as string) : null,
        fiber: fd.get("fiber") ? parseFloat(fd.get("fiber") as string) : null,
        tags: (fd.get("tags") as string) || "",
        kaoriComment: (fd.get("kaoriComment") as string) || "",
        kasumiComment: (fd.get("kasumiComment") as string) || "",
        personalMemo: (fd.get("personalMemo") as string) || "",
        isFavorite: recipe?.isFavorite ?? false,
      };

      if (recipe) {
        updateRecipe(recipe.id, data);
        onSuccess(recipe.id);
      } else {
        const created = createRecipe(data);
        onSuccess(created.id);
      }
    } catch (err) {
      console.error(err);
      const msg = err instanceof Error ? err.message : "";
      if (msg.startsWith("QUOTA")) {
        const kb = msg.split(":")[1] ?? "?";
        setSaveError(`保存できませんでした（データ量 ${kb}KB）。Safariの設定でこのサイトのデータが制限されている可能性があります。写真なしなら保存できるか試してみてください。`);
      } else if (msg === "STORAGE_UNAVAILABLE") {
        setSaveError("保存できませんでした。Safariのプライベートブラウジングをオフにして、もう一度試してください。");
      } else {
        setSaveError("保存に失敗しました。もう一度試してみてください。");
      }
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl mx-auto">
      {/* 写真 */}
      <div>
        <label className="label">写真</label>
        <div className="relative w-full aspect-[4/3] bg-pink-50 rounded-2xl border-2 border-dashed border-pink-200 overflow-hidden">
          {photo ? (
            <>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={photo} alt="料理写真" className="w-full h-full object-contain" />
              <button
                type="button"
                className="absolute top-2 right-2 bg-white/80 rounded-full p-1"
                onClick={() => setPhoto("")}
              >
                <X size={16} />
              </button>
            </>
          ) : (
            <label
              htmlFor="photo-file-input"
              className="flex flex-col items-center justify-center gap-2 text-pink-300 w-full h-full cursor-pointer"
            >
              <Upload size={32} />
              <span className="text-sm">写真を追加</span>
            </label>
          )}
        </div>
        <input id="photo-file-input" type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
      </div>

      {/* 料理名 */}
      <div>
        <label className="label">料理名 <span className="text-pink-400">*</span></label>
        <input name="name" defaultValue={recipe?.name} required className="input" placeholder="例：鶏むね肉の照り焼き" />
      </div>

      {/* 材料・作り方 */}
      <div>
        <label className="label">材料</label>
        <textarea name="ingredients" defaultValue={recipe?.ingredients} rows={4} className="input resize-none" placeholder={"鶏むね肉 200g\nしょうゆ 大さじ2\n..."} />
      </div>
      <div>
        <label className="label">作り方</label>
        <textarea name="instructions" defaultValue={recipe?.instructions} rows={5} className="input resize-none" placeholder={"1. 鶏肉を一口大に切る\n2. ..."} />
      </div>

      {/* 基本情報 */}
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

      {/* 栄養メモ */}
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

      {/* タグ */}
      <div>
        <label className="label">タグ（カンマ区切り）</label>
        <input name="tags" defaultValue={recipe?.tags} className="input" placeholder="和食, 鶏肉, スピード, お弁当" />
      </div>

      {/* コメント */}
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

      {saveError && (
        <div style={{ background: "#fff0f3", border: "1px solid #fca5a5", borderRadius: "0.75rem", padding: "0.75rem 1rem", color: "#dc2626", fontSize: "0.875rem" }}>
          {saveError}
        </div>
      )}

      <button
        type="submit"
        disabled={saving}
        className="w-full btn-primary py-3 text-base font-semibold disabled:opacity-50"
      >
        {saving ? "保存中..." : recipe ? "更新する" : "登録する"}
      </button>
    </form>
  );
}
