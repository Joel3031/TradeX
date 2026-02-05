// src/lib/tax-calculator.ts

export interface TaxResult {
    turnover: number;
    grossPnl: number;
    brokerage: number;
    stt: number;
    exchangeTxn: number;
    stampDuty: number;
    sebiFees: number;
    gst: number;
    totalCharges: number;
    netPnl: number;
}

/**
 * Calculates taxes and charges for Equity Intraday (Zerodha/NSE rates).
 * Automatically handles Buy vs Short Sell logic.
 */
export function calculateIntradayCharges(
    entryPrice: number,
    exitPrice: number,
    quantity: number,
    type: "BUY" | "SELL"
): TaxResult {

    // 1. Identify Buy/Sell legs based on Trade Type
    // If Long (BUY): Entry is Buy, Exit is Sell
    // If Short (SELL): Entry is Sell, Exit is Buy
    const buyPrice = type === "BUY" ? entryPrice : exitPrice;
    const sellPrice = type === "BUY" ? exitPrice : entryPrice;

    // 2. Turnover Calculation
    const buyTurnover = buyPrice * quantity;
    const sellTurnover = sellPrice * quantity;
    const totalTurnover = buyTurnover + sellTurnover;

    // 3. Brokerage (0.03% or ₹20 per side, whichever is lower)
    const buyBrokerage = Math.min(20, buyTurnover * 0.0003);
    const sellBrokerage = Math.min(20, sellTurnover * 0.0003);
    const totalBrokerage = buyBrokerage + sellBrokerage;

    // 4. STT (0.025% on Sell Side ONLY for Intraday)
    const stt = sellTurnover * 0.00025;

    // 5. Exchange Txn Charges (NSE: 0.00297%)
    const exchangeTxn = totalTurnover * 0.0000297;

    // 6. Stamp Duty (0.003% on Buy Side ONLY)
    const stampDuty = buyTurnover * 0.000003;

    // 7. SEBI Charges (₹10 per Crore)
    const sebiFees = totalTurnover * 0.000001;

    // 8. GST (18% on Brokerage + Txn + SEBI)
    const gst = (totalBrokerage + exchangeTxn + sebiFees) * 0.18;

    // 9. Final Totals
    const totalCharges = totalBrokerage + stt + exchangeTxn + stampDuty + sebiFees + gst;

    // Gross PnL: (Sell - Buy) * Qty
    const grossPnl = (sellPrice - buyPrice) * quantity;
    const netPnl = grossPnl - totalCharges;

    return {
        turnover: parseFloat(totalTurnover.toFixed(2)),
        grossPnl: parseFloat(grossPnl.toFixed(2)),
        brokerage: parseFloat(totalBrokerage.toFixed(2)),
        stt: parseFloat(stt.toFixed(2)),
        exchangeTxn: parseFloat(exchangeTxn.toFixed(2)),
        stampDuty: parseFloat(stampDuty.toFixed(2)),
        sebiFees: parseFloat(sebiFees.toFixed(2)),
        gst: parseFloat(gst.toFixed(2)),
        totalCharges: parseFloat(totalCharges.toFixed(2)),
        netPnl: parseFloat(netPnl.toFixed(2))
    };
}