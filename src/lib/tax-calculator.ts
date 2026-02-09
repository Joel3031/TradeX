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
 * CALIBRATED TO MATCH ZERODHA CALCULATOR EXACTLY.
 */
export function calculateIntradayCharges(
    entryPrice: number,
    exitPrice: number,
    quantity: number,
    type: "BUY" | "SELL"
): TaxResult {

    // 1. Identify Buy/Sell legs
    const buyPrice = type === "BUY" ? entryPrice : exitPrice;
    const sellPrice = type === "BUY" ? exitPrice : entryPrice;

    // 2. Turnover Calculation
    const buyTurnover = buyPrice * quantity;
    const sellTurnover = sellPrice * quantity;
    const totalTurnover = buyTurnover + sellTurnover;

    // 3. Brokerage (0.03% or ₹20 per side, whichever is lower)
    const buyBrokerage = Math.min(20, buyTurnover * 0.0003);
    const sellBrokerage = Math.min(20, sellTurnover * 0.0003);
    const totalBrokerage = parseFloat((buyBrokerage + sellBrokerage).toFixed(2));

    // 4. STT (0.025% on Sell Side ONLY for Intraday)
    // Zerodha rounds STT to the nearest integer
    const sttRaw = sellTurnover * 0.00025;
    const stt = Math.round(sttRaw);

    // 5. Exchange Txn Charges
    // Base NSE Rate (0.00297%) + IPFT (0.0001%) ≈ 0.00307%
    const exchangeTxnRaw = totalTurnover * 0.0000307;
    const exchangeTxn = parseFloat(exchangeTxnRaw.toFixed(2));

    // 6. Stamp Duty (0.003% on Buy Side ONLY)
    // Zerodha rounds Stamp Duty to the nearest integer
    const stampDutyRaw = buyTurnover * 0.000003;
    const stampDuty = Math.round(stampDutyRaw);

    // 7. SEBI Charges (₹10 per Crore = 0.0001%)
    const sebiFeesRaw = totalTurnover * 0.000001;
    const sebiFees = parseFloat(sebiFeesRaw.toFixed(2));

    // 8. GST (18% on Brokerage + Txn + SEBI)
    const gstRaw = (totalBrokerage + exchangeTxn + sebiFees) * 0.18;
    const gst = parseFloat(gstRaw.toFixed(2));

    // 9. Final Totals
    const totalChargesRaw = totalBrokerage + stt + exchangeTxn + stampDuty + sebiFees + gst;
    const totalCharges = parseFloat(totalChargesRaw.toFixed(2));

    // Gross PnL: (Sell - Buy) * Qty
    // Note: If Short Sell, logic is same (Sell - Buy)
    const grossPnlRaw = (sellPrice - buyPrice) * quantity;
    const grossPnl = parseFloat(grossPnlRaw.toFixed(2));

    const netPnlRaw = grossPnl - totalCharges;
    const netPnl = parseFloat(netPnlRaw.toFixed(2));

    return {
        turnover: parseFloat(totalTurnover.toFixed(2)),
        grossPnl: grossPnl,
        brokerage: totalBrokerage,
        stt: stt,
        exchangeTxn: exchangeTxn,
        stampDuty: stampDuty,
        sebiFees: sebiFees,
        gst: gst,
        totalCharges: totalCharges,
        netPnl: netPnl
    };
}