"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Smartphone, Share, PlusSquare, Monitor, CheckCircle2 } from "lucide-react"

interface PWAInstallModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  isIOS: boolean
}

export function PWAInstallModal({ open, onOpenChange, isIOS }: PWAInstallModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-zinc-950 border-zinc-800 text-zinc-100 max-w-md p-6 rounded-2xl shadow-2xl">
        <DialogHeader className="space-y-2 text-left">
          <div className="flex items-center gap-2 text-emerald-400 text-sm font-semibold uppercase tracking-wider">
            <Smartphone className="h-4 w-4" />
            <span>Web App Installation</span>
          </div>
          <DialogTitle className="text-xl font-bold text-white">
            {isIOS ? "Install TradeX on iPhone / iPad" : "Install TradeX on Your Device"}
          </DialogTitle>
          <DialogDescription className="text-zinc-400 text-sm">
            Enjoy a full-screen, app-like experience with quick home screen access.
          </DialogDescription>
        </DialogHeader>

        {isIOS ? (
          <div className="space-y-4 py-2">
            <div className="p-4 rounded-xl bg-zinc-900/80 border border-zinc-800 space-y-3">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 font-bold shrink-0">1</div>
                <div>
                  <p className="text-sm font-medium text-zinc-200">Tap the Share Button</p>
                  <p className="text-xs text-zinc-400">Located at the bottom of Safari browser bar.</p>
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 mt-1 rounded bg-zinc-800 text-xs text-zinc-300">
                    <Share className="h-3.5 w-3.5 text-blue-400" /> Share Icon
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3 pt-2 border-t border-zinc-800/60">
                <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 font-bold shrink-0">2</div>
                <div>
                  <p className="text-sm font-medium text-zinc-200">Select &quot;Add to Home Screen&quot;</p>
                  <p className="text-xs text-zinc-400">Scroll down the share menu options.</p>
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 mt-1 rounded bg-zinc-800 text-xs text-zinc-300">
                    <PlusSquare className="h-3.5 w-3.5 text-emerald-400" /> Add to Home Screen
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3 pt-2 border-t border-zinc-800/60">
                <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 font-bold shrink-0">3</div>
                <div>
                  <p className="text-sm font-medium text-zinc-200">Tap &quot;Add&quot; in Top Right</p>
                  <p className="text-xs text-zinc-400">TradeX icon will appear on your home screen instantly.</p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4 py-2">
            <div className="p-4 rounded-xl bg-zinc-900/80 border border-zinc-800 space-y-3">
              <div className="flex items-center gap-3">
                <Monitor className="h-5 w-5 text-emerald-400" />
                <div>
                  <p className="text-sm font-medium text-zinc-200">Chrome / Edge / Android</p>
                  <p className="text-xs text-zinc-400">Look for the install icon in your address bar or browser menu (⋮ / ⋯) &gt; Install TradeX.</p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-xs text-emerald-400 pt-2 border-t border-zinc-800">
                <CheckCircle2 className="h-4 w-4" />
                <span>Works offline, loads fast, no store downloads needed.</span>
              </div>
            </div>
          </div>
        )}

        <div className="flex justify-end pt-2">
          <Button 
            onClick={() => onOpenChange(false)}
            className="bg-emerald-600 hover:bg-emerald-500 text-white font-medium rounded-xl"
          >
            Got it
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
