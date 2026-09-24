"use server"

import OpenAI from "openai";
import { prisma } from "@/lib/db";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function logTradeWithAI(tradeData: {
  userId: string;
  symbol: string;
  type: string;        // e.g. "BUY" or "SELL"
  entryPrice: number;  // e.g. 150.50
  quantity: number;    // e.g. 10
  entryDate: Date;     // e.g. new Date()
  status: string;      // e.g. "OPEN" or "CLOSED"
  category?: string;   // Optional (defaults to "INTRADAY")
  notes?: string;      // Optional trade notes
}) {
  try {
    // 1. Construct the text to send to OpenAI (fallback to empty string if notes are missing)
    const textToEmbed = `Trade on ${tradeData.symbol} (${tradeData.type}). Notes: ${tradeData.notes || "No notes provided"}`;

    // 2. Request the embedding vector from OpenAI
    const aiResponse = await openai.embeddings.create({
      model: "text-embedding-3-small",
      input: textToEmbed,
    });

    const embeddingArray = aiResponse.data[0].embedding;

    // 3. Save the trade using your Prisma client instance
    const newTrade = await prisma.trade.create({
      data: {
        userId: tradeData.userId,
        symbol: tradeData.symbol,
        type: tradeData.type,
        entryPrice: tradeData.entryPrice,
        quantity: tradeData.quantity,
        entryDate: tradeData.entryDate,
        status: tradeData.status,
        category: tradeData.category || "INTRADAY",
        notes: tradeData.notes,
      },
    });

    // 4. Attach the vector array using raw SQL casting for pgvector
    await prisma.$executeRaw`
      UPDATE "Trade"
      SET embedding = ${embeddingArray}::vector
      WHERE id = ${newTrade.id}
    `;

    return { success: true, tradeId: newTrade.id };
  } catch (error) {
    console.error("Failed to log trade with AI:", error);
    return { success: false, error: "Failed to save trade and generate embedding" };
  }
}