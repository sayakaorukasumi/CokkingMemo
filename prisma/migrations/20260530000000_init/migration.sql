-- CreateTable
CREATE TABLE "Recipe" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "photo" TEXT,
    "ingredients" TEXT NOT NULL DEFAULT '',
    "instructions" TEXT NOT NULL DEFAULT '',
    "cookingTime" INTEGER NOT NULL DEFAULT 30,
    "energyLevel" INTEGER NOT NULL DEFAULT 2,
    "dishwashing" INTEGER NOT NULL DEFAULT 2,
    "vegPresence" TEXT NOT NULL DEFAULT 'FINE',
    "calorie" DOUBLE PRECISION,
    "protein" DOUBLE PRECISION,
    "fat" DOUBLE PRECISION,
    "carbs" DOUBLE PRECISION,
    "fiber" DOUBLE PRECISION,
    "tags" TEXT NOT NULL DEFAULT '',
    "kaoriComment" TEXT,
    "kasumiComment" TEXT,
    "personalMemo" TEXT,
    "isFavorite" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Recipe_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CookingLog" (
    "id" SERIAL NOT NULL,
    "recipeId" INTEGER NOT NULL,
    "cookedAt" TIMESTAMP(3) NOT NULL,
    "wentWell" BOOLEAN NOT NULL DEFAULT true,
    "makeAgain" BOOLEAN NOT NULL DEFAULT true,
    "improvementNote" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CookingLog_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "CookingLog" ADD CONSTRAINT "CookingLog_recipeId_fkey" FOREIGN KEY ("recipeId") REFERENCES "Recipe"("id") ON DELETE CASCADE ON UPDATE CASCADE;
