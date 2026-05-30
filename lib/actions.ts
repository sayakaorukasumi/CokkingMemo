"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";

export async function createRecipe(formData: FormData) {
  const name = formData.get("name") as string;
  if (!name?.trim()) throw new Error("料理名は必須です");

  const recipe = await prisma.recipe.create({
    data: {
      name: name.trim(),
      photo: (formData.get("photo") as string) || null,
      ingredients: (formData.get("ingredients") as string) || "",
      instructions: (formData.get("instructions") as string) || "",
      cookingTime: parseInt((formData.get("cookingTime") as string) || "30"),
      energyLevel: parseInt((formData.get("energyLevel") as string) || "2"),
      dishwashing: parseInt((formData.get("dishwashing") as string) || "2"),
      vegPresence: (formData.get("vegPresence") as string) || "FINE",
      calorie: parseFloatOrNull(formData.get("calorie") as string),
      protein: parseFloatOrNull(formData.get("protein") as string),
      fat: parseFloatOrNull(formData.get("fat") as string),
      carbs: parseFloatOrNull(formData.get("carbs") as string),
      fiber: parseFloatOrNull(formData.get("fiber") as string),
      tags: (formData.get("tags") as string) || "",
      kaoriComment: (formData.get("kaoriComment") as string) || null,
      kasumiComment: (formData.get("kasumiComment") as string) || null,
      personalMemo: (formData.get("personalMemo") as string) || null,
    },
  });

  revalidatePath("/");
  revalidatePath("/recipes");
  redirect(`/recipes/${recipe.id}`);
}

export async function updateRecipe(id: number, formData: FormData) {
  const name = formData.get("name") as string;
  if (!name?.trim()) throw new Error("料理名は必須です");

  await prisma.recipe.update({
    where: { id },
    data: {
      name: name.trim(),
      photo: (formData.get("photo") as string) || null,
      ingredients: (formData.get("ingredients") as string) || "",
      instructions: (formData.get("instructions") as string) || "",
      cookingTime: parseInt((formData.get("cookingTime") as string) || "30"),
      energyLevel: parseInt((formData.get("energyLevel") as string) || "2"),
      dishwashing: parseInt((formData.get("dishwashing") as string) || "2"),
      vegPresence: (formData.get("vegPresence") as string) || "FINE",
      calorie: parseFloatOrNull(formData.get("calorie") as string),
      protein: parseFloatOrNull(formData.get("protein") as string),
      fat: parseFloatOrNull(formData.get("fat") as string),
      carbs: parseFloatOrNull(formData.get("carbs") as string),
      fiber: parseFloatOrNull(formData.get("fiber") as string),
      tags: (formData.get("tags") as string) || "",
      kaoriComment: (formData.get("kaoriComment") as string) || null,
      kasumiComment: (formData.get("kasumiComment") as string) || null,
      personalMemo: (formData.get("personalMemo") as string) || null,
    },
  });

  revalidatePath(`/recipes/${id}`);
  revalidatePath("/recipes");
  revalidatePath("/");
  redirect(`/recipes/${id}`);
}

export async function deleteRecipe(id: number) {
  await prisma.recipe.delete({ where: { id } });
  revalidatePath("/recipes");
  revalidatePath("/");
  redirect("/recipes");
}

export async function toggleFavorite(id: number, current: boolean) {
  await prisma.recipe.update({
    where: { id },
    data: { isFavorite: !current },
  });
  revalidatePath(`/recipes/${id}`);
  revalidatePath("/recipes");
}

export async function addCookingLog(recipeId: number, formData: FormData) {
  await prisma.cookingLog.create({
    data: {
      recipeId,
      cookedAt: new Date(formData.get("cookedAt") as string),
      wentWell: formData.get("wentWell") === "true",
      makeAgain: formData.get("makeAgain") === "true",
      improvementNote: (formData.get("improvementNote") as string) || null,
    },
  });
  revalidatePath(`/recipes/${recipeId}`);
}

export async function deleteCookingLog(logId: number, recipeId: number) {
  await prisma.cookingLog.delete({ where: { id: logId } });
  revalidatePath(`/recipes/${recipeId}`);
}

function parseFloatOrNull(value: string | null): number | null {
  if (!value || value.trim() === "") return null;
  const n = parseFloat(value);
  return isNaN(n) ? null : n;
}
