export interface Recipe {
  id: number;
  name: string;
  photo: string;
  ingredients: string;
  instructions: string;
  cookingTime: number;
  energyLevel: number;
  dishwashing: number;
  vegPresence: string;
  calorie: number | null;
  protein: number | null;
  fat: number | null;
  carbs: number | null;
  fiber: number | null;
  tags: string;
  kaoriComment: string;
  kasumiComment: string;
  personalMemo: string;
  isFavorite: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CookingLog {
  id: number;
  recipeId: number;
  cookedAt: string;
  wentWell: boolean;
  makeAgain: boolean;
  improvementNote: string;
  createdAt: string;
}

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
