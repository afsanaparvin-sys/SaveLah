"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  Target,
  CreditCard,
  RefreshCw,
  Activity,
  ArrowDownCircle,
} from "lucide-react"
import { cn } from "@/lib/utils"

const navItems = [
  { href: "/Dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/GoalsPage", label: "Goals", icon: Target },
  { href: "/PaymentsPage", label: "Payments", icon: CreditCard },
  { href: "/TransfersPage", label: "Auto Transfers", icon: RefreshCw },
  { href: "/ActivityPage", label: "Activity", icon: Activity },
  { href: "/WithdrawPage", label: "Withdraw", icon: ArrowDownCircle },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside
      className="fixed left-0 top-0 z-40 h-screen w-64 flex flex-col"
      style={{ background: "#0F1923", color: "#fff", fontFamily: "'DM Sans', 'Segoe UI', sans-serif" }}
    >
      {/* Logo */}
      <div
        className="flex h-16 items-center gap-3 px-6"
        style={{ borderBottom: "1px solid #1E2D3D" }}
      >
        {/* Savelah logo mark — matches login page exactly */}
        <div className="flex items-center justify-center" style={{ width: 36, height: 36 }}>
          <svg width="36" height="36" viewBox="0 0 28 28" fill="none">
            <circle cx="14" cy="14" r="14" fill="#2DD4BF" />
            <path
              d="M8 16c0-3.314 2.686-6 6-6s6 2.686 6 6"
              stroke="#0F1923"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
            <circle cx="14" cy="19" r="2" fill="#0F1923" />
          </svg>
        </div>
        <span style={{ fontSize: 18, fontWeight: 700, letterSpacing: "-0.3px", color: "#fff" }}>
          Savelah
        </span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4" style={{ overflowY: "auto" }}>
        <div className="space-y-1">
          {navItems.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== "/Dashboard" && pathname.startsWith(item.href))
            const Icon = item.icon

            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors"
                style={{
                  background: isActive ? "#1E2D3D" : "transparent",
                  color: isActive ? "#2DD4BF" : "#8B9EB0",
                  textDecoration: "none",
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.background = "#1A2530"
                    e.currentTarget.style.color = "#fff"
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.background = "transparent"
                    e.currentTarget.style.color = "#8B9EB0"
                  }
                }}
              >
                <Icon
                  className="h-5 w-5"
                  style={{ color: isActive ? "#2DD4BF" : "inherit" }}
                />
                {item.label}
              </Link>
            )
          })}
        </div>
      </nav>

      {/* Footer — Total Savings */}
      <div className="p-4" style={{ borderTop: "1px solid #1E2D3D" }}>
        <div
          className="rounded-lg p-3"
          style={{ background: "#1E2D3D" }}
        >
          <p style={{ fontSize: 11, color: "#6B7F8E", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 4 }}>
            Total Savings
          </p>
          <p style={{ fontSize: 22, fontWeight: 700, color: "#2DD4BF", margin: 0 }}>
            $12,450.00
          </p>
        </div>
      </div>
    </aside>
  )
}