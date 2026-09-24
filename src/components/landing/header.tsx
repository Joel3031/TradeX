"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Download, Menu, X, ArrowRight, LayoutDashboard, LogIn } from "lucide-react"
import { usePWAInstall } from "@/hooks/use-pwa-install"
import { PWAInstallModal } from "./pwa-install-modal"

interface HeaderProps {
  isAuthenticated?: boolean
}

export function Header({ isAuthenticated }: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const { canInstall, isInstalled, isIOS, showModal, setShowModal, triggerInstall } = usePWAInstall()

  const navLinks = [
    { name: "Features", href: "#features" },
    { name: "Trade Types", href: "#trade-types" },
    { name: "Screenshots", href: "#showcase" },
    { name: "How It Works", href: "#how-it-works" },
    { name: "Why Journal?", href: "#why-journal" },
  ]

  return (
    <header className="sticky top-0 z-50 w-full backdrop-blur-md bg-zinc-950/90 border-b border-zinc-800/80 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between">
        
        {/* LOGO */}
        <Link href="/" className="flex items-center gap-2 group">
          <div className="relative h-8 w-28 sm:h-9 sm:w-36 transition-transform group-hover:scale-105">
            <Image
              src="/TradeX-logo.png"
              alt="TradeX Logo"
              fill
              className="object-contain dark:invert dark:hue-rotate-180"
              priority
            />
          </div>
        </Link>

        {/* DESKTOP NAV LINKS */}
        <nav className="hidden md:flex items-center gap-6 lg:gap-8">
          {navLinks.map((link) => (
            <a
              key={link.name}
              href={link.href}
              className="text-sm font-medium text-zinc-400 hover:text-emerald-400 transition-colors"
            >
              {link.name}
            </a>
          ))}
        </nav>

        {/* DESKTOP CTA BUTTONS */}
        <div className="hidden md:flex items-center gap-3">
          {!isInstalled && (
            <Button
              variant="outline"
              size="sm"
              onClick={triggerInstall}
              className="bg-zinc-900 border-zinc-800 text-zinc-300 hover:bg-zinc-800 hover:text-white rounded-xl text-xs gap-1.5 font-medium transition-all"
            >
              <Download className="h-3.5 w-3.5 text-emerald-400" />
              <span>Install Web App</span>
            </Button>
          )}

          {isAuthenticated ? (
            <Button
              asChild
              size="sm"
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-medium rounded-xl text-xs gap-1.5 shadow-lg shadow-emerald-950/40"
            >
              <Link href="/app">
                <LayoutDashboard className="h-3.5 w-3.5" />
                <span>Go to Dashboard</span>
              </Link>
            </Button>
          ) : (
            <Button
              asChild
              size="sm"
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-medium rounded-xl text-xs gap-1.5 shadow-lg shadow-emerald-950/40"
            >
              <Link href="/login">
                <LogIn className="h-3.5 w-3.5" />
                <span>Sign In</span>
              </Link>
            </Button>
          )}
        </div>

        {/* MOBILE MENU TOGGLE */}
        <div className="flex md:hidden items-center gap-2">
          {!isInstalled && (
            <Button
              variant="outline"
              size="sm"
              onClick={triggerInstall}
              className="h-8 px-2.5 bg-zinc-900 border-zinc-800 text-zinc-300 rounded-lg text-xs gap-1"
            >
              <Download className="h-3 w-3 text-emerald-400" />
              <span>App</span>
            </Button>
          )}

          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="text-zinc-300 hover:text-white hover:bg-zinc-900 rounded-lg h-9 w-9"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {/* MOBILE MENU DRAWER */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-zinc-800 bg-zinc-950/95 backdrop-blur-xl px-4 pt-3 pb-6 space-y-4">
          <nav className="flex flex-col space-y-3">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="text-sm font-medium text-zinc-300 hover:text-emerald-400 py-1 transition-colors"
              >
                {link.name}
              </a>
            ))}
          </nav>

          <div className="pt-3 border-t border-zinc-800/80 flex flex-col gap-2.5">
            {isAuthenticated ? (
              <Button
                asChild
                className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-medium rounded-xl justify-center gap-2"
              >
                <Link href="/app" onClick={() => setMobileMenuOpen(false)}>
                  <LayoutDashboard className="h-4 w-4" />
                  <span>Go to Dashboard</span>
                </Link>
              </Button>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <Button
                  asChild
                  variant="outline"
                  className="bg-zinc-900 border-zinc-800 text-zinc-200 hover:bg-zinc-800 rounded-xl justify-center text-xs"
                >
                  <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                    Sign In
                  </Link>
                </Button>
                <Button
                  asChild
                  className="bg-emerald-600 hover:bg-emerald-500 text-white font-medium rounded-xl justify-center text-xs"
                >
                  <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                    Get Started
                  </Link>
                </Button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* PWA INSTALL MODAL */}
      <PWAInstallModal
        open={showModal}
        onOpenChange={setShowModal}
        isIOS={isIOS}
      />
    </header>
  )
}
