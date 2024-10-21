/*
  Warnings:

  - Made the column `percentage` on table `SimulationTestDetail` required. This step will fail if there are existing NULL values in that column.
  - Made the column `percentage` on table `UserTestDetail` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "SimulationTestDetail" ALTER COLUMN "percentage" SET NOT NULL,
ALTER COLUMN "percentage" SET DEFAULT 0;

-- AlterTable
ALTER TABLE "UserTestDetail" ALTER COLUMN "percentage" SET NOT NULL,
ALTER COLUMN "percentage" SET DEFAULT 0;
