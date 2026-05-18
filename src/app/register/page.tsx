"use client"

import Link from "next/link"
import Image from "next/image" // Required for the background images
import { toast } from "sonner"
import { useState, useEffect } from "react"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import { registerUser, verifyOtp } from "@/app/actions"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

// 1. Updated Quote Data with Background Images
// REPLACE these URLs with actual images of the people for the "Professional Touch"
const tradingQuotes = [
    {
        text: "The four most dangerous words in investing are: 'this time it's different.'",
        author: "Sir John Templeton",
        role: "Legendary Investor",
        // Placeholder: Man in suit / Business context
        image: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?q=80&w=2071&auto=format&fit=crop"
    },
    {
        text: "Risk comes from not knowing what you're doing.",
        author: "Warren Buffett",
        role: "CEO, Berkshire Hathaway",
        // Placeholder: Senior business executive context
        image: "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?q=80&w=2032&auto=format&fit=crop"
    },
    {
        text: "In trading, the discipline to follow your plan is just as important as the plan itself.",
        author: "Unknown Market Wizard",
        role: "Professional Trader",
        // Placeholder: Trading desk / Charts
        image: "https://images.unsplash.com/photo-1611974765270-ca1258634369?q=80&w=1920&auto=format&fit=crop"
    },
    {
        text: "Cut your losses short and let your winners run.",
        author: "Wall Street Adage",
        role: "Trading Principle",
        // Placeholder: Bull Market / Wall Street
        image: "https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?q=80&w=1920&auto=format&fit=crop"
    },
    {
        text: "This platform has completely transformed how I track my trades. The analytics are unmatched.",
        author: "Sofia Davis",
        role: "Verified Pro User",
        // Placeholder: Professional woman
        image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=1888&auto=format&fit=crop"
    }
];

export default function RegisterPage() {
    const [isLoading, setIsLoading] = useState(false)
    const [isGoogleLoading, setIsGoogleLoading] = useState(false)
    const [step, setStep] = useState<'register' | 'verify'>('register')
    const [email, setEmail] = useState("")

    // Carousel State
    const [currentQuoteIndex, setCurrentQuoteIndex] = useState(0);

    const router = useRouter()

    // Carousel Logic (Auto-play 6 seconds)
    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentQuoteIndex((prevIndex) => (prevIndex + 1) % tradingQuotes.length);
        }, 6000);

        return () => clearInterval(interval);
    }, []);

    const currentQuote = tradingQuotes[currentQuoteIndex];

    async function onRegisterSubmit(event: React.SyntheticEvent) {
        event.preventDefault()
        setIsLoading(true)

        const target = event.target as any
        const formData = {
            name: target.name.value,
            phone: target.phone.value,
            email: target.email.value,
            password: target.password.value,
        }

        const result = await registerUser(formData)

        if (result.success) {
            toast.success("OTP Sent! Please check your email.")
            setEmail(formData.email)
            setStep('verify')
        } else {
            toast.error(result.error)
        }
        setIsLoading(false)
    }

    async function onOtpSubmit(event: React.SyntheticEvent) {
        event.preventDefault()
        setIsLoading(true)
        const target = event.target as any
        const otp = target.otp.value

        const result = await verifyOtp(email, otp)

        if (result.success) {
            toast.success("Account Verified! Logging you in...")
            router.push("/login")
        } else {
            toast.error(result.error)
        }
        setIsLoading(false)
    }

    const onGoogleLogin = async () => {
        setIsGoogleLoading(true)
        await signIn("google", { callbackUrl: "/" })
    }

    return (
        <div className="w-full min-h-screen lg:grid lg:grid-cols-2">

            {/* --- LEFT SIDE (Carousel & Branding) --- */}
            <div className="hidden bg-zinc-950 lg:flex flex-col justify-between p-12 text-white border-r border-zinc-800 relative overflow-hidden">

                {/* 2. DYNAMIC BACKGROUND IMAGE LAYER */}
                {/* We use a key to force React to re-render the image when the index changes, triggering the animation */}
                <div key={currentQuoteIndex} className="absolute inset-0 z-0">
                    <Image
                        src={currentQuote.image}
                        alt="Background"
                        fill
                        className="object-cover opacity-60 animate-in fade-in zoom-in-105 duration-[2000ms]"
                        priority
                    />
                    {/* Dark Overlay for Text Readability */}
                    <div className="absolute inset-0 bg-zinc-950/60 mix-blend-multiply" />
                    <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-transparent to-zinc-950/40" />
                </div>

                {/* Logo */}
                <div className="relative z-10 flex items-center gap-3 font-bold text-2xl tracking-tight">
                    <Image src="/TradeX-logo.png" alt="TradeX Logo" width={100} height={100} />
                </div>

                {/* Quote Content */}
                <div className="relative z-10 mt-auto mb-10">
                    <div className="min-h-[140px] flex items-end">
                        <blockquote
                            key={currentQuoteIndex}
                            className="space-y-4 animate-in fade-in slide-in-from-right-8 duration-700"
                        >
                            <p className="text-xl md:text-2xl font-medium leading-relaxed tracking-tight text-white/95">
                                &ldquo;{currentQuote.text}&rdquo;
                            </p>
                            <footer className="space-y-1">
                                <div className="font-semibold text-white">{currentQuote.author}</div>
                                <div className="text-xs text-white/60 uppercase tracking-wider font-medium">{currentQuote.role}</div>
                            </footer>
                        </blockquote>
                    </div>

                    {/* Indicators */}
                    <div className="flex gap-2 mt-8">
                        {tradingQuotes.map((_, index) => (
                            <button
                                key={index}
                                onClick={() => setCurrentQuoteIndex(index)}
                                className={cn(
                                    "h-1 rounded-full transition-all duration-500",
                                    index === currentQuoteIndex
                                        ? "w-8 bg-white"
                                        : "w-2 bg-white/30 hover:bg-white/50"
                                )}
                                aria-label={`Go to quote ${index + 1}`}
                            />
                        ))}
                    </div>
                </div>

                {/* Copyright */}
                <div className="relative z-10 text-xs text-white/40">
                    © {new Date().getFullYear()} TradeX Inc. All rights reserved.
                </div>
            </div>

            {/* --- RIGHT SIDE (Form) - UNCHANGED --- */}
            <div className="flex items-center justify-center min-h-screen bg-zinc-50 dark:bg-zinc-950 p-6 lg:p-8">
                <div className="mx-auto w-full max-w-[420px] space-y-8">

                    {/* STEP 1: REGISTER */}
                    {step === 'register' ? (
                        <>
                            <div className="flex flex-col items-center text-center space-y-2">
                                <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">Create an account</h1>
                                <p className="text-zinc-500 dark:text-zinc-400 text-sm">Join thousands of traders improving their edge</p>
                            </div>

                            <form onSubmit={onRegisterSubmit} className="space-y-4">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="name">Full Name</Label>
                                        <Input id="name" name="name" required disabled={isLoading} className="h-11" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="phone">Phone</Label>
                                        <Input id="phone" name="phone" type="tel" disabled={isLoading} className="h-11" />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="email">Email</Label>
                                    <Input id="email" name="email" type="email" required disabled={isLoading} className="h-11" />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="password">Password</Label>
                                    <Input id="password" name="password" type="password" required disabled={isLoading} className="h-11" />
                                </div>

                                <Button disabled={isLoading} className="w-full h-11 bg-green-600 hover:bg-green-700 text-white font-semibold mt-2">
                                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    Create Account
                                </Button>
                            </form>

                            <div className="relative">
                                <div className="absolute inset-0 flex items-center">
                                    <span className="w-full border-t border-zinc-200 dark:border-zinc-800" />
                                </div>
                                <div className="relative flex justify-center text-xs uppercase">
                                    <span className="bg-zinc-50 dark:bg-zinc-950 px-2 text-muted-foreground">Or continue with</span>
                                </div>
                            </div>

                            <Button
                                variant="outline"
                                type="button"
                                disabled={isLoading || isGoogleLoading}
                                onClick={onGoogleLogin}
                                className="w-full h-11"
                            >
                                {isGoogleLoading ? (
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                ) : (
                                    <svg className="mr-2 h-4 w-4" aria-hidden="true" focusable="false" data-prefix="fab" data-icon="google" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512"><path fill="currentColor" d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"></path></svg>
                                )}
                                Google
                            </Button>

                            <p className="px-8 text-center text-sm text-muted-foreground">
                                Already have an account?{" "}
                                <Link
                                    href="/login"
                                    className="underline underline-offset-4 hover:text-primary font-semibold text-zinc-900 dark:text-zinc-100"
                                >
                                    Sign in
                                </Link>
                            </p>
                        </>
                    ) : (
                        /* STEP 2: VERIFY (Same as before) */
                        <div className="space-y-6 animate-in fade-in slide-in-from-right-8">
                            <div className="text-center space-y-2">
                                <h1 className="text-2xl font-bold">Check your email</h1>
                                <p className="text-sm text-zinc-500">
                                    We sent a 6-digit code to <span className="font-semibold text-zinc-900 dark:text-zinc-100">{email}</span>
                                </p>
                            </div>

                            <form onSubmit={onOtpSubmit} className="space-y-6">
                                <div className="space-y-2">
                                    <Label>One-Time Password</Label>
                                    <Input
                                        id="otp"
                                        name="otp"
                                        placeholder="123456"
                                        className="h-14 text-center text-2xl tracking-[0.5em] font-bold"
                                        maxLength={6}
                                        required
                                        autoFocus
                                    />
                                </div>

                                <Button disabled={isLoading} className="w-full h-12 bg-green-600 hover:bg-green-700 text-white font-semibold">
                                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    Verify Account
                                </Button>

                                <Button
                                    type="button"
                                    variant="ghost"
                                    onClick={() => setStep('register')}
                                    className="w-full text-zinc-500"
                                >
                                    Wrong email? Go back
                                </Button>
                            </form>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}