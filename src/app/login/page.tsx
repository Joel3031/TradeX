"use client"

import Link from "next/link"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import Image from "next/image"

export default function LoginPage() {
    const [isLoading, setIsLoading] = useState(false)
    const [isGoogleLoading, setIsGoogleLoading] = useState(false)
    const router = useRouter()

    async function onSubmit(event: React.SyntheticEvent) {
        event.preventDefault()
        setIsLoading(true)

        const target = event.target as typeof event.target & {
            email: { value: string };
            password: { value: string };
        };

        const result = await signIn("credentials", {
            email: target.email.value,
            password: target.password.value,
            redirect: false,
        })

        if (result?.error) {
            toast.error("Invalid email or password")
            setIsLoading(false)
        } else {
            toast.success("Welcome back!")
            router.refresh()
            router.push("/")
        }
    }

    async function onGoogleLogin() {
        setIsGoogleLoading(true)
        try {
            await signIn("google", { callbackUrl: "/" })
        } catch (error) {
            toast.error("Something went wrong with Google Login")
        } finally {
            setIsGoogleLoading(false)
        }
    }

    return (
        <div className="w-full min-h-screen lg:grid lg:grid-cols-2">

            {/* --- LEFT SIDE (Desktop Branding) --- */}
            <div className="hidden bg-zinc-950 lg:flex flex-col justify-between p-12 text-white border-r border-zinc-800 relative overflow-hidden">
                {/* Background Gradient Effect */}
                <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-green-900/20 to-zinc-950 z-0 pointer-events-none" />

                <div className="relative z-10 flex items-center gap-3 font-bold text-2xl tracking-tight">
                    <Image
                        src="/TradeX.svg"
                        alt="TradeX Logo"
                        width={40}
                        height={40}
                        className="h-10 w-10"
                    />
                    TradeX
                </div>

                <div className="relative z-10 space-y-4 max-w-lg">
                    <blockquote className="space-y-4">
                        <p className="text-2xl font-medium leading-relaxed text-zinc-200">
                            &ldquo;The goal of a successful trader is to make the best trades. Money is secondary.&rdquo;
                        </p>
                        <footer className="text-base text-zinc-500 font-medium">— Alexander Elder</footer>
                    </blockquote>
                </div>

                <div className="relative z-10 text-sm text-zinc-600">
                    © 2026 TradeX Inc.
                </div>
            </div>

            {/* --- RIGHT SIDE (Login Form) --- */}
            <div className="flex items-center justify-center min-h-screen bg-zinc-50 dark:bg-zinc-950 p-6 lg:p-8">
                <div className="mx-auto w-full max-w-[380px] space-y-8">

                    {/* MOBILE LOGO & HEADER */}
                    <div className="flex flex-col items-center text-center space-y-2">
                        {/* Logo visible on mobile now */}
                        <div className="lg:hidden mb-4 p-3 bg-zinc-100 dark:bg-zinc-900 rounded-2xl shadow-sm">
                            <Image
                                src="/TradeX-logo.svg"
                                alt="TradeX Logo"
                                width={48}
                                height={48}
                                className="h-auto w-40"
                            />
                        </div>
                        <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
                            Welcome back
                        </h1>
                        <p className="text-zinc-500 dark:text-zinc-400 text-sm">
                            Enter your details to access your journal
                        </p>
                    </div>

                    {/* FORM */}
                    <form onSubmit={onSubmit} className="space-y-6">
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="email" className="text-xs font-medium uppercase text-zinc-500 tracking-wider ml-1">Email</Label>
                                <Input
                                    id="email"
                                    name="email"
                                    placeholder="name@example.com"
                                    type="email"
                                    required
                                    disabled={isLoading || isGoogleLoading}
                                    className="h-12 bg-white dark:bg-zinc-900/50 border-zinc-200 dark:border-zinc-800 focus:border-green-500 focus:ring-green-500/20 rounded-xl transition-all"
                                />
                            </div>
                            <div className="space-y-2">
                                <div className="flex items-center justify-between ml-1">
                                    <Label htmlFor="password" className="text-xs font-medium uppercase text-zinc-500 tracking-wider">Password</Label>
                                    <Link href="#" className="text-xs font-medium text-green-600 hover:text-green-500 transition-colors">
                                        Forgot Password?
                                    </Link>
                                </div>
                                <Input
                                    id="password"
                                    name="password"
                                    type="password"
                                    placeholder="••••••••"
                                    required
                                    disabled={isLoading || isGoogleLoading}
                                    className="h-12 bg-white dark:bg-zinc-900/50 border-zinc-200 dark:border-zinc-800 focus:border-green-500 focus:ring-green-500/20 rounded-xl transition-all"
                                />
                            </div>
                        </div>

                        <Button
                            disabled={isLoading || isGoogleLoading}
                            className="w-full h-12 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-xl text-base shadow-lg shadow-green-900/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
                        >
                            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Sign In
                        </Button>
                    </form>

                    {/* DIVIDER */}
                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <span className="w-full border-t border-zinc-200 dark:border-zinc-800" />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-zinc-50 dark:bg-zinc-950 px-4 text-zinc-400 font-medium">
                                Or continue with
                            </span>
                        </div>
                    </div>

                    {/* SOCIAL LOGIN */}
                    <Button
                        variant="outline"
                        type="button"
                        onClick={onGoogleLogin}
                        disabled={isLoading || isGoogleLoading}
                        className="w-full h-12 bg-white dark:bg-zinc-900 hover:bg-zinc-50 dark:hover:bg-zinc-800 border-zinc-200 dark:border-zinc-800 rounded-xl font-medium transition-all"
                    >
                        {isGoogleLoading ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                            <div className="flex items-center gap-2">
                                {/* Simple Google G Icon SVG */}
                                <svg className="h-5 w-5" aria-hidden="true" focusable="false" data-prefix="fab" data-icon="google" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512"><path fill="currentColor" d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"></path></svg>
                                Google
                            </div>
                        )}
                    </Button>

                    <p className="text-center text-sm text-zinc-500">
                        Don't have an account?{" "}
                        <Link href="/register" className="font-semibold text-green-600 hover:text-green-500 hover:underline transition-all">
                            Sign up
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    )
}