import { prisma } from "@/lib/db"
import { auth, signOut } from "@/auth"
import { Button } from "@/components/ui/button"
import { ModeToggle } from "@/components/mode-toggle"
import { TradeDialog } from "@/components/trade-dialog"
import { AppDashboard } from "@/components/app-dashboard"
import { redirect } from "next/navigation"
import Image from "next/image"
import { LogOut } from "lucide-react"

export const dynamic = 'force-dynamic'

export default async function Home() {
  const session = await auth()

  if (!session?.user) {
    redirect("/login")
  }

  const rawTrades = await prisma.trade.findMany({
    where: { userId: session.user.id },
    orderBy: { entryDate: 'desc' },
    take: 100
  })

  const trades = rawTrades.map(trade => ({
    ...trade,
    entryPrice: Number(trade.entryPrice),
    exitPrice: trade.exitPrice ? Number(trade.exitPrice) : null,
    stopLoss: Number(trade.stopLoss),
    pnl: trade.pnl ? Number(trade.pnl) : null,
    quantity: Number(trade.quantity),
  }))

  return (
    <main className="min-h-screen bg-zinc-50 dark:bg-zinc-950 relative">

      {/* Gradient Background */}
      <div
        className="absolute top-0 left-0 w-full h-[600px] bg-gradient-to-b from-emerald-500/10 via-transparent to-transparent dark:from-emerald-500/10 dark:via-transparent dark:to-transparent pointer-events-none z-0"
      />

      {/* Header */}
      <div className="fixed top-0 left-0 right-0 z-50 border-b border-border/40 bg-background/80 backdrop-blur-md shadow-sm">
        <div className="max-w-7xl mx-auto px-4 md:px-8 h-16 grid grid-cols-3 items-center">

          {/* LEFT: Sign Out Icon */}
          <div className="flex justify-start">
            <form action={async () => {
              "use server"
              await signOut()
            }}>
              <Button variant="ghost" size="icon" className="h-9 w-9 text-muted-foreground hover:text-foreground">
                <LogOut className="h-5 w-5" />
                <span className="sr-only">Sign out</span>
              </Button>
            </form>
          </div>

          {/* CENTER: Logo */}
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

          {/* RIGHT: Tools */}
          <div className="flex justify-end gap-2">
            <ModeToggle />
            <div className="hidden md:block">
              <TradeDialog />
            </div>
          </div>
        </div>
      </div>

      <div className="relative z-10 w-full flex justify-center pt-20">
        <AppDashboard trades={trades} />
      </div>

    </main>
  )
}