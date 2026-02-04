"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Drawer, DrawerContent, DrawerDescription, DrawerHeader, DrawerTitle, DrawerTrigger } from "@/components/ui/drawer"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useMediaQuery } from "@/hooks/use-media-query"
import { createTrade, updateTrade, deleteTrade } from "@/app/actions"
import { toast } from "sonner"
import { Loader2, Plus, Trash2, AlertTriangle, ArrowLeft } from "lucide-react"

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
        <Button className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm">
            <Plus className="mr-1 h-4 w-4" />
            Log Trade
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
    const [isConfirmingDelete, setIsConfirmingDelete] = useState(false) // NEW STATE

    const defaultDate = initialData?.date
        ? new Date(initialData.date).toISOString().split('T')[0]
        : initialData?.entryDate
            ? new Date(initialData.entryDate).toISOString().split('T')[0]
            : new Date().toISOString().split('T')[0]

    async function onSubmit(event: React.SyntheticEvent) {
        event.preventDefault()
        setIsLoading(true)

        const target = event.target as typeof event.target & {
            symbol: { value: string };
            type: { value: string };
            entryPrice: { value: string };
            exitPrice: { value: string };
            quantity: { value: string };
            stopLoss: { value: string };
            date: { value: string };
        }

        const formData = {
            symbol: target.symbol.value,
            type: target.type.value || "BUY",
            entryPrice: target.entryPrice.value,
            exitPrice: target.exitPrice.value,
            quantity: target.quantity.value,
            stopLoss: target.stopLoss.value,
            date: target.date.value,
            id: initialData?.id
        }

        let result;
        if (initialData?.id) {
            result = await updateTrade(formData)
        } else {
            result = await createTrade(formData)
        }

        if (result.success) {
            toast.success(initialData ? "Trade updated" : "Trade logged")
            setOpen(false)
        } else {
            toast.error(result.error || "Operation failed")
        }
        setIsLoading(false)
    }

    // UPDATED: Confirm Logic
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

    // --- RENDER CONFIRMATION VIEW ---
    if (isConfirmingDelete) {
        return (
            <div className={`flex flex-col items-center justify-center space-y-6 py-4 animate-in fade-in zoom-in-95 duration-200 ${className}`}>
                <div className="h-12 w-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                    <AlertTriangle className="h-6 w-6 text-red-600 dark:text-red-500" />
                </div>

                <div className="text-center space-y-2 px-4">
                    <h3 className="text-lg font-semibold">Confirm Deletion</h3>
                    <p className="text-sm text-muted-foreground">
                        Are you sure you want to delete this trade log? This action cannot be undone.
                    </p>
                </div>

                <div className="flex gap-3 w-full pt-2">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => setIsConfirmingDelete(false)}
                        disabled={isDeleting}
                        className="flex-1 h-11"
                    >
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Cancel
                    </Button>
                    <Button
                        type="button"
                        variant="destructive"
                        onClick={confirmDelete}
                        disabled={isDeleting}
                        className="flex-1 h-11"
                    >
                        {isDeleting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Trash2 className="mr-2 h-4 w-4" />}
                        Delete
                    </Button>
                </div>
            </div>
        )
    }

    // --- RENDER FORM VIEW ---
    return (
        <form
            onSubmit={onSubmit}
            className={`flex flex-col gap-4 md:grid md:grid-cols-2 items-start ${className}`}
        >
            <div className="w-full grid gap-2">
                <Label htmlFor="symbol">Symbol</Label>
                <Input
                    id="symbol"
                    name="symbol"
                    placeholder="e.g. NIFTY"
                    required
                    autoFocus
                    defaultValue={initialData?.symbol}
                />
            </div>
            <div className="w-full grid gap-2">
                <Label htmlFor="type">Type</Label>
                <Select name="type" defaultValue={initialData?.type || "BUY"}>
                    <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="BUY">BUY (Long)</SelectItem>
                        <SelectItem value="SELL">SELL (Short)</SelectItem>
                    </SelectContent>
                </Select>
            </div>
            <div className="w-full grid gap-2">
                <Label htmlFor="entryPrice">Entry Price</Label>
                <Input
                    id="entryPrice"
                    name="entryPrice"
                    type="number"
                    step="0.05"
                    placeholder="0.00"
                    required
                    defaultValue={initialData?.entryPrice}
                />
            </div>
            <div className="w-full grid gap-2">
                <Label htmlFor="quantity">Quantity</Label>
                <Input
                    id="quantity"
                    name="quantity"
                    type="number"
                    placeholder="0"
                    required
                    defaultValue={initialData?.quantity}
                />
            </div>
            <div className="w-full grid gap-2">
                <Label htmlFor="stopLoss">Stop Loss</Label>
                <Input
                    id="stopLoss"
                    name="stopLoss"
                    type="number"
                    step="0.05"
                    placeholder="0.00"
                    required
                    defaultValue={initialData?.stopLoss}
                />
            </div>
            <div className="w-full grid gap-2">
                <Label htmlFor="exitPrice">Exit Price</Label>
                <Input
                    id="exitPrice"
                    name="exitPrice"
                    type="number"
                    step="0.05"
                    placeholder="Target hit?"
                    defaultValue={initialData?.exitPrice}
                />
            </div>
            <div className="w-full grid gap-2 md:col-span-2">
                <Label htmlFor="date">Date</Label>
                <Input
                    id="date"
                    name="date"
                    type="date"
                    defaultValue={defaultDate}
                    required
                />
            </div>

            <div className="flex gap-3 w-full md:col-span-2 mt-4 mb-2">
                <Button
                    type="submit"
                    disabled={isLoading}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white h-12 text-base font-semibold shadow-md"
                >
                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {initialData ? "Update Trade" : "Save Trade"}
                </Button>

                {/* Delete Trigger */}
                {initialData && (
                    <Button
                        type="button"
                        variant="destructive"
                        // UPDATED: Triggers the confirm view instead of window.alert
                        onClick={() => setIsConfirmingDelete(true)}
                        disabled={isLoading}
                        className="h-12 w-12 px-0 shadow-md"
                    >
                        <Trash2 className="h-5 w-5" />
                    </Button>
                )}
            </div>

        </form>
    )
}