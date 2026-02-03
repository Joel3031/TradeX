import NextAuth from "next-auth"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from "@/lib/db"
import Google from "next-auth/providers/google"
import Credentials from "next-auth/providers/credentials"
import bcrypt from "bcryptjs"

export const { handlers, signIn, signOut, auth } = NextAuth({
    adapter: PrismaAdapter(prisma),
    session: { strategy: "jwt" },
    providers: [
        Google({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        }),
        Credentials({
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" }
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) return null

                const user = await prisma.user.findUnique({
                    where: { email: credentials.email as string }
                })

                // @ts-ignore: Password field exists in DB but might be missing in generated types temporarily
                if (!user || !user.password) {
                    throw new Error("No user found with this email")
                }

                const isValid = await bcrypt.compare(
                    credentials.password as string,
                    // @ts-ignore: Same here
                    user.password
                )

                if (!isValid) throw new Error("Incorrect password")

                return user
            }
        })
    ],
    pages: {
        signIn: "/login",
    },
    callbacks: {
        session({ session, token }) {
            if (session.user && token.sub) {
                session.user.id = token.sub
            }
            return session
        },
        jwt({ token, user }) {
            if (user) {
                token.sub = user.id
            }
            return token // <--- FIX: YOU MUST RETURN THE TOKEN HERE
        }
    },
})