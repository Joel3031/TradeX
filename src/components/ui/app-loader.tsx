"use client"

import { motion, Variants } from "framer-motion"
import { cn } from "@/lib/utils"

interface AppLoaderProps {
    variant?: "fullscreen" | "inline"
    className?: string
}

export function AppLoader({ variant = "fullscreen", className }: AppLoaderProps) {
    // Use 'currentColor' so the loader takes the color of the text (White or Green)
    const strokeColor = "currentColor"

    const draw: Variants = {
        hidden: { pathLength: 0, opacity: 0 },
        visible: (i: number) => ({
            pathLength: 1,
            opacity: 1,
            transition: {
                pathLength: { delay: i * 0.2, type: "spring", duration: 1.5, bounce: 0 },
                opacity: { delay: i * 0.2, duration: 0.01 }
            }
        })
    }

    const container: Variants = {
        hidden: { rotate: -180, scale: 0.5, opacity: 0 },
        visible: {
            rotate: 0,
            scale: 1,
            opacity: 1,
            transition: {
                duration: 1.8,
                ease: "anticipate"
            }
        }
    }

    // 1. FULLSCREEN MODE (Overlay)
    if (variant === "fullscreen") {
        return (
            <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-zinc-950/90 backdrop-blur-sm text-emerald-500">
                <motion.svg
                    width="120"
                    height="120"
                    viewBox="0 0 100 100"
                    initial="hidden"
                    animate="visible"
                    variants={container}
                    style={{ filter: `drop-shadow(0px 0px 10px rgba(16, 185, 129, 0.5))` }}
                >
                    {/* We hardcode the color here for fullscreen branding */}
                    <LoaderPaths color="#10b981" variants={draw} />
                </motion.svg>
            </div>
        )
    }

    // 2. INLINE MODE (For Buttons)
    return (
        <div className={cn("flex items-center justify-center", className)}>
            <motion.svg
                // Default to w-5 h-5 (20px) but allow overriding via className
                className="w-5 h-5"
                viewBox="0 0 100 100"
                initial="hidden"
                animate="visible"
                variants={container}
            >
                <LoaderPaths color={strokeColor} variants={draw} />
            </motion.svg>
        </div>
    )
}

// Helper component to keep the SVG paths clean
function LoaderPaths({ color, variants }: { color: string, variants: Variants }) {
    return (
        <>
            <motion.line
                x1="25" y1="25" x2="75" y2="75"
                stroke={color} strokeWidth="12" strokeLinecap="round"
                variants={variants} custom={0}
            />
            <motion.line
                x1="25" y1="75" x2="75" y2="25"
                stroke={color} strokeWidth="12" strokeLinecap="round"
                variants={variants} custom={0.4}
            />
            <motion.path
                d="M 50 25 L 75 25 L 75 50"
                fill="transparent" stroke={color} strokeWidth="12" strokeLinecap="round" strokeLinejoin="round"
                variants={variants} custom={0.8}
            />
        </>
    )
}