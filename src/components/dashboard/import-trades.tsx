"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Upload, FileSpreadsheet, Download, Loader2, AlertCircle } from "lucide-react"
import { toast } from "sonner"
import * as XLSX from "xlsx"
import { importTrades } from "@/app/actions"

export function ImportTrades() {
    const [isOpen, setIsOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const fileInputRef = useRef<HTMLInputElement>(null)

    // 1. GENERATE TEMPLATE
    const downloadTemplate = () => {
        const template = [
            {
                Date: "2024-02-20",
                Symbol: "NIFTY",
                Type: "BUY",
                Quantity: 50,
                "Entry Price": 22000,
                "Exit Price": 22100,
                "Stop Loss": 21900
            }
        ]
        const ws = XLSX.utils.json_to_sheet(template)
        const wb = XLSX.utils.book_new()
        XLSX.utils.book_append_sheet(wb, ws, "Template")
        XLSX.writeFile(wb, "TradeX_Import_Template.xlsx")
    }

    // 2. HANDLE FILE UPLOAD
    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        setLoading(true)
        const reader = new FileReader()

        reader.onload = async (evt) => {
            try {
                const bstr = evt.target?.result
                const wb = XLSX.read(bstr, { type: "binary" })
                const wsname = wb.SheetNames[0]
                const ws = wb.Sheets[wsname]
                const data = XLSX.utils.sheet_to_json(ws)

                if (data.length === 0) {
                    toast.error("File is empty")
                    setLoading(false)
                    return
                }

                // Normalise Keys (Handle different case/spacing)
                const normalizedData = data.map((row: any) => ({
                    date: row["Date"] || row["date"],
                    symbol: row["Symbol"] || row["symbol"],
                    type: row["Type"] || row["type"],
                    quantity: row["Quantity"] || row["Qty"] || row["quantity"],
                    entryPrice: row["Entry Price"] || row["Entry"] || row["entryPrice"],
                    exitPrice: row["Exit Price"] || row["Exit"] || row["exitPrice"],
                    stopLoss: row["Stop Loss"] || row["SL"] || row["stopLoss"],
                }))

                // Basic Validation
                const validRows = normalizedData.filter(
                    (r) => r.symbol && r.quantity && r.entryPrice && r.date
                )

                if (validRows.length === 0) {
                    toast.error("No valid trades found. Please check column names.")
                    setLoading(false)
                    return
                }

                // Send to Server
                const result = await importTrades(validRows)

                if (result.success) {
                    toast.success(`Successfully imported ${result.count} trades!`)
                    setIsOpen(false)
                } else {
                    toast.error(result.error)
                }

            } catch (err) {
                console.error(err)
                toast.error("Failed to parse file")
            } finally {
                setLoading(false)
                if (fileInputRef.current) fileInputRef.current.value = "" // Reset input
            }
        }
        reader.readAsBinaryString(file)
    }

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="h-8 gap-2 border-dashed">
                    <Upload className="h-3.5 w-3.5" />
                    <span>Import</span>
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Import Trades</DialogTitle>
                    <DialogDescription>
                        Upload an Excel or CSV file to bulk import your trades.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    {/* Step 1: Template */}
                    <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg border border-dashed">
                        <div className="flex items-center gap-3">
                            <FileSpreadsheet className="h-8 w-8 text-green-600" />
                            <div className="space-y-0.5">
                                <p className="text-sm font-medium">Download Template</p>
                                <p className="text-xs text-muted-foreground">Use this format to avoid errors</p>
                            </div>
                        </div>
                        <Button variant="secondary" size="sm" onClick={downloadTemplate}>
                            <Download className="h-4 w-4 mr-2" />
                            Template
                        </Button>
                    </div>

                    {/* Step 2: Upload */}
                    <div className="flex items-center justify-center w-full">
                        <label
                            htmlFor="dropzone-file"
                            className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-gray-50 dark:hover:bg-bray-800 dark:bg-zinc-900 hover:bg-gray-100 dark:border-zinc-700 dark:hover:border-zinc-500 dark:hover:bg-zinc-800 transition-all ${loading ? "opacity-50 pointer-events-none" : ""
                                }`}
                        >
                            <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                {loading ? (
                                    <>
                                        <Loader2 className="h-8 w-8 text-muted-foreground animate-spin mb-2" />
                                        <p className="text-sm text-muted-foreground">Importing trades...</p>
                                    </>
                                ) : (
                                    <>
                                        <Upload className="w-8 h-8 mb-3 text-muted-foreground" />
                                        <p className="text-sm text-gray-500 dark:text-gray-400">
                                            <span className="font-semibold">Click to upload</span>
                                        </p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">
                                            .XLSX or .CSV (Max 2MB)
                                        </p>
                                    </>
                                )}
                            </div>
                            <input
                                id="dropzone-file"
                                type="file"
                                className="hidden"
                                accept=".xlsx, .xls, .csv"
                                onChange={handleFileUpload}
                                ref={fileInputRef}
                                disabled={loading}
                            />
                        </label>
                    </div>

                    <div className="flex items-start gap-2 p-3 bg-yellow-50 dark:bg-yellow-900/10 text-yellow-800 dark:text-yellow-200 rounded-md text-xs">
                        <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                        <p>
                            Ensure dates are in <code>YYYY-MM-DD</code> format and Types are <code>BUY</code> or <code>SELL</code>.
                        </p>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}