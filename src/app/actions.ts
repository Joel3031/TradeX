"use server"

import { prisma } from "@/lib/db"
import { revalidatePath } from "next/cache"
import { auth } from "@/auth"
import bcrypt from "bcryptjs" // <--- CRITICAL IMPORT

// --- 1. USER REGISTRATION ACTION (Fixes your error) ---
export async function registerUser(data: any) {
    try {
        // Validate input
        if (!data.email || !data.password || !data.name) {
            return { success: false, error: "Missing required fields" }
        }

        // Check for existing user
        const existingUser = await prisma.user.findUnique({
            where: { email: data.email }
        })

        if (existingUser) {
            return { success: false, error: "Email already in use" }
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(data.password, 10)

        // Create User
        await prisma.user.create({
            data: {
                name: data.name,
                email: data.email,
                phoneNumber: data.phone, // Ensure 'phoneNumber' exists in your Prisma Schema!
                password: hashedPassword,
            }
        })

        return { success: true }

    } catch (error) {
        console.error("Registration Error:", error)
        return { success: false, error: "Failed to create account" }
    }
}

// --- 2. EXISTING TRADE ACTIONS ---

export async function createTrade(formData: any) {
    const session = await auth()

    if (!session || !session.user || !session.user.id) {
        throw new Error("Unauthorized: Please sign in")
    }

    const userId = session.user.id

    try {
        await prisma.trade.create({
            data: {
                userId: userId,
                symbol: formData.symbol.toUpperCase(),
                type: formData.type,
                entryPrice: formData.entryPrice,
                exitPrice: formData.exitPrice || null,
                quantity: parseInt(formData.quantity),
                stopLoss: formData.stopLoss,
                entryDate: new Date(formData.date),
                status: formData.exitPrice ? "CLOSED" : "OPEN",
                pnl: formData.exitPrice
                    ? (formData.type === "BUY"
                        ? (parseFloat(formData.exitPrice) - parseFloat(formData.entryPrice)) * parseInt(formData.quantity)
                        : (parseFloat(formData.entryPrice) - parseFloat(formData.exitPrice)) * parseInt(formData.quantity)
                    )
                    : null
            }
        })

        revalidatePath("/")
        return { success: true }

    } catch (error) {
        console.error("Failed to save trade:", error)
        return { success: false, error: "Failed to save to database" }
    }
}

export async function updateTrade(data: any) {
    const session = await auth()
    if (!session?.user) return { success: false, error: "Unauthorized" }

    try {
        // Validate that the trade belongs to the user before updating
        const existingTrade = await prisma.trade.findUnique({
            where: { id: data.id },
        })

        if (!existingTrade || existingTrade.userId !== session.user.id) {
            return { success: false, error: "Trade not found or unauthorized" }
        }

        await prisma.trade.update({
            where: { id: data.id },
            data: {
                symbol: data.symbol.toUpperCase(),
                type: data.type,
                entryPrice: parseFloat(data.entryPrice),
                exitPrice: data.exitPrice ? parseFloat(data.exitPrice) : null,
                quantity: parseInt(data.quantity),
                stopLoss: parseFloat(data.stopLoss),
                entryDate: new Date(data.date), // Ensure field name matches your DB (date vs entryDate)
                // Calculate PnL if exit price exists
                pnl: data.exitPrice
                    ? (data.type === "BUY"
                        ? (parseFloat(data.exitPrice) - parseFloat(data.entryPrice)) * parseInt(data.quantity)
                        : (parseFloat(data.entryPrice) - parseFloat(data.exitPrice)) * parseInt(data.quantity))
                    : null
            },
        })

        revalidatePath("/")
        return { success: true }
    } catch (error) {
        console.error("Update error:", error)
        return { success: false, error: "Failed to update trade" }
    }
}

// 2. DELETE ACTION
export async function deleteTrade(tradeId: string) {
    const session = await auth()
    if (!session?.user) return { success: false, error: "Unauthorized" }

    try {
        const existingTrade = await prisma.trade.findUnique({
            where: { id: tradeId },
        })

        if (!existingTrade || existingTrade.userId !== session.user.id) {
            return { success: false, error: "Trade not found or unauthorized" }
        }

        await prisma.trade.delete({
            where: { id: tradeId },
        })

        revalidatePath("/")
        return { success: true }
    } catch (error) {
        console.error("Delete error:", error)
        return { success: false, error: "Failed to delete trade" }
    }
}

// --- 3. MARKET DATA ACTION ---

export async function getMarketData() {
    const apiKey = process.env.TWELVE_DATA_API_KEY;

    if (!apiKey) {
        console.warn("⚠️ No API Key found. Using Mock Data.");
        return getMockData();
    }

    try {
        const url = `https://api.twelvedata.com/quote?symbol=NSEI,BSESN&apikey=${apiKey}`;
        const response = await fetch(url, { cache: 'no-store' });

        if (!response.ok) throw new Error("Network response was not ok");

        const data = await response.json();

        if (data.code === 404 || data.status === "error") {
            console.error("API Error:", data.message);
            throw new Error("Invalid Symbol or API Error");
        }

        return {
            nifty: {
                price: parseFloat(data.NSEI.close),
                change: parseFloat(data.NSEI.change),
                percent: parseFloat(data.NSEI.percent_change)
            },
            sensex: {
                price: parseFloat(data.BSESN.close),
                change: parseFloat(data.BSESN.change),
                percent: parseFloat(data.BSESN.percent_change)
            }
        };

    } catch (error) {
        console.error("❌ Market Data Error:", error);
        return getMockData();
    }
}

function getMockData() {
    return {
        nifty: { price: 21456.75, change: 124.50, percent: 0.58 },
        sensex: { price: 71345.80, change: -140.20, percent: -0.20 }
    };
}