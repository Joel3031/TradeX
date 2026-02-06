import { prisma } from "@/lib/db"
import { auth } from "@/auth"
import { TradeDialog } from "@/components/trade-dialog"
import { AppDashboard } from "@/components/app-dashboard"
import { UserProfileMenu } from "@/components/user-profile-menu"
import { redirect } from "next/navigation"
import Image from "next/image"

export const dynamic = 'force-dynamic'

export default async function Home() {
  const session = await auth()

  if (!session?.user) {
    redirect("/login")
  }

  // 1. FETCH USER SETTINGS (Include showNetPnl)
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { showNetPnl: true, email: true, name: true }
  })

  const rawTrades = await prisma.trade.findMany({
    where: { userId: session.user.id },
    orderBy: { entryDate: 'desc' },
    take: 100
  })

  // 2. PREPARE DATA
  const trades = rawTrades.map(trade => {
    // Helper to ensure numbers
    const grossVal = trade.pnl ? Number(trade.pnl) : 0
    const netVal = trade.netPnl ? Number(trade.netPnl) : 0
    const feesVal = trade.fees ? Number(trade.fees) : 0

    // Determine default display value based on user preference
    const defaultPnl = user?.showNetPnl ? netVal : grossVal

    return {
      ...trade,
      entryPrice: Number(trade.entryPrice),
      exitPrice: trade.exitPrice ? Number(trade.exitPrice) : null,
      stopLoss: Number(trade.stopLoss),
      quantity: Number(trade.quantity),

      // We pass the default preference to 'pnl' for initial render
      pnl: defaultPnl,

      // CRITICAL: We pass raw values so the UI can swap them later
      grossPnl: grossVal,
      netPnl: netVal,
      fees: feesVal,
    }
  })

  return (
    <main className="min-h-screen bg-zinc-50 dark:bg-zinc-950 relative">
      {/* ... Background Div ... */}
      <div
        className="absolute top-0 left-0 w-full h-[600px] bg-gradient-to-b from-emerald-500/10 via-transparent to-transparent dark:from-emerald-500/10 dark:via-transparent dark:to-transparent pointer-events-none z-0"
      />

      {/* Header */}
      <div className="fixed top-0 left-0 right-0 z-50 border-b border-border/40 bg-background/80 backdrop-blur-md shadow-sm">
        <div className="max-w-7xl mx-auto px-4 md:px-8 h-16 grid grid-cols-3 items-center">
          <div className="flex justify-start" />
          <div className="flex justify-center">
            <div className="relative h-8 w-28 md:h-10 md:w-40">
              <Image
                src="/TradeX-logo.svg"
                alt="TradeX"
                fill
                className="object-contain dark:invert dark:hue-rotate-180"
                priority
              />
            </div>
          </div>
          <div className="flex justify-end items-center gap-3">
            <div className="hidden md:block">
              <TradeDialog />
            </div>
            <div className="hidden md:block">
              <UserProfileMenu
                trades={trades}
                userEmail={session.user.email || undefined}
                userName={session.user.name || undefined}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="relative z-10 w-full flex justify-center pt-20">
        <AppDashboard
          trades={trades}
          userEmail={session.user.email || undefined}
          userName={session.user.name || undefined}
          // PASS THE PREFERENCE TO THE UI
          initialShowNetPnl={user?.showNetPnl ?? true}
        />
      </div>
    </main>
  )
}