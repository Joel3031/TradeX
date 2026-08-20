"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Drawer, DrawerContent, DrawerDescription, DrawerHeader, DrawerTitle, DrawerTrigger } from "@/components/ui/drawer"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { useMediaQuery } from "@/hooks/use-media-query"
import { createTrade, updateTrade, deleteTrade } from "@/app/actions"
import { toast } from "sonner"
import { Loader2, Plus, Trash2, AlertTriangle, ArrowLeft } from "lucide-react"
import { calculateIntradayCharges, Execution } from "@/lib/tax-calculator"

interface TradeDialogProps {
    trigger?: React.ReactNode
    tradeToEdit?: any
    open?: boolean
    onOpenChange?: (open: boolean) => void
}

export function TradeDialog({ trigger, tradeToEdit, open: controlledOpen, onOpenChange }: TradeDialogProps) {
    const [internalOpen, setInternalOpen] = useState(false)
    const isDesktop = useMediaQuery("(min-width: 768px)")

    const isControlled = controlledOpen !== undefined
    const isOpen = isControlled ? controlledOpen : internalOpen
    const setIsOpen = onOpenChange || setInternalOpen

    const DefaultTrigger = (
        <Button className="group flex items-center !p-0 h-10 rounded-full bg-green-600 hover:bg-green-700 text-white shadow-md transition-all duration-300 ease-in-out overflow-hidden">
            <div className="flex items-center justify-center w-10 h-10 shrink-0">
                <Plus className="h-5 w-5" />
            </div>
            <span className="max-w-0 opacity-0 overflow-hidden whitespace-nowrap transition-all duration-300 ease-in-out group-hover:max-w-[100px] group-hover:opacity-100 group-hover:pr-5 font-medium">
                Add Trade
            </span>
        </Button>
    )

    const dialogContent = (
        <>
            <DialogHeader>
                <DialogTitle>{tradeToEdit ? "Edit Trade" : "Log New Trade"}</DialogTitle>
                <DialogDescription>
                    {tradeToEdit ? "Update or delete this trade record." : "Enter the details of your execution here."}
                </DialogDescription>
            </DialogHeader>
            <TradeForm setOpen={setIsOpen} initialData={tradeToEdit} />
        </>
    )

    const drawerContent = (
        <>
            <DrawerHeader className="text-left pb-0">
                <DrawerTitle>{tradeToEdit ? "Edit Trade" : "Log New Trade"}</DrawerTitle>
                <DrawerDescription>
                    {tradeToEdit ? "Update or delete this trade record." : "Enter the details of your execution here."}
                </DrawerDescription>
            </DrawerHeader>
            <div className="px-4 pb-8 overflow-y-auto max-h-[75vh]">
                <TradeForm setOpen={setIsOpen} className="pt-4" initialData={tradeToEdit} />
            </div>
        </>
    )

    if (isDesktop) {
        return (
            <Dialog open={isOpen} onOpenChange={setIsOpen}>
                {!isControlled && (
                    <DialogTrigger asChild>
                        {trigger || DefaultTrigger}
                    </DialogTrigger>
                )}
                <DialogContent className="sm:max-w-[500px]">
                    {dialogContent}
                </DialogContent>
            </Dialog>
        )
    }

    return (
        <Drawer open={isOpen} onOpenChange={setIsOpen}>
            {!isControlled && (
                <DrawerTrigger asChild>
                    {trigger || DefaultTrigger}
                </DrawerTrigger>
            )}
            <DrawerContent className="bg-background text-foreground border-t border-border h-auto max-h-[90vh] flex flex-col">
                {drawerContent}
            </DrawerContent>
        </Drawer>
    )
}

function TradeForm({ setOpen, className, initialData }: { setOpen: (open: boolean) => void, className?: string, initialData?: any }) {
    const [isLoading, setIsLoading] = useState(false)
    const [isDeleting, setIsDeleting] = useState(false)
    const [isConfirmingDelete, setIsConfirmingDelete] = useState(false)

    // Determine if the initial data was a Quick Log (0 qty and 0 entry price, but has PnL)
    const isInitiallyQuickLog = initialData ? (initialData.quantity === 0 && initialData.entryPrice === 0 && initialData.netPnl !== undefined) : false

    const [isQuickLogMode, setIsQuickLogMode] = useState(isInitiallyQuickLog || initialData?.isQuickLog || false)
    const [isMultipleExecutions, setIsMultipleExecutions] = useState(false)

    const [entries, setEntries] = useState<Execution[]>([{ price: initialData?.entryPrice || 0, quantity: initialData?.quantity || 0 }])
    const [exits, setExits] = useState<Execution[]>([{ price: initialData?.exitPrice || 0, quantity: initialData?.quantity || 0 }])

    const [formData, setFormData] = useState({
        symbol: initialData?.symbol || "",
        category: initialData?.category || "INTRADAY",
        type: initialData?.type || "BUY",
        optionType: initialData?.optionType || "CE",
        strike: initialData?.strike || "",
        expiryDate: initialData?.expiryDate ? new Date(initialData.expiryDate).toISOString().split('T')[0] : "",
        exitDate: initialData?.exitDate ? new Date(initialData.exitDate).toISOString().split('T')[0] : "",
        entryPrice: initialData?.entryPrice?.toString() || "",
        exitPrice: initialData?.exitPrice?.toString() || "",
        quantity: initialData?.quantity?.toString() || "",
        stopLoss: initialData?.stopLoss?.toString() || "",
        date: initialData?.date
            ? new Date(initialData.date).toISOString().split('T')[0]
            : initialData?.entryDate
                ? new Date(initialData.entryDate).toISOString().split('T')[0]
                : new Date().toISOString().split('T')[0],
        notes: initialData?.notes || "",
        quickPnl: initialData?.netPnl?.toString() || ""
    })

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }))
    }

    const addExecution = (type: "ENTRY" | "EXIT") => {
        if (type === "ENTRY") setEntries([...entries, { price: 0, quantity: 0 }])
        else setExits([...exits, { price: 0, quantity: 0 }])
    }

    const removeExecution = (type: "ENTRY" | "EXIT", index: number) => {
        if (type === "ENTRY") setEntries(entries.filter((_, i) => i !== index))
        else setExits(exits.filter((_, i) => i !== index))
    }

    const updateExecution = (type: "ENTRY" | "EXIT", index: number, field: keyof Execution, value: string) => {
        const val = parseFloat(value) || 0
        if (type === "ENTRY") {
            const newEntries = [...entries]
            newEntries[index][field] = val
            setEntries(newEntries)
        } else {
            const newExits = [...exits]
            newExits[index][field] = val
            setExits(newExits)
        }
    }

    async function onSubmit(event: React.SyntheticEvent) {
        event.preventDefault()

        if (!formData.symbol) return toast.warning("Please enter a Symbol (e.g., NIFTY)")
        if (!formData.date) return toast.warning("Please select a Date.")

        let processedEntries: Execution[] = []
        let processedExits: Execution[] = []
        let finalAvgEntry = 0
        let finalAvgExit = 0
        let finalEntryQty = 0

        if (!isQuickLogMode) {
            if (isMultipleExecutions) {
                processedEntries = entries.filter(e => e.price > 0 && e.quantity > 0)
                processedExits = exits.filter(e => e.price > 0 && e.quantity > 0)

                if (processedEntries.length === 0) return toast.warning("Valid entry details are required.")

                finalEntryQty = processedEntries.reduce((acc, e) => acc + e.quantity, 0)
                const totalExitQty = processedExits.reduce((acc, e) => acc + e.quantity, 0)

                finalAvgEntry = processedEntries.reduce((acc, e) => acc + (e.price * e.quantity), 0) / finalEntryQty
                finalAvgExit = totalExitQty > 0 ? processedExits.reduce((acc, e) => acc + (e.price * e.quantity), 0) / totalExitQty : 0
            } else {
                const entryVal = parseFloat(formData.entryPrice) || 0
                const exitVal = parseFloat(formData.exitPrice) || 0
                finalEntryQty = parseFloat(formData.quantity) || 0

                if (!entryVal) return toast.warning("Entry Price is mandatory.")
                if (!finalEntryQty) return toast.warning("Please enter the Quantity.")

                processedEntries = [{ price: entryVal, quantity: finalEntryQty }]
                if (exitVal > 0) processedExits = [{ price: exitVal, quantity: finalEntryQty }]

                finalAvgEntry = entryVal
                finalAvgExit = exitVal
            }

            if (formData.category === "OPTIONS" && (!formData.strike || !formData.expiryDate)) {
                return toast.warning("Strike price and Expiry Date are mandatory for Options.")
            }
        } else if (!formData.quickPnl) {
            return toast.warning("Please enter Profit/Loss amount.")
        }

        setIsLoading(true)

        try {
            let payload: any = {}

            if (isQuickLogMode) {
                const manualPnl = parseFloat(formData.quickPnl || "0")
                payload = {
                    symbol: formData.symbol,
                    category: formData.category,
                    type: formData.type,
                    entryPrice: 0,
                    exitPrice: 0,
                    quantity: 0,
                    stopLoss: null,
                    date: formData.date,
                    notes: formData.notes || "Quick Logged Trade",
                    fees: 0,
                    netPnl: manualPnl,
                    pnl: manualPnl,
                    id: initialData?.id
                }
            } else {
                const taxResult = calculateIntradayCharges(processedEntries, processedExits, formData.type as "BUY" | "SELL")

                payload = {
                    symbol: formData.symbol,
                    category: formData.category,
                    type: formData.type,
                    entryPrice: finalAvgEntry,
                    exitPrice: finalAvgExit > 0 ? finalAvgExit : null,
                    quantity: finalEntryQty,
                    stopLoss: formData.stopLoss ? parseFloat(formData.stopLoss) : null,
                    date: formData.date,
                    strike: formData.category === "OPTIONS" && formData.strike ? parseFloat(formData.strike) : null,
                    optionType: formData.category === "OPTIONS" ? formData.optionType : null,
                    expiryDate: formData.category === "OPTIONS" ? formData.expiryDate : null,
                    exitDate: formData.category === "DELIVERY" && finalAvgExit > 0 ? formData.exitDate : null,
                    fees: taxResult.totalCharges || 0,
                    netPnl: finalAvgExit > 0 ? taxResult.netPnl : 0,
                    pnl: taxResult.grossPnl || 0,
                    notes: formData.notes || null,
                    id: initialData?.id
                }
            }

            let result = initialData?.id ? await updateTrade(payload) : await createTrade(payload)

            if (result.success) {
                toast.success(initialData ? "Trade updated" : "Trade logged")
                setOpen(false)
            } else {
                toast.error(result.error || "Operation failed")
            }
        } catch (error) {
            console.error(error)
            toast.error("An error occurred")
        } finally {
            setIsLoading(false)
        }
    }

    async function confirmDelete() {
        if (!initialData?.id) return
        setIsDeleting(true)
        const result = await deleteTrade(initialData.id)
        if (result.success) {
            toast.success("Trade deleted")
            setOpen(false)
        } else {
            toast.error(result.error || "Failed to delete")
            setIsDeleting(false)
        }
    }

    if (isConfirmingDelete) {
        return (
            <div className={`flex flex-col items-center justify-center space-y-6 py-4 animate-in fade-in zoom-in-95 duration-200 ${className}`}>
                <div className="h-12 w-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                    <AlertTriangle className="h-6 w-6 text-red-600 dark:text-red-500" />
                </div>
                <div className="text-center space-y-2 px-4">
                    <h3 className="text-lg font-semibold">Confirm Deletion</h3>
                    <p className="text-sm text-muted-foreground">Are you sure you want to delete this trade log? This action cannot be undone.</p>
                </div>
                <div className="flex gap-3 w-full pt-2">
                    <Button type="button" variant="outline" onClick={() => setIsConfirmingDelete(false)} disabled={isDeleting} className="flex-1 h-11"><ArrowLeft className="mr-2 h-4 w-4" />Cancel</Button>
                    <Button type="button" variant="destructive" onClick={confirmDelete} disabled={isDeleting} className="flex-1 h-11">{isDeleting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Trash2 className="mr-2 h-4 w-4" />}Delete</Button>
                </div>
            </div>
        )
    }

    const inputClasses = "w-full h-10 bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 focus:border-green-500 focus:ring-green-500/20 rounded-md transition-all"

    return (
        <form onSubmit={onSubmit} className={`flex flex-col gap-4 md:grid md:grid-cols-2 items-start ${className}`}>

            {/* TOGGLES */}
            <div className="flex flex-col gap-3 p-4 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl mb-2 md:col-span-2">
                <div className="flex items-center justify-between">
                    <div className="flex flex-col">
                        <span className="font-semibold text-sm">Quick Log</span>
                        <span className="text-xs text-muted-foreground">Only enter symbol and P&L</span>
                    </div>
                    <Switch
                        checked={isQuickLogMode}
                        onCheckedChange={(val) => {
                            setIsQuickLogMode(val)
                            if (val) setIsMultipleExecutions(false)
                        }}
                    />
                </div>
                {!isQuickLogMode && (
                    <div className="flex items-center justify-between border-t border-border/50 pt-3">
                        <div className="flex flex-col">
                            <span className="font-semibold text-sm">Multiple Executions</span>
                            <span className="text-xs text-muted-foreground">Scale in/out with partial fills</span>
                        </div>
                        <Switch
                            checked={isMultipleExecutions}
                            onCheckedChange={setIsMultipleExecutions}
                        />
                    </div>
                )}
            </div>

            {/* CATEGORY SELECTOR */}
            {!initialData?.id && (
                <div className="w-full flex bg-zinc-100 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 p-1 rounded-xl mb-2 md:col-span-2">
                    {(["INTRADAY", "OPTIONS", "DELIVERY"] as const).map((cat) => (
                        <button
                            key={cat}
                            type="button"
                            onClick={() => setFormData(prev => ({ ...prev, category: cat }))}
                            className={`flex-1 text-xs font-bold py-2 rounded-lg transition-all ${formData.category === cat
                                ? 'bg-white dark:bg-zinc-800 shadow-sm text-foreground ring-1 ring-black/5 dark:ring-white/10'
                                : 'text-zinc-500 hover:text-foreground'
                                }`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>
            )}

            <div className="w-full grid gap-2">
                <Label>Symbol</Label>
                <Input name="symbol" value={formData.symbol} onChange={handleChange} className={`${inputClasses} uppercase font-semibold`} placeholder="e.g. NIFTY" required autoFocus />
            </div>

            <div className="w-full grid gap-2">
                <Label>Type</Label>
                <Select value={formData.type} onValueChange={(val: any) => setFormData(prev => ({ ...prev, type: val }))}>
                    <SelectTrigger className={inputClasses}><SelectValue /></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="BUY">BUY (Long)</SelectItem>
                        <SelectItem value="SELL">SELL (Short)</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {isQuickLogMode ? (
                <>
                    <div className="w-full grid gap-2 md:col-span-1">
                        <Label>Net P&L (₹)</Label>
                        <Input
                            type="number"
                            step="0.05"
                            name="quickPnl"
                            value={formData.quickPnl}
                            onChange={handleChange}
                            placeholder="-1500 or 2000"
                            className={`${inputClasses} ${Number(formData.quickPnl) > 0 ? 'text-green-500' : Number(formData.quickPnl) < 0 ? 'text-red-500' : ''}`}
                        />
                    </div>
                    <div className="w-full grid gap-2 md:col-span-1">
                        <Label>Date</Label>
                        <Input type="date" name="date" value={formData.date} onChange={handleChange} className={inputClasses} />
                    </div>
                </>
            ) : (
                <>
                    {/* CONDITIONAL: Options Fields */}
                    {formData.category === "OPTIONS" && (
                        <>
                            <div className="w-full grid gap-2 md:col-span-2">
                                <Label>Option Type</Label>
                                <Select value={formData.optionType} onValueChange={(val: any) => setFormData(prev => ({ ...prev, optionType: val }))}>
                                    <SelectTrigger className={inputClasses}><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="CE">CE (Call)</SelectItem>
                                        <SelectItem value="PE">PE (Put)</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="w-full grid gap-2">
                                <Label>Strike Price</Label>
                                <Input name="strike" type="number" step="0.05" value={formData.strike} onChange={handleChange} className={inputClasses} placeholder="e.g. 22000" />
                            </div>
                            <div className="w-full grid gap-2">
                                <Label>Expiry Date</Label>
                                <Input name="expiryDate" type="date" value={formData.expiryDate} onChange={handleChange} className={inputClasses} />
                            </div>
                        </>
                    )}

                    {/* DYNAMIC EXECUTION UI OR SIMPLE UI */}
                    {isMultipleExecutions ? (
                        <div className="space-y-4 bg-zinc-50 dark:bg-zinc-950 p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 md:col-span-2 mt-2">
                            {/* Entries */}
                            <div className="space-y-3">
                                <Label className="text-xs font-bold uppercase text-foreground">Entry Legs</Label>
                                {entries.map((leg, index) => (
                                    <div key={`entry-${index}`} className="flex gap-2 items-center">
                                        <Input type="number" step="0.05" placeholder="Price" value={leg.price || ""} onChange={(e) => updateExecution("ENTRY", index, "price", e.target.value)} className={inputClasses} />
                                        <Input type="number" placeholder="Qty" value={leg.quantity || ""} onChange={(e) => updateExecution("ENTRY", index, "quantity", e.target.value)} className={inputClasses} />
                                        <Button type="button" variant="ghost" size="icon" onClick={() => removeExecution("ENTRY", index)} disabled={entries.length === 1} className="h-10 w-10 text-red-500 hover:bg-red-50 hover:text-red-600">
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                ))}
                                <Button type="button" variant="outline" size="sm" onClick={() => addExecution("ENTRY")} className="w-full text-xs border-dashed">
                                    <Plus className="h-3 w-3 mr-1" /> Add Partial Entry
                                </Button>
                            </div>

                            <hr className="border-border/50" />

                            {/* Exits */}
                            <div className="space-y-3">
                                <Label className="text-xs font-bold uppercase text-foreground">Exit Legs</Label>
                                {exits.map((leg, index) => (
                                    <div key={`exit-${index}`} className="flex gap-2 items-center">
                                        <Input type="number" step="0.05" placeholder="Price" value={leg.price || ""} onChange={(e) => updateExecution("EXIT", index, "price", e.target.value)} className={inputClasses} />
                                        <Input type="number" placeholder="Qty" value={leg.quantity || ""} onChange={(e) => updateExecution("EXIT", index, "quantity", e.target.value)} className={inputClasses} />
                                        <Button type="button" variant="ghost" size="icon" onClick={() => removeExecution("EXIT", index)} disabled={exits.length === 1} className="h-10 w-10 text-red-500 hover:bg-red-50 hover:text-red-600">
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                ))}
                                <Button type="button" variant="outline" size="sm" onClick={() => addExecution("EXIT")} className="w-full text-xs border-dashed">
                                    <Plus className="h-3 w-3 mr-1" /> Add Partial Exit
                                </Button>
                            </div>
                        </div>
                    ) : (
                        <>
                            <div className="w-full grid gap-2">
                                <Label>Entry Price</Label>
                                <Input name="entryPrice" type="number" step="0.05" value={formData.entryPrice} onChange={handleChange} className={inputClasses} placeholder="0.00" />
                            </div>
                            <div className="w-full grid gap-2">
                                <Label>Exit Price</Label>
                                <Input name="exitPrice" type="number" step="0.05" value={formData.exitPrice} onChange={handleChange} className={inputClasses} placeholder="Target hit?" />
                            </div>
                            <div className="w-full grid gap-2">
                                <Label>Quantity</Label>
                                <Input name="quantity" type="number" value={formData.quantity} onChange={handleChange} className={inputClasses} placeholder="0" />
                            </div>
                            <div className="w-full grid gap-2">
                                <Label>Stop Loss</Label>
                                <Input name="stopLoss" type="number" step="0.05" value={formData.stopLoss} onChange={handleChange} className={inputClasses} placeholder="Optional" />
                            </div>
                        </>
                    )}

                    <div className={formData.category === "DELIVERY" && formData.exitPrice ? "w-full grid gap-2" : "w-full grid gap-2 md:col-span-2"}>
                        <Label>{formData.category === "DELIVERY" ? "Entry Date" : "Date"}</Label>
                        <Input name="date" type="date" value={formData.date} onChange={handleChange} className={inputClasses} />
                    </div>

                    {/* CONDITIONAL: Delivery Exit Date */}
                    {formData.category === "DELIVERY" && formData.exitPrice && (
                        <div className="w-full grid gap-2">
                            <Label>Exit Date</Label>
                            <Input name="exitDate" type="date" value={formData.exitDate} onChange={handleChange} className={inputClasses} />
                        </div>
                    )}
                </>
            )}

            <div className="w-full grid gap-2 md:col-span-2">
                <Label>Notes & Strategy</Label>
                <textarea
                    name="notes"
                    rows={2}
                    value={formData.notes}
                    onChange={handleChange}
                    className="flex min-h-[60px] w-full bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 rounded-md px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-green-500/20 disabled:cursor-not-allowed disabled:opacity-50 resize-none transition-all"
                    placeholder="Why did you take this trade?"
                />
            </div>

            <div className="flex gap-3 w-full md:col-span-2 mt-4 mb-2">
                <Button type="submit" disabled={isLoading} className="flex-1 bg-green-600 hover:bg-green-700 text-white h-12 text-base font-semibold shadow-md">
                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {initialData ? "Update Trade" : "Save Trade"}
                </Button>
                {initialData && (
                    <Button type="button" variant="destructive" onClick={() => setIsConfirmingDelete(true)} disabled={isLoading} className="h-12 w-12 px-0 shadow-md">
                        <Trash2 className="h-5 w-5" />
                    </Button>
                )}
            </div>
        </form>
    )
}