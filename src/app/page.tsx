import { prisma } from "@/lib/db"
import { auth } from "@/auth"
import { TradeDialog } from "@/components/trade-dialog"
import { UserProfileMenu } from "@/components/user-profile-menu"
import { DesktopDashboard } from "@/components/desktop-dashboard"
import { MobileDashboard } from "@/components/mobile-dashboard"
import { redirect } from "next/navigation"
import Image from "next/image"

export const dynamic = 'force-dynamic'

export default async function Home() {
  const session = await auth()

  if (!session?.user) {
    redirect("/login")
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { showNetPnl: true, email: true, name: true }
  })

  const rawTrades = await prisma.trade.findMany({
    where: { userId: session.user.id },
    orderBy: { entryDate: 'desc' }
  })

  const trades = rawTrades.map(trade => {
    const grossVal = trade.pnl ? Number(trade.pnl) : 0
    const netVal = trade.netPnl ? Number(trade.netPnl) : 0
    const feesVal = trade.fees ? Number(trade.fees) : 0
    const defaultPnl = user?.showNetPnl ? netVal : grossVal

    return {
      ...trade,
      entryPrice: Number(trade.entryPrice),
      exitPrice: trade.exitPrice ? Number(trade.exitPrice) : null,
      stopLoss: Number(trade.stopLoss),
      quantity: Number(trade.quantity),
      pnl: defaultPnl,
      grossPnl: grossVal,
      netPnl: netVal,
      fees: feesVal,
    }
  })

  const dashboardProps = {
    trades,
    userEmail: session.user.email || undefined,
    userName: session.user.name || undefined,
    initialShowNetPnl: user?.showNetPnl ?? true
  }

  return (
    <main className="min-h-screen bg-zinc-50 dark:bg-zinc-950 relative">
      <div className="absolute top-0 left-0 w-full h-[600px] bg-gradient-to-b from-emerald-500/10 via-transparent to-transparent dark:from-emerald-500/10 dark:via-transparent dark:to-transparent pointer-events-none z-0" />

      {/* FIXED TOP HEADER BAR FOR DESKTOP */}
      <div className="fixed top-0 left-0 right-0 z-50 border-b border-border/40 bg-background/80 backdrop-blur-md shadow-sm">
        <div className="max-w-7xl mx-auto px-4 md:px-8 h-16 grid grid-cols-3 items-center">
          <div className="flex justify-start" />
          <div className="flex justify-center">
            <div className="relative h-8 w-28 md:h-10 md:w-40">
              <Image
                src="/TradeX-logo.png"
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

      {/* Renders Desktop Dashboard on medium screens and up */}
      <div className="hidden md:block relative z-10 pt-20">
        <DesktopDashboard {...dashboardProps} />
      </div>

      {/* Renders Mobile Dashboard on smaller screens */}
      <div className="block md:hidden relative z-10">
        <MobileDashboard {...dashboardProps} />
      </div>
    </main>
  )
}