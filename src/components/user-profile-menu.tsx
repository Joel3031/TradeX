"use client"

import { signOut } from "next-auth/react"
import { useTheme } from "next-themes"
import { ReportDownloader } from "@/components/dashboard/report-downloader"
import { ImportTrades } from "@/components/dashboard/import-trades"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { LogOut, Sun, Moon, User } from "lucide-react"

interface UserProfileMenuProps {
    trades: any[]
    userEmail?: string
    userName?: string
}

export function UserProfileMenu({ trades, userEmail, userName }: UserProfileMenuProps) {
    const { setTheme } = useTheme()

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                    <Avatar className="h-9 w-9 border border-zinc-200 dark:border-zinc-800 shadow-sm">
                        {/* Replace src with session user image if available */}
                        <AvatarImage src="/avatars/01.png" alt="User" />
                        <AvatarFallback className="bg-green-600 text-white font-bold">
                            {userName ? userName.substring(0, 2).toUpperCase() : "TR"}
                        </AvatarFallback>
                    </Avatar>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-64" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">{userName || "Trader"}</p>
                        <p className="text-xs leading-none text-muted-foreground">{userEmail || "user@tradex.com"}</p>
                    </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />

                {/* DATA MANAGEMENT */}
                <div className="p-2 space-y-2">
                    <p className="text-[10px] uppercase text-muted-foreground font-semibold ml-1">Data</p>
                    <div className="flex items-center gap-2">
                        <div className="flex-1">
                            <ImportTrades />
                        </div>
                        <div className="flex-1">
                            <ReportDownloader trades={trades} />
                        </div>
                    </div>
                </div>
                <DropdownMenuSeparator />

                {/* THEME TOGGLE */}
                <p className="text-[10px] uppercase text-muted-foreground font-semibold mt-2 mb-1 ml-3">Theme</p>
                <DropdownMenuItem onClick={() => setTheme("light")} className="cursor-pointer">
                    <Sun className="mr-2 h-4 w-4" />
                    <span>Light Mode</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme("dark")} className="cursor-pointer">
                    <Moon className="mr-2 h-4 w-4" />
                    <span>Dark Mode</span>
                </DropdownMenuItem>

                <DropdownMenuSeparator />

                {/* LOGOUT */}
                <DropdownMenuItem
                    className="text-red-600 focus:text-red-600 focus:bg-red-50 dark:focus:bg-red-900/10 cursor-pointer"
                    onClick={() => signOut()}
                >
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}