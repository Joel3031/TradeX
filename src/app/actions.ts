"use server"

import crypto from "crypto"
import { auth } from "@/auth"
import bcrypt from "bcryptjs"
import { prisma } from "@/lib/db"
import { revalidatePath } from "next/cache"
import { sendOtpEmail } from "@/lib/email" // Import your email helper

// 1. REGISTER USER (Generate OTP & Send)
export async function registerUser(data: any) {
    try {
        if (!data.email || !data.password || !data.name) {
            return { success: false, error: "Missing required fields" }
        }

        const existingUser = await prisma.user.findUnique({
            where: { email: data.email }
        })

        // If user exists AND is verified, stop them.
        if (existingUser && existingUser.isVerified) {
            return { success: false, error: "Email already in use" }
        }

        // Generate 6-digit OTP
        const otp = crypto.randomInt(100000, 999999).toString();
        const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 mins expiry

        const hashedPassword = await bcrypt.hash(data.password, 10)

        // Upsert: If user exists (unverified), update them. If not, create new.
        if (existingUser && !existingUser.isVerified) {
            await prisma.user.update({
                where: { email: data.email },
                data: {
                    name: data.name,
                    password: hashedPassword,
                    phoneNumber: data.phone,
                    otp,
                    otpExpiry
                }
            })
        } else {
            await prisma.user.create({
                data: {
                    name: data.name,
                    email: data.email,
                    phoneNumber: data.phone,
                    password: hashedPassword,
                    otp,
                    otpExpiry,
                    isVerified: false
                }
            })
        }

        // Send Email (Non-blocking: don't await if you want faster UI)
        await sendOtpEmail(data.email, otp);

        return { success: true, message: "OTP sent to email" }

    } catch (error) {
        console.error("Registration Error:", error)
        return { success: false, error: "Failed to create account" }
    }
}

// 2. VERIFY OTP ACTION
export async function verifyOtp(email: string, otp: string) {
    try {
        const user = await prisma.user.findUnique({
            where: { email }
        })

        if (!user) {
            return { success: false, error: "User not found" }
        }

        if (user.otp !== otp) {
            return { success: false, error: "Invalid OTP" }
        }

        if (!user.otpExpiry || new Date() > user.otpExpiry) {
            return { success: false, error: "OTP Expired" }
        }

        // Verify User
        await prisma.user.update({
            where: { email },
            data: {
                isVerified: true,
                otp: null, // Clear OTP
                otpExpiry: null
            }
        })

        return { success: true }

    } catch (error) {
        return { success: false, error: "Verification failed" }
    }
}

// --- 2. TRADE ACTIONS ---

export async function createTrade(formData: any) {
    const session = await auth()

    if (!session?.user?.id) {
        return { success: false, error: "Unauthorized: No User ID found" }
    }

    const userId = session.user.id

    try {
        const stopLossValue = formData.stopLoss && formData.stopLoss.toString().trim() !== ""
            ? parseFloat(formData.stopLoss)
            : 0;

        const entryPriceValue = parseFloat(formData.entryPrice);
        const exitPriceValue = parseFloat(formData.exitPrice);
        const quantityValue = parseInt(formData.quantity);

        // Capture Fees and Net PnL passed from the form
        const feesValue = formData.fees ? parseFloat(formData.fees) : 0;
        // Default Net PnL to 0 if not provided
        let netPnlValue = formData.netPnl ? parseFloat(formData.netPnl) : 0;

        // Calculate Gross PnL (Logic retained for safety)
        let pnl = null;
        if (formData.exitPrice) {
            if (formData.type === "BUY") {
                pnl = (exitPriceValue - entryPriceValue) * quantityValue;
            } else {
                pnl = (entryPriceValue - exitPriceValue) * quantityValue;
            }

            // Fallback: If form didn't send Net PnL, calculate it here
            if (!formData.netPnl && pnl !== null) {
                netPnlValue = pnl - feesValue;
            }
        }

        await prisma.trade.create({
            data: {
                userId: userId,
                symbol: formData.symbol.toUpperCase(),
                type: formData.type,
                entryPrice: entryPriceValue,
                exitPrice: exitPriceValue,
                quantity: quantityValue,
                stopLoss: stopLossValue,
                entryDate: new Date(formData.date),
                pnl: pnl,        // Gross P&L
                fees: feesValue, // Tax & Charges
                netPnl: netPnlValue, // Final Profit
                status: "CLOSED"
            },
        })

        revalidatePath("/")
        return { success: true }
    } catch (error) {
        console.error("Create error:", error)
        return { success: false, error: "Failed to create trade" }
    }
}

export async function updateTrade(data: any) {
    const session = await auth()

    if (!session?.user?.id) {
        return { success: false, error: "Unauthorized" }
    }

    try {
        const existingTrade = await prisma.trade.findUnique({
            where: { id: data.id },
        })

        if (!existingTrade || existingTrade.userId !== session.user.id) {
            return { success: false, error: "Trade not found or unauthorized" }
        }

        const stopLossValue = data.stopLoss && data.stopLoss.toString().trim() !== ""
            ? parseFloat(data.stopLoss)
            : 0;

        const entryPriceValue = parseFloat(data.entryPrice);
        const exitPriceValue = parseFloat(data.exitPrice);
        const quantityValue = parseInt(data.quantity);

        // Capture Fees and Net PnL
        const feesValue = data.fees ? parseFloat(data.fees) : 0;
        let netPnlValue = data.netPnl ? parseFloat(data.netPnl) : 0;

        let pnl = null;
        if (data.exitPrice) {
            if (data.type === "BUY") {
                pnl = (exitPriceValue - entryPriceValue) * quantityValue;
            } else {
                pnl = (entryPriceValue - exitPriceValue) * quantityValue;
            }

            if (!data.netPnl && pnl !== null) {
                netPnlValue = pnl - feesValue;
            }
        }

        await prisma.trade.update({
            where: { id: data.id },
            data: {
                symbol: data.symbol.toUpperCase(),
                type: data.type,
                entryPrice: entryPriceValue,
                exitPrice: exitPriceValue,
                quantity: quantityValue,
                stopLoss: stopLossValue,
                entryDate: new Date(data.date),
                pnl: pnl,
                fees: feesValue,
                netPnl: netPnlValue
            },
        })

        revalidatePath("/")
        return { success: true }
    } catch (error) {
        console.error("Update error:", error)
        return { success: false, error: "Failed to update trade" }
    }
}

export async function importTrades(tradesData: any[]) {
    const session = await auth()

    if (!session?.user?.id) {
        return { success: false, error: "Unauthorized" }
    }

    const userId = session.user.id

    try {
        const formattedTrades = tradesData.map((t) => {
            const entryPrice = parseFloat(t.entryPrice)
            const exitPrice = t.exitPrice ? parseFloat(t.exitPrice) : null
            const quantity = parseInt(t.quantity)
            const type = t.type.toUpperCase()

            // Capture calculated values from client
            const fees = t.fees ? parseFloat(t.fees) : 0
            const netPnl = t.netPnl ? parseFloat(t.netPnl) : 0

            // Gross PnL fallback (if not provided, though your tax calc handles it)
            let pnl = null
            if (exitPrice) {
                pnl = type === "BUY"
                    ? (exitPrice - entryPrice) * quantity
                    : (entryPrice - exitPrice) * quantity
            }

            return {
                userId: userId,
                symbol: t.symbol.toUpperCase(),
                type: type,
                entryPrice: entryPrice,
                exitPrice: exitPrice,
                quantity: quantity,
                stopLoss: t.stopLoss ? parseFloat(t.stopLoss) : 0,
                entryDate: new Date(t.date),
                pnl: pnl,         // Gross PnL
                fees: fees,       // Tax
                netPnl: netPnl,   // Net PnL
                status: exitPrice ? "CLOSED" : "OPEN"
            }
        })

        await prisma.trade.createMany({
            data: formattedTrades
        })

        revalidatePath("/")
        return { success: true, count: formattedTrades.length }

    } catch (error) {
        console.error("Import error:", error)
        return { success: false, error: "Failed to import trades. Check file format." }
    }
}

export async function deleteTrade(tradeId: string) {
    const session = await auth()
    // FIX 1: Strict check
    if (!session?.user?.id) {
        return { success: false, error: "Unauthorized" }
    }

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

export async function updateUserPreference(key: string, value: boolean) {
    const session = await auth()
    if (!session?.user?.id) return { success: false, error: "Unauthorized" }

    try {
        await prisma.user.update({
            where: { id: session.user.id },
            data: { [key]: value }
        })
        revalidatePath("/") // Refresh data
        return { success: true }
    } catch (error) {
        return { success: false, error: "Failed to update settings" }
    }
}

function getMockData() {
    return {
        nifty: { price: 21456.75, change: 124.50, percent: 0.58 },
        sensex: { price: 71345.80, change: -140.20, percent: -0.20 }
    };
}