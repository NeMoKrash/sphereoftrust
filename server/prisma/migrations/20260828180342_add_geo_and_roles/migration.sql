/*
  Warnings:

  - Added the required column `city` to the `Admin` table without a default value. This is not possible if the table is not empty.
  - Added the required column `region` to the `Admin` table without a default value. This is not possible if the table is not empty.
  - Added the required column `school` to the `Admin` table without a default value. This is not possible if the table is not empty.
  - Added the required column `gradeLetter` to the `Submission` table without a default value. This is not possible if the table is not empty.
  - Added the required column `region` to the `Submission` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Question" ADD COLUMN "textKz" TEXT;

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Admin" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "username" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "region" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "school" TEXT NOT NULL
);
INSERT INTO "new_Admin" ("id", "passwordHash", "username") SELECT "id", "passwordHash", "username" FROM "Admin";
DROP TABLE "Admin";
ALTER TABLE "new_Admin" RENAME TO "Admin";
CREATE UNIQUE INDEX "Admin_username_key" ON "Admin"("username");
CREATE TABLE "new_Submission" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "region" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "school" TEXT NOT NULL,
    "grade" INTEGER NOT NULL,
    "gradeLetter" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_Submission" ("city", "createdAt", "grade", "id", "school") SELECT "city", "createdAt", "grade", "id", "school" FROM "Submission";
DROP TABLE "Submission";
ALTER TABLE "new_Submission" RENAME TO "Submission";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
