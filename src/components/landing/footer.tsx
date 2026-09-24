import Link from "next/link"
import Image from "next/image"
import { ShieldCheck } from "lucide-react"

export function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-zinc-950 border-t border-zinc-900 text-zinc-400 py-12 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* COL 1: BRANDING */}
          <div className="space-y-3 md:col-span-1">
            <Link href="/" className="inline-block">
              <div className="relative h-8 w-32">
                <Image
                  src="/TradeX-logo.png"
                  alt="TradeX Logo"
                  fill
                  className="object-contain dark:invert dark:hue-rotate-180"
                />
              </div>
            </Link>
            <p className="text-zinc-400 leading-relaxed text-xs">
              Professional trading journal and performance analytics platform for Intraday, Options, and Delivery traders.
            </p>
          </div>

          {/* COL 2: PRODUCT NAVIGATION */}
          <div className="space-y-2.5">
            <p className="text-zinc-200 font-semibold uppercase tracking-wider text-[11px]">Platform</p>
            <ul className="space-y-2 text-zinc-400">
              <li><a href="#features" className="hover:text-emerald-400 transition-colors">Features</a></li>
              <li><a href="#trade-types" className="hover:text-emerald-400 transition-colors">Supported Trade Types</a></li>
              <li><a href="#showcase" className="hover:text-emerald-400 transition-colors">Product Showcase</a></li>
              <li><a href="#how-it-works" className="hover:text-emerald-400 transition-colors">How It Works</a></li>
              <li><a href="#why-journal" className="hover:text-emerald-400 transition-colors">Why Journal?</a></li>
            </ul>
          </div>

          {/* COL 3: APPLICATION LINKS */}
          <div className="space-y-2.5">
            <p className="text-zinc-200 font-semibold uppercase tracking-wider text-[11px]">Application</p>
            <ul className="space-y-2 text-zinc-400">
              <li><Link href="/login" className="hover:text-emerald-400 transition-colors">Sign In</Link></li>
              <li><Link href="/register" className="hover:text-emerald-400 transition-colors">Create Account</Link></li>
              <li><Link href="/app" className="hover:text-emerald-400 transition-colors">App Dashboard</Link></li>
              <li><a href="#install" className="hover:text-emerald-400 transition-colors">Web App Setup</a></li>
            </ul>
          </div>

          {/* COL 4: LEGAL & DISCLAIMER */}
          <div className="space-y-2.5">
            <p className="text-zinc-200 font-semibold uppercase tracking-wider text-[11px]">Transparency & Legal</p>
            <ul className="space-y-2 text-zinc-400">
              <li><a href="#" className="hover:text-zinc-200 transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-zinc-200 transition-colors">Terms of Service</a></li>
              <li><a href="#" className="hover:text-zinc-200 transition-colors">Support & Contact</a></li>
            </ul>
            <p className="text-[11px] text-zinc-500 pt-2 leading-relaxed">
              TradeX is a analytical logging tool for performance evaluation and trading discipline. It does not provide investment advice or financial guarantees.
            </p>
          </div>

        </div>

        {/* BOTTOM COPYRIGHT */}
        <div className="pt-8 border-t border-zinc-900 flex flex-col sm:flex-row items-center justify-between gap-4 text-zinc-500">
          <p>© {currentYear} TradeX Inc. All rights reserved.</p>
          <div className="flex items-center gap-2 text-[11px] text-zinc-400">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
            <span>Built for process & discipline</span>
          </div>
        </div>

      </div>
    </footer>
  )
}
