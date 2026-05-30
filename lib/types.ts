import type { Recipe, CookingLog } from "@/app/generated/prisma/client";
export type { Recipe, CookingLog };

export type RecipeWithLogs = Recipe & { cookingLogs: CookingLog[] };

export const VEG_PRESENCE_LABELS: Record<string, string> = {
  HIDDEN: "見えない",
  BARELY: "ほぼ見えない",
  SOFT: "やわらかい",
  FINE: "細かい",
  CRUNCHY: "シャキシャキ注意",
};

export const ENERGY_LEVEL_LABELS: Record<number, string> = {
  1: "ぐったり",
  2: "ふつう",
  3: "まあまあ元気",
  4: "元気！",
};

export const DISHWASHING_LABELS: Record<number, string> = {
  1: "多い",
  2: "やや多い",
  3: "少ない",
  4: "ほぼなし",
};
