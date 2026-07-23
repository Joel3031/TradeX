import { auth } from "@/auth"
import { prisma } from "@/lib/db"
import { redirect } from "next/navigation"
import { TradeHistory } from "@/components/trade-history"

export default async function TradesPage() {
    const session = await auth()
    if (!session?.user?.id) redirect("/login")

    // Fetch trades without the 'take: 100' limit so all logs appear
    const trades = await prisma.trade.findMany({
        where: { userId: session.user.id },
        orderBy: { entryDate: 'desc' }
    })

    return (
        <div className="flex flex-col p-4 pb-24 space-y-4 max-w-7xl mx-auto w-full">
            <div className="flex flex-col space-y-1">
                <h1 className="text-2xl font-bold tracking-tight">Trade Logs</h1>
                <p className="text-sm text-muted-foreground">Manage and review your historical trades.</p>
            </div>

            {/* The dedicated history component */}
            <TradeHistory trades={trades} />
        </div>
    )
}