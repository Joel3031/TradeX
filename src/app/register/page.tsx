"use client"

import Link from "next/link"
import Image from "next/image"
import { toast } from "sonner"
import { useState } from "react"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import { registerUser, verifyOtp } from "@/app/actions" // Make sure verifyOtp is imported
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"

export default function RegisterPage() {
    const [isLoading, setIsLoading] = useState(false)
    const [isGoogleLoading, setIsGoogleLoading] = useState(false)

    // NEW: State to manage which step the user is on
    const [step, setStep] = useState<'register' | 'verify'>('register')
    const [email, setEmail] = useState("")

    const router = useRouter()

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
            // FIX: Don't redirect. Switch to OTP step.
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
            router.push("/login") // NOW we redirect
        } else {
            toast.error(result.error)
        }
        setIsLoading(false)
    }

    // ... Google Sign In function ...

    return (
        <div className="w-full min-h-screen lg:grid lg:grid-cols-2">

            {/* ... Left Side (Unchanged) ... */}
            <div className="hidden bg-zinc-950 lg:flex flex-col justify-between p-12 text-white border-r border-zinc-800 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-green-900/20 to-zinc-950 z-0 pointer-events-none" />
                <div className="relative z-10 flex items-center gap-3 font-bold text-2xl tracking-tight">
                    <Image src="/TradeX.svg" alt="TradeX Logo" width={40} height={40} className="h-10 w-10" />
                    TradeX
                </div>
                {/* ... quotes/footer ... */}
            </div>

            {/* --- RIGHT SIDE (Conditional Form) --- */}
            <div className="flex items-center justify-center min-h-screen bg-zinc-50 dark:bg-zinc-950 p-6 lg:p-8">
                <div className="mx-auto w-full max-w-[420px] space-y-8">

                    {/* STEP 1: REGISTRATION FORM */}
                    {step === 'register' ? (
                        <>
                            {/* Header */}
                            <div className="flex flex-col items-center text-center space-y-2">
                                <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">Create an account</h1>
                                <p className="text-zinc-500 dark:text-zinc-400 text-sm">Join thousands of traders improving their edge</p>
                            </div>

                            <form onSubmit={onRegisterSubmit} className="space-y-6">
                                {/* ... ALL YOUR EXISTING INPUTS (Name, Phone, Email, Password) ... */}
                                {/* Copy-paste the inputs from your previous file here */}
                                <div className="space-y-4">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="name" className="text-xs font-medium uppercase text-zinc-500 tracking-wider ml-1">Full Name</Label>
                                            <Input id="name" name="name" required disabled={isLoading} className="h-12 bg-white dark:bg-zinc-900/50 border-zinc-200 dark:border-zinc-800 rounded-xl" />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="phone" className="text-xs font-medium uppercase text-zinc-500 tracking-wider ml-1">Phone</Label>
                                            <Input id="phone" name="phone" type="tel" disabled={isLoading} className="h-12 bg-white dark:bg-zinc-900/50 border-zinc-200 dark:border-zinc-800 rounded-xl" />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="email" className="text-xs font-medium uppercase text-zinc-500 tracking-wider ml-1">Email</Label>
                                        <Input id="email" name="email" type="email" required disabled={isLoading} className="h-12 bg-white dark:bg-zinc-900/50 border-zinc-200 dark:border-zinc-800 rounded-xl" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="password" className="text-xs font-medium uppercase text-zinc-500 tracking-wider ml-1">Password</Label>
                                        <Input id="password" name="password" type="password" required disabled={isLoading} className="h-12 bg-white dark:bg-zinc-900/50 border-zinc-200 dark:border-zinc-800 rounded-xl" />
                                    </div>
                                </div>

                                <Button disabled={isLoading} className="w-full h-12 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-xl mt-2">
                                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    Create Account
                                </Button>
                            </form>

                            {/* ... Social Login & Login Link ... */}
                        </>
                    ) : (

                        /* STEP 2: OTP VERIFICATION FORM (This replaces the register form) */
                        <div className="space-y-6 animate-in fade-in slide-in-from-right-8">
                            <div className="text-center space-y-2">
                                <h1 className="text-2xl font-bold">Check your email</h1>
                                <p className="text-sm text-zinc-500">
                                    We sent a 6-digit code to <span className="font-semibold text-zinc-900 dark:text-zinc-100">{email}</span>
                                </p>
                            </div>

                            <form onSubmit={onOtpSubmit} className="space-y-6">
                                <div className="space-y-2">
                                    <Label className="text-xs font-medium uppercase text-zinc-500 tracking-wider ml-1">
                                        One-Time Password
                                    </Label>
                                    <Input
                                        id="otp"
                                        name="otp"
                                        placeholder="123456"
                                        className="h-14 text-center text-2xl tracking-[0.5em] font-bold bg-white dark:bg-zinc-900/50 border-zinc-200 dark:border-zinc-800 rounded-xl"
                                        maxLength={6}
                                        required
                                        autoFocus
                                    />
                                </div>

                                <Button disabled={isLoading} className="w-full h-12 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-xl">
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