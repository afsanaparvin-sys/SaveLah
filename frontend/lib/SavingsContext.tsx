"use client"

import { createContext, useCallback, useContext, useState } from "react"
import { getKPICardDetails } from "@/lib/api"

interface SavingsContextValue {
  totalSavings: number | null
  refreshSavings: () => void
}

const SavingsContext = createContext<SavingsContextValue>({
  totalSavings: null,
  refreshSavings: () => {},
})

export function SavingsProvider({ children }: { children: React.ReactNode }) {
  const [totalSavings, setTotalSavings] = useState<number | null>(null)

  const refreshSavings = useCallback(() => {
    getKPICardDetails()
      .then((data) => setTotalSavings(data.TotalSavingsCard?.CurrentTotalSavings ?? null))
      .catch(console.error)
  }, [])

  return (
    <SavingsContext.Provider value={{ totalSavings, refreshSavings }}>
      {children}
    </SavingsContext.Provider>
  )
}

export const useSavings = () => useContext(SavingsContext)
