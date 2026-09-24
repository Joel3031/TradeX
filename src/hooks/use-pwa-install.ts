"use client"

import { useState, useEffect } from "react"

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>
}

export function usePWAInstall() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [isInstalled, setIsInstalled] = useState(false)
  const [isIOS, setIsIOS] = useState(false)
  const [showModal, setShowModal] = useState(false)

  useEffect(() => {
    // Check if already in standalone mode
    if (typeof window !== "undefined") {
      const isStandalone = window.matchMedia("(display-mode: standalone)").matches ||
        (window.navigator as any).standalone === true

      if (isStandalone) {
        setIsInstalled(true)
      }

      // Check for iOS device
      const userAgent = window.navigator.userAgent.toLowerCase()
      const isIosDevice = /iphone|ipad|ipod/.test(userAgent)
      setIsIOS(isIosDevice)

      // Listen for browser install prompt
      const handleBeforeInstallPrompt = (e: Event) => {
        e.preventDefault()
        setDeferredPrompt(e as BeforeInstallPromptEvent)
      }

      window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt)

      return () => {
        window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt)
      }
    }
  }, [])

  const triggerInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt()
      const { outcome } = await deferredPrompt.userChoice
      if (outcome === "accepted") {
        setIsInstalled(true)
        setDeferredPrompt(null)
      }
    } else {
      // Open iOS / Fallback instruction modal
      setShowModal(true)
    }
  }

  return {
    canInstall: !!deferredPrompt || isIOS,
    isInstalled,
    isIOS,
    showModal,
    setShowModal,
    triggerInstall
  }
}
