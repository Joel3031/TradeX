import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import Google from "next-auth/providers/google"
import { PrismaAdapter } from "@auth/prisma-adapter" // 1. IMPORT THIS
import { prisma } from "@/lib/db"
import bcrypt from "bcryptjs"
import { z } from "zod"

export const { handlers, auth, signIn, signOut } = NextAuth({
    // 2. CONNECT THE ADAPTER
    // This allows NextAuth to automatically save Google users to your database
    adapter: PrismaAdapter(prisma),

    // 3. FORCE JWT STRATEGY
    // Crucial: Because you use 'Credentials' (Email/Pass), you CANNOT use database sessions.
    // You must force "jwt" so both Google and Password login work together.
    session: { strategy: "jwt" },

    providers: [
        Google({
            clientId: process.env.AUTH_GOOGLE_ID,
            clientSecret: process.env.AUTH_GOOGLE_SECRET,
            allowDangerousEmailAccountLinking: true, // Optional: Links Google if email already exists
        }),

        Credentials({
            name: "credentials",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" },
            },
            async authorize(credentials) {
                const parsedCredentials = z
                    .object({ email: z.string().email(), password: z.string().min(6) })
                    .safeParse(credentials)

                if (!parsedCredentials.success) return null

                const { email, password } = parsedCredentials.data

                const user = await prisma.user.findUnique({
                    where: { email },
                })

                if (!user || !user.password) return null

                if (!user.isVerified) {
                    throw new Error("Please verify your email address before logging in.")
                }

                const passwordsMatch = await bcrypt.compare(password, user.password)

                if (passwordsMatch) return user

                console.log("Invalid password")
                return null
            },
        }),
    ],

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

    pages: {
        signIn: "/login",
    },
})