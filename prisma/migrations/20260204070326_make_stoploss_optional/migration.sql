/*
  Warnings:

  - You are about to alter the column `stopLoss` on the `Trade` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `Decimal(10,2)`.

*/
-- AlterTable
ALTER TABLE "Trade" ALTER COLUMN "stopLoss" DROP NOT NULL,
ALTER COLUMN "stopLoss" SET DATA TYPE DECIMAL(10,2);
