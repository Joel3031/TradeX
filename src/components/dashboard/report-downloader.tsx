"use client"

import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Download, FileSpreadsheet, FileText } from "lucide-react"
import { format } from "date-fns"
import * as XLSX from "xlsx"
import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"

interface ReportDownloaderProps {
    trades: any[]
}

export function ReportDownloader({ trades }: ReportDownloaderProps) {

    // --- 1. EXCEL EXPORT ---
    const downloadExcel = () => {
        // Format data for Excel
        const data = trades.map(t => ({
            Date: format(new Date(t.entryDate), "yyyy-MM-dd"),
            Symbol: t.symbol,
            Type: t.type,
            Status: t.status,
            "Entry Price": t.entryPrice,
            "Exit Price": t.exitPrice || "-",
            Quantity: t.quantity,
            "P/L": t.pnl ? `₹${t.pnl}` : "-",
            Result: t.pnl > 0 ? "WIN" : t.pnl < 0 ? "LOSS" : "BREAKEVEN"
        }))

        const worksheet = XLSX.utils.json_to_sheet(data)
        const workbook = XLSX.utils.book_new()
        XLSX.utils.book_append_sheet(workbook, worksheet, "Trade Journal")

        // Auto-width columns
        const max_width = data.reduce((w, r) => Math.max(w, r.Symbol.length), 10)
        worksheet["!cols"] = [{ wch: 12 }, { wch: max_width }, { wch: 8 }, { wch: 10 }]

        XLSX.writeFile(workbook, `TradeX_Report_${format(new Date(), "yyyy-MM-dd")}.xlsx`)
    }

    // --- 2. PDF EXPORT ---
    const downloadPDF = () => {
        const doc = new jsPDF()

        // Title
        doc.setFontSize(18)
        doc.text("TradeX - P/L Statement", 14, 22)
        doc.setFontSize(11)
        doc.setTextColor(100)
        doc.text(`Generated on: ${format(new Date(), "MMM dd, yyyy")}`, 14, 30)

        // Table Data
        const tableData = trades.map(t => [
            format(new Date(t.entryDate), "MMM dd"),
            t.symbol,
            t.type,
            t.quantity,
            t.entryPrice,
            t.exitPrice || "-",
            t.pnl ? `${t.pnl}` : "-" // Removed currency symbol for cleaner PDF alignment
        ])

        // Generate Table
        autoTable(doc, {
            head: [["Date", "Symbol", "Type", "Qty", "Entry", "Exit", "P/L"]],
            body: tableData,
            startY: 40,
            theme: 'grid',
            styles: { fontSize: 9, cellPadding: 3 },
            headStyles: { fillColor: [22, 163, 74] }, // Green header to match app theme
            // Highlight winning/losing rows
            didParseCell: (data) => {
                if (data.section === 'body' && data.column.index === 6) {
                    const pnl = parseFloat(data.cell.raw as string)
                    if (pnl > 0) data.cell.styles.textColor = [22, 163, 74] // Green
                    if (pnl < 0) data.cell.styles.textColor = [220, 38, 38] // Red
                }
            }
        })

        // Total PnL Footer
        const totalPnl = trades.reduce((sum, t) => sum + (Number(t.pnl) || 0), 0)
        const finalY = (doc as any).lastAutoTable.finalY + 10

        doc.setFontSize(12)
        doc.setTextColor(0)
        doc.text(`Total Net P/L: ${totalPnl.toFixed(2)}`, 14, finalY)

        doc.save(`TradeX_Statement_${format(new Date(), "yyyy-MM-dd")}.pdf`)
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="h-8 gap-2 border-dashed">
                    <Download className="h-3.5 w-3.5" />
                    <span>Export</span>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
                <DropdownMenuItem onClick={downloadExcel} className="cursor-pointer">
                    <FileSpreadsheet className="mr-2 h-4 w-4 text-green-600" />
                    <span>Excel</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={downloadPDF} className="cursor-pointer">
                    <FileText className="mr-2 h-4 w-4 text-red-500" />
                    <span>PDF</span>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}