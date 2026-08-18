// src/lib/tax-calculator.ts

export interface Execution {
    price: number;
    quantity: number;
}

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
    entries: Execution[],
    exits: Execution[],
    type: "BUY" | "SELL"
): TaxResult {
    const buyLegs = type === "BUY" ? entries : exits;
    const sellLegs = type === "BUY" ? exits : entries;

    let buyTurnover = 0;
    let sellTurnover = 0;
    let totalBrokerageRaw = 0;

    // Calculate Turnover & Brokerage for Buy Legs
    for (const leg of buyLegs) {
        if (leg.price > 0 && leg.quantity > 0) {
            const turnover = leg.price * leg.quantity;
            buyTurnover += turnover;
            totalBrokerageRaw += Math.min(20, turnover * 0.0003); // Charge per execution
        }
    }

    // Calculate Turnover & Brokerage for Sell Legs
    for (const leg of sellLegs) {
        if (leg.price > 0 && leg.quantity > 0) {
            const turnover = leg.price * leg.quantity;
            sellTurnover += turnover;
            totalBrokerageRaw += Math.min(20, turnover * 0.0003); // Charge per execution
        }
    }

    const totalTurnover = buyTurnover + sellTurnover;
    const totalBrokerage = parseFloat(totalBrokerageRaw.toFixed(2));

    const sttRaw = sellTurnover * 0.00025;
    const stt = parseFloat(sttRaw.toFixed(2));

    const exchangeTxnRaw = totalTurnover * 0.00003071;
    const exchangeTxn = parseFloat(exchangeTxnRaw.toFixed(2));

    const stampDutyRaw = buyTurnover * 0.00003;
    const stampDuty = Math.round(stampDutyRaw);

    const sebiFeesRaw = totalTurnover * 0.000001;
    const sebiFees = parseFloat(sebiFeesRaw.toFixed(2));

    const gstRaw = (totalBrokerage + exchangeTxn + sebiFees) * 0.18;
    const gst = parseFloat(gstRaw.toFixed(2));

    const totalChargesRaw = totalBrokerage + stt + exchangeTxn + stampDuty + sebiFees + gst;
    const totalCharges = parseFloat(totalChargesRaw.toFixed(2));

    // Calculate PnL based on Average Prices
    const entryQty = entries.reduce((acc, e) => acc + (e.price > 0 ? e.quantity : 0), 0);
    const exitQty = exits.reduce((acc, e) => acc + (e.price > 0 ? e.quantity : 0), 0);
    const closedQty = Math.min(entryQty, exitQty);

    let grossPnl = 0;
    if (closedQty > 0) {
        const avgEntry = entries.reduce((acc, e) => acc + (e.price * e.quantity), 0) / entryQty;
        const avgExit = exits.reduce((acc, e) => acc + (e.price * e.quantity), 0) / exitQty;
        grossPnl = type === "BUY" ? (avgExit - avgEntry) * closedQty : (avgEntry - avgExit) * closedQty;
    }

    const netPnl = grossPnl - totalCharges;

    return {
        turnover: parseFloat(totalTurnover.toFixed(2)),
        grossPnl: parseFloat(grossPnl.toFixed(2)),
        brokerage: totalBrokerage,
        stt,
        exchangeTxn,
        stampDuty,
        sebiFees,
        gst,
        totalCharges,
        netPnl: parseFloat(netPnl.toFixed(2))
    };
}