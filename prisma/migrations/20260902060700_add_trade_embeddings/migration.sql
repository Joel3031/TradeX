-- AlterTable
CREATE EXTENSION IF NOT EXISTS vector;
ALTER TABLE "Trade" ADD COLUMN     "embedding" vector(1536);
