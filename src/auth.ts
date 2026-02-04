import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import Google from "next-auth/providers/google"
import { prisma } from "@/lib/db"
import bcrypt from "bcryptjs"
import { z } from "zod"

export const { handlers, auth, signIn, signOut } = NextAuth({
    // 1. Configure Providers
    providers: [
        // Google Provider (Optional, if you use it)
        Google({
            clientId: process.env.AUTH_GOOGLE_ID,
            clientSecret: process.env.AUTH_GOOGLE_SECRET,
        }),

        // Credentials Provider (Email/Password)
        Credentials({
            name: "credentials",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" },
            },
            async authorize(credentials) {
                // A. Validate Input
                const parsedCredentials = z
                    .object({ email: z.string().email(), password: z.string().min(6) })
                    .safeParse(credentials)

                if (!parsedCredentials.success) return null

                const { email, password } = parsedCredentials.data

                // B. Find User in DB
                const user = await prisma.user.findUnique({
                    where: { email },
                })

                if (!user || !user.password) return null

                // C. Check Verification Status (CRITICAL STEP)
                // If the user hasn't entered the OTP yet, block them.
                if (!user.isVerified) {
                    throw new Error("Please verify your email address before logging in.")
                }

                // D. Verify Password
                const passwordsMatch = await bcrypt.compare(password, user.password)

                if (passwordsMatch) {
                    // Return user object (NextAuth will save this to the session)
                    return user
                }

                console.log("Invalid password")
                return null
            },
        }),
    ],

    // 2. Customize Session (To ensure User ID is available)
    callbacks: {
        async session({ session, token }) {
            if (token.sub && session.user) {
                session.user.id = token.sub
            }
            return session
        },
        async jwt({ token }) {
            return token
        },
    },

    // 3. Pages Configuration
    pages: {
        signIn: "/login", // Redirect here if unauthorized
    },
})