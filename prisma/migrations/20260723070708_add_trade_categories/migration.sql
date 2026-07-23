-- AlterTable
ALTER TABLE "Trade" ADD COLUMN     "category" TEXT NOT NULL DEFAULT 'INTRADAY',
ADD COLUMN     "exitDate" TIMESTAMP(3),
ADD COLUMN     "expiryDate" TIMESTAMP(3),
ADD COLUMN     "notes" TEXT,
ADD COLUMN     "optionType" TEXT,
ADD COLUMN     "strike" DECIMAL(10,2);
