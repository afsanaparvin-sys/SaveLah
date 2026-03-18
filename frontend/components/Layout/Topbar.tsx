"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Bell, Search, ChevronDown, User, LogOut } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export function Topbar() {
  const [hasNotifications] = useState(true)
  const router = useRouter()

  const handleSignOut = () => {
    // Clear any auth tokens/session here when real auth is added
    router.push("/Login")
  }

  return (
    <header
      className="sticky top-0 z-30 flex h-16 items-center justify-between px-6"
      style={{
        background: "#ffffff",
        borderBottom: "1px solid #E5EAF0",
        fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
      }}
    >
      {/* Search */}
      <div className="relative w-full max-w-md">
        <Search
          className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2"
          style={{ color: "#6B7F8E" }}
        />
        <Input
          type="search"
          placeholder="Search goals, transactions..."
          className="h-10 w-full pl-10 text-sm border-0 focus-visible:ring-1"
          style={{
            background: "#F4F6F8",
            color: "#0F1923",
            borderRadius: 8,
          }}
        />
      </div>

      {/* Right side */}
      <div className="flex items-center gap-3">
        {/* Notifications */}
        <button
          className="relative flex items-center justify-center rounded-lg transition-colors"
          style={{ width: 38, height: 38, background: "transparent", border: "none", cursor: "pointer" }}
          onMouseEnter={(e) => (e.currentTarget.style.background = "#F4F6F8")}
          onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
        >
          <Bell className="h-5 w-5" style={{ color: "#6B7F8E" }} />
          {hasNotifications && (
            <span className="absolute right-2 top-2 h-2 w-2 rounded-full" style={{ background: "#EF4444" }} />
          )}
        </button>

        {/* User menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="flex items-center gap-2 px-2 rounded-lg transition-colors"
              style={{ background: "transparent", border: "none" }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "#F4F6F8")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
            >
              <Avatar className="h-8 w-8">
                <AvatarImage src="/avatar.jpg" alt="User" />
                <AvatarFallback className="text-sm font-bold" style={{ background: "#2DD4BF", color: "#0F1923" }}>
                  JD
                </AvatarFallback>
              </Avatar>
              <div className="hidden text-left md:block">
                <p className="text-sm font-medium" style={{ color: "#0F1923" }}>John Doe</p>
                <p className="text-xs" style={{ color: "#6B7F8E" }}>john@example.com</p>
              </div>
              <ChevronDown className="h-4 w-4" style={{ color: "#6B7F8E" }} />
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent
            align="end"
            className="w-56"
            style={{
              background: "#ffffff",
              border: "1px solid #E5EAF0",
              borderRadius: 10,
              boxShadow: "0 8px 24px rgba(0,0,0,0.08)",
            }}
          >
            <DropdownMenuItem
              className="flex items-center gap-2 cursor-pointer rounded-md transition-colors"
              style={{ color: "#374151" }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "#F4F6F8")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
              onClick={() => router.push("/ProfilePage")}
            >
              <User className="h-4 w-4" />
              Profile
            </DropdownMenuItem>

            <DropdownMenuSeparator style={{ background: "#E5EAF0" }} />

            <DropdownMenuItem
              className="flex items-center gap-2 cursor-pointer rounded-md transition-colors"
              style={{ color: "#EF4444" }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "#FEF2F2")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
              onClick={handleSignOut}
            >
              <LogOut className="h-4 w-4" />
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}