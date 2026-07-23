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

export function calculateIntradayCharges(
    entryPrice: number,
    exitPrice: number,
    quantity: number,
    type: "BUY" | "SELL",
    executedOrders: number = 2 // Added to handle partial fills (e.g., 3 orders in contract note)
): TaxResult {
    const buyPrice = type === "BUY" ? entryPrice : exitPrice;
    const sellPrice = type === "BUY" ? exitPrice : entryPrice;

    const buyTurnover = buyPrice * quantity;
    const sellTurnover = sellPrice * quantity;
    const totalTurnover = buyTurnover + sellTurnover;

    // Fixed: Brokerage scales with actual executed orders to catch partial fill fees
    const avgOrderTurnover = totalTurnover / executedOrders;
    const totalBrokerageRaw = Math.min(20, avgOrderTurnover * 0.0003) * executedOrders;
    const totalBrokerage = parseFloat(totalBrokerageRaw.toFixed(2));

    // Fixed: STT is maintained to two decimals (40.10 in contract note), not integer-rounded
    const sttRaw = sellTurnover * 0.00025;
    const stt = parseFloat(sttRaw.toFixed(2));

    // Refined precision for exchange transaction fee
    const exchangeTxnRaw = totalTurnover * 0.00003071;
    const exchangeTxn = parseFloat(exchangeTxnRaw.toFixed(2));

    // Fixed: Stamp Duty was 0.000003 (0.0003%), corrected to 0.00003 (0.003%)
    const stampDutyRaw = buyTurnover * 0.00003;
    const stampDuty = Math.round(stampDutyRaw);

    const sebiFeesRaw = totalTurnover * 0.000001;
    const sebiFees = parseFloat(sebiFeesRaw.toFixed(2));

    const gstRaw = (totalBrokerage + exchangeTxn + sebiFees) * 0.18;
    const gst = parseFloat(gstRaw.toFixed(2));

    const totalChargesRaw = totalBrokerage + stt + exchangeTxn + stampDuty + sebiFees + gst;
    const totalCharges = parseFloat(totalChargesRaw.toFixed(2));

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