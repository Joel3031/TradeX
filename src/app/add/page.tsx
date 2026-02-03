"use client"

import { useRouter } from "next/navigation"
import { TradeForm } from "@/components/add-trade-form"
import { Button } from "@/components/ui/button"
import { ChevronLeft } from "lucide-react"

export default function AddTradePage() {
    const router = useRouter()

    return (
        <main className="flex min-h-screen flex-col bg-zinc-50 dark:bg-zinc-900">

            {/* Mobile-style Header */}
            <div className="flex items-center p-4 border-b bg-background sticky top-0 z-10">
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => router.back()}
                    className="-ml-2"
                >
                    <ChevronLeft className="h-6 w-6" />
                </Button>
                <h1 className="text-lg font-semibold ml-2">Log New Trade</h1>
            </div>

            {/* The Form */}
            <div className="p-4 max-w-lg mx-auto w-full">
                <TradeForm
                    onSuccess={() => {
                        // On mobile page, we want to go back to home after saving
                        router.push("/")
                        router.refresh() // Ensure data is fresh
                    }}
                />
            </div>
        </main>
    )
}