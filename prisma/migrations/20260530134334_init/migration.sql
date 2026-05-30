-- CreateTable
CREATE TABLE "Recipe" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "photo" TEXT,
    "ingredients" TEXT NOT NULL DEFAULT '',
    "instructions" TEXT NOT NULL DEFAULT '',
    "cookingTime" INTEGER NOT NULL DEFAULT 30,
    "energyLevel" INTEGER NOT NULL DEFAULT 2,
    "dishwashing" INTEGER NOT NULL DEFAULT 2,
    "vegPresence" TEXT NOT NULL DEFAULT 'FINE',
    "calorie" REAL,
    "protein" REAL,
    "fat" REAL,
    "carbs" REAL,
    "fiber" REAL,
    "tags" TEXT NOT NULL DEFAULT '',
    "kaoriComment" TEXT,
    "kasumiComment" TEXT,
    "personalMemo" TEXT,
    "isFavorite" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "CookingLog" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "recipeId" INTEGER NOT NULL,
    "cookedAt" DATETIME NOT NULL,
    "wentWell" BOOLEAN NOT NULL DEFAULT true,
    "makeAgain" BOOLEAN NOT NULL DEFAULT true,
    "improvementNote" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "CookingLog_recipeId_fkey" FOREIGN KEY ("recipeId") REFERENCES "Recipe" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
