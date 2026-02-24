"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Download, Loader2, CalendarIcon, FileText, Table } from "lucide-react"
import { toast } from "sonner"
import { format, parseISO, isWithinInterval, startOfDay, endOfDay, startOfMonth } from "date-fns"
import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface ReportDownloaderProps {
    trades: any[]
    userName?: string | null  // Added Prop
    userEmail?: string | null // Added Prop
}

export function ReportDownloader({ trades, userName, userEmail }: ReportDownloaderProps) {
    const [isDownloading, setIsDownloading] = useState(false)
    const [open, setOpen] = useState(false)

    // Default: 1st of current month to Today
    const [startDate, setStartDate] = useState<string>(format(startOfMonth(new Date()), "yyyy-MM-dd"))
    const [endDate, setEndDate] = useState<string>(format(new Date(), "yyyy-MM-dd"))

    // Helper: Convert Image to Base64 for PDF
    const getBase64ImageFromURL = (url: string): Promise<string> => {
        return new Promise((resolve, reject) => {
            const img = new Image()
            img.setAttribute("crossOrigin", "anonymous")
            img.onload = () => {
                const canvas = document.createElement("canvas")
                canvas.width = img.width
                canvas.height = img.height
                const ctx = canvas.getContext("2d")
                ctx?.drawImage(img, 0, 0)
                const dataURL = canvas.toDataURL("image/png")
                resolve(dataURL)
            }
            img.onerror = error => reject(error)
            img.src = url
        })
    }

    const getFilteredTrades = () => {
        let tradesToExport = [...trades]
        if (startDate || endDate) {
            const intervalStart = startDate ? startOfDay(parseISO(startDate)) : new Date(1970, 0, 1)
            const intervalEnd = endDate ? endOfDay(parseISO(endDate)) : endOfDay(new Date())

            tradesToExport = trades.filter((trade) => {
                const tradeDateStr = trade.date || trade.entryDate
                if (!tradeDateStr) return false
                const tradeDate = new Date(tradeDateStr)
                return isWithinInterval(tradeDate, { start: intervalStart, end: intervalEnd })
            })
        }
        return tradesToExport
    }

    const handleDownloadCSV = async () => {
        if (startDate && endDate && startDate > endDate) {
            toast.error("Start date cannot be after end date")
            return
        }

        setIsDownloading(true)
        try {
            const tradesToExport = getFilteredTrades()

            if (tradesToExport.length === 0) {
                toast.warning("No trades found in the selected date range.")
                setIsDownloading(false)
                return
            }

            // 1. HEADER: Added "Time" column
            const headers = ["Date", "Time", "Symbol", "Type", "Strategy", "Status", "Entry Price", "Exit Price", "Quantity", "Net P/L", "Notes"].join(",")

            const rows = tradesToExport.map(trade => {
                // 2. DEFINE VARIABLES HERE (Inside the map)
                const dateValue = trade.date || trade.entryDate
                const dateTime = dateValue ? new Date(dateValue) : new Date()
                const isValidDate = dateValue && !isNaN(dateTime.getTime())

                // 3. FORMAT DATE & TIME SEPARATELY
                // Excel prefers "yyyy-MM-dd" for dates to avoid auto-formatting issues
                const dateStr = isValidDate ? format(dateTime, "yyyy-MM-dd") : "N/A"
                const timeStr = isValidDate ? format(dateTime, "HH:mm") : "N/A"

                const escape = (field: any) => {
                    const stringField = String(field || "")
                    return stringField.includes(",") || stringField.includes("\n") ? `"${stringField.replace(/"/g, '""')}"` : stringField
                }

                return [
                    escape(dateStr),  // Column A
                    escape(timeStr),  // Column B
                    escape(trade.symbol),
                    escape(trade.type),
                    escape(trade.strategy?.name || "N/A"),
                    escape(trade.status),
                    trade.entryPrice,
                    trade.exitPrice || "",
                    trade.quantity,
                    trade.netPnl || 0,
                    escape(trade.notes || "")
                ].join(",")
            }).join("\n")

            const blob = new Blob([`${headers}\n${rows}`], { type: "text/csv;charset=utf-8;" })
            const link = document.createElement("a")
            const url = URL.createObjectURL(blob)

            const filename = startDate && endDate
                ? `trade_report_${startDate}_to_${endDate}.csv`
                : `trade_report_${format(new Date(), "yyyyMMdd")}.csv`

            link.setAttribute("href", url)
            link.setAttribute("download", filename)
            document.body.appendChild(link)
            link.click()
            document.body.removeChild(link)

            toast.success(`Exported ${tradesToExport.length} trades to CSV`)
            setOpen(false)
        } catch (error) {
            console.error(error)
            toast.error("Failed to generate CSV")
        } finally {
            setIsDownloading(false)
        }
    }

    // --- PDF DOWNLOAD (Updated) ---
    const handleDownloadPDF = async () => {
        if (startDate && endDate && startDate > endDate) {
            toast.error("Start date cannot be after end date")
            return
        }

        setIsDownloading(true)
        try {
            const tradesToExport = getFilteredTrades()
            if (tradesToExport.length === 0) {
                toast.warning("No trades found in range.")
                setIsDownloading(false)
                return
            }

            const doc = new jsPDF()

            // 1. ADD LOGO
            try {
                // Ensure 'favicon.png' is in your public folder
                const logoData = await getBase64ImageFromURL("/favicon.png")
                doc.addImage(logoData, "PNG", 14, 10, 12, 12) // x, y, w, h
            } catch (err) {
                console.warn("Logo could not be loaded", err)
            }

            // 2. HEADER DETAILS
            doc.setFontSize(22)
            doc.setTextColor(22, 163, 74) // TradeX Green
            doc.text("TradeX", 30, 19) // Next to logo

            doc.setFontSize(10)
            doc.setTextColor(100)
            const generatedDate = `Generated on: ${format(new Date(), "MMM dd, yyyy")}`
            doc.text(generatedDate, 200, 19, { align: "right" })

            // Divider Line
            doc.setDrawColor(230)
            doc.line(14, 25, 200, 25)

            // 3. USER & REPORT INFO
            doc.setFontSize(12)
            doc.setTextColor(0)
            doc.text("Trade Performance Report", 14, 35)

            doc.setFontSize(10)
            doc.setTextColor(80)

            // User Details
            doc.text(`Trader: ${userName || "Guest User"}`, 14, 42)
            doc.text(`Email: ${userEmail || "N/A"}`, 14, 47)

            // Date Range
            const rangeText = startDate && endDate
                ? `Period: ${format(parseISO(startDate), "MMM dd, yyyy")} - ${format(parseISO(endDate), "MMM dd, yyyy")}`
                : "Period: All Time"
            doc.text(rangeText, 14, 52)

            // 4. SUMMARY METRICS BOX
            const totalPnL = tradesToExport.reduce((acc, t) => acc + (Number(t.netPnl) || 0), 0)
            const isProfit = totalPnL >= 0

            // Draw Box
            doc.setFillColor(248, 250, 252) // Light Gray bg
            doc.roundedRect(140, 30, 60, 25, 2, 2, "F")

            // Box Text
            doc.setFontSize(9)
            doc.setTextColor(100)
            doc.text("Total Net P/L", 170, 38, { align: "center" })

            doc.setFontSize(14)
            doc.setTextColor(isProfit ? 22 : 220, isProfit ? 163 : 38, isProfit ? 74 : 38) // Green or Red
            doc.setFont("helvetica", "bold")
            doc.text(`Rs. ${totalPnL.toFixed(2)}`, 170, 48, { align: "center" })
            doc.setFont("helvetica", "normal")

            // 5. TABLE CONFIGURATION
            const tableData = tradesToExport.map(trade => [
                trade.date || trade.entryDate ? format(new Date(trade.date || trade.entryDate), "MMM dd, HH:mm") : "-",
                trade.symbol,
                trade.type, // BUY/SELL
                trade.entryPrice,
                trade.exitPrice || "-",
                trade.quantity,
                trade.netPnl ? `${Number(trade.netPnl).toFixed(2)}` : "0.00", // No symbol here, we handle in column
                trade.status
            ])

            autoTable(doc, {
                startY: 65,
                head: [['Date', 'Symbol', 'Type', 'Entry', 'Exit', 'Qty', 'Net P/L (Rs.)', 'Status']], // Changed header
                body: tableData,
                theme: 'striped', // Cleaner look, removes distinct vertical lines
                headStyles: {
                    fillColor: [22, 163, 74],
                    textColor: 255,
                    fontStyle: 'bold',
                    halign: 'center'
                },
                styles: {
                    fontSize: 8,
                    cellPadding: 4,
                    valign: 'middle'
                },
                columnStyles: {
                    0: { cellWidth: 30 }, // Date
                    3: { halign: 'right' }, // Entry
                    4: { halign: 'right' }, // Exit
                    5: { halign: 'center' }, // Qty
                    6: { halign: 'right', fontStyle: 'bold' }, // PnL
                    7: { halign: 'center' } // Status
                },

                // Color PnL Values
                didParseCell: function (data) {
                    if (data.section === 'body' && data.column.index === 6) {
                        const rawValue = data.cell.raw ? String(data.cell.raw) : "";
                        const pnlValue = parseFloat(rawValue.replace(/,/g, ''));

                        if (!isNaN(pnlValue)) {
                            if (pnlValue > 0) data.cell.styles.textColor = [22, 163, 74]
                            else if (pnlValue < 0) data.cell.styles.textColor = [220, 38, 38]
                        }
                    }
                    // Color Status
                    if (data.section === 'body' && data.column.index === 7) {
                        const status = String(data.cell.raw).toUpperCase()
                        if (status === 'OPEN') data.cell.styles.textColor = [59, 130, 246] // Blue
                    }
                    // Color Type
                    if (data.section === 'body' && data.column.index === 2) {
                        const type = String(data.cell.raw).toUpperCase()
                        if (type === 'BUY') data.cell.styles.textColor = [22, 163, 74]
                        else if (type === 'SELL') data.cell.styles.textColor = [220, 38, 38]
                    }
                }
            })

            // Footer
            const pageCount = (doc as any).internal.getNumberOfPages();
            doc.setFontSize(8);
            doc.setTextColor(150);
            for (let i = 1; i <= pageCount; i++) {
                doc.setPage(i);
                doc.text(`Page ${i} of ${pageCount}`, 200, 290, { align: "right" });
                doc.text("Generated by TradeX Journal", 14, 290);
            }

            const filename = startDate && endDate
                ? `TradeX_Report_${startDate}_to_${endDate}.pdf`
                : `TradeX_Report_${format(new Date(), "yyyyMMdd")}.pdf`

            doc.save(filename)
            toast.success(`PDF Report Generated!`)
            setOpen(false)

        } catch (error) {
            console.error(error)
            toast.error("Failed to generate PDF")
        } finally {
            setIsDownloading(false)
        }
    }

    const handleOpenChange = (newOpen: boolean) => {
        setOpen(newOpen);
    }

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="h-8 gap-1">
                    <Download className="h-3.5 w-3.5" />
                    <span className="hidden sm:inline">Export</span>
                    <span className="sm:hidden">Export</span>
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Export Trades</DialogTitle>
                    <DialogDescription>Select date range and format.</DialogDescription>
                </DialogHeader>

                <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                        <Label htmlFor="start-date" className="flex items-center gap-2">
                            <CalendarIcon className="h-4 w-4 text-muted-foreground" /> From Date
                        </Label>
                        <Input id="start-date" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="end-date" className="flex items-center gap-2">
                            <CalendarIcon className="h-4 w-4 text-muted-foreground" /> To Date
                        </Label>
                        <Input id="end-date" type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} min={startDate} />
                    </div>
                </div>

                <DialogFooter className="flex flex-col sm:flex-row gap-2">
                    <Button onClick={handleDownloadCSV} disabled={isDownloading} variant="outline" className="w-full sm:w-auto gap-2">
                        {isDownloading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Table className="h-4 w-4 text-green-600" />}
                        Export CSV
                    </Button>
                    <Button onClick={handleDownloadPDF} disabled={isDownloading} className="w-full sm:w-auto gap-2 bg-red-600 hover:bg-red-700 text-white">
                        {isDownloading ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileText className="h-4 w-4" />}
                        Export PDF
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}