"use client"

import { useState, useMemo, useEffect } from "react"
import { getUserId } from "@/lib/auth"
import { getAllGoalsByUser, processPayment, type GoalContributionRecord } from "@/lib/api"

type RoundMode = '50cent' | 'dollar' | '5' | '10' | 'custom'
type PayMethod = 'visa' | 'paynow' | 'savelah' | ''
type Step = 1 | 2 | 3

interface Goal { Id: number; OwnerId: number; Title: string }

const CART_ITEMS = [
  { emoji: "🥑", name: "Organic Avocado", sub: "Qty 2 × SGD 1.80", qty: 2, unitPrice: 1.80 },
  { emoji: "🥛", name: "Oat Milk 1L",     sub: "Qty 1 × SGD 4.50", qty: 1, unitPrice: 4.50 },
  { emoji: "🍞", name: "Wholegrain Bread",sub: "Qty 1 × SGD 3.20", qty: 1, unitPrice: 3.20 },
  { emoji: "🧃", name: "Cold-Press Juice",sub: "Qty 1 × SGD 5.90", qty: 1, unitPrice: 5.40 },
]

const GST = 0.09
const subtotal = CART_ITEMS.reduce((s, i) => s + i.qty * i.unitPrice, 0)
const gst = Math.round(subtotal * GST * 100) / 100
const BASE = Math.round((subtotal + gst) * 100) / 100

const fmt = (n: number) =>
  new Intl.NumberFormat("en-SG", { style: "currency", currency: "SGD" }).format(n)

const MODES: { key: RoundMode; label: string }[] = [
  { key: '50cent',  label: 'Nearest 50¢'   },
  { key: 'dollar', label: 'Nearest dollar' },
  { key: '5',      label: 'Nearest $5'     },
  { key: '10',     label: 'Nearest $10'    },
  { key: 'custom', label: 'Custom'         },
]

const s = {
  fontFamily: "'DM Sans','Segoe UI',sans-serif",
  minHeight: "100vh",
  background: "#F4F6F8",
} as React.CSSProperties

export function MerchantSimulationForm() {
  const [step, setStep]               = useState<Step>(1)
  const [method, setMethod]           = useState<PayMethod>('')
  const [roundMode, setRoundMode]     = useState<RoundMode>('50cent')
  const [customAmt, setCustomAmt]     = useState("")
  const [selectedGoal, setSelectedGoal] = useState("")
  const [goals, setGoals]             = useState<Goal[]>([])
  const [goalRecords, setGoalRecords]  = useState<GoalContributionRecord[]>([])
  const [goalsLoading, setGoalsLoading] = useState(true)
  const [loading, setLoading]         = useState(false)
  const [error, setError]             = useState<string | null>(null)
  const [savedAmt, setSavedAmt]       = useState(0)

  useEffect(() => {
    const fetch_ = async () => {
      try {
        const uid = Number(getUserId())
        const records = await getAllGoalsByUser(uid)
        const eligible = records.filter(({ SavingsGoal: g, GoalContributions: c }) =>
          g.Status === 1 && c.CurrentAmount < c.TargetAmount
        )
        setGoalRecords(eligible)
        setGoals(eligible.map(({ SavingsGoal: g }) => ({ Id: g.Id, OwnerId: g.OwnerId, Title: g.Title })))
      } catch { } finally { setGoalsLoading(false) }
    }
    fetch_()
  }, [])

  const { roundedTotal, savings } = useMemo(() => {
    let r: number
    if (roundMode === '50cent')      r = Math.ceil(BASE * 2) / 2
    else if (roundMode === 'dollar') r = Math.ceil(BASE)
    else if (roundMode === '5')      r = Math.ceil(BASE / 5) * 5
    else if (roundMode === '10')     r = Math.ceil(BASE / 10) * 10
    else                             r = BASE + (parseFloat(customAmt) || 0)
    r = Math.round(r * 100) / 100
    return { roundedTotal: r, savings: Math.round((r - BASE) * 100) / 100 }
  }, [roundMode, customAmt])

  const selectedRecord = goalRecords.find(r => String(r.SavingsGoal.Id) === selectedGoal)
  const remainingTarget = selectedRecord
    ? Math.round((selectedRecord.GoalContributions.TargetAmount - selectedRecord.GoalContributions.CurrentAmount) * 100) / 100
    : Infinity

  const effectiveSavings = Math.min(savings, remainingTarget)
  const isCapped = savings > remainingTarget && remainingTarget < Infinity
  const effectiveRoundedTotal = Math.round((BASE + effectiveSavings) * 100) / 100
  const payTotal = method === 'savelah' ? effectiveRoundedTotal : BASE

  const isReady = method !== '' && (
    method !== 'savelah' || (
      !!selectedGoal &&
      savings >= 0 &&
      (roundMode !== 'custom' || parseFloat(customAmt) > 0)
    )
  )

  const btnLabel = !method
    ? 'Select a payment method to continue'
    : method === 'savelah'
      ? !selectedGoal
        ? 'Select a savings goal to continue'
        : `Pay ${fmt(effectiveRoundedTotal)} with SaveLah`
      : `Pay ${fmt(BASE)} with ${method === 'visa' ? 'Visa' : 'PayNow'}`

  const handlePay = async () => {
    if (!isReady) return
    try {
      setLoading(true); setError(null)
      if (method === 'savelah') {
        const uid = Number(getUserId())
        await processPayment({
          UserId: uid, MerchantId: 1,
          ItemAmount: BASE, SavingsAmount: effectiveSavings,
          Currency: "SGD", GoalId: Number(selectedGoal),
          BankTransferId: "", MonthlyTransfersId: 0,
        })
        setSavedAmt(effectiveSavings)
      }
      setStep(3)
    } catch (err: any) {
      setError(err.message || "Payment failed. Please try again.")
    } finally { setLoading(false) }
  }

  const reset = () => {
    setStep(1); setMethod(''); setRoundMode('50cent')
    setCustomAmt(''); setSelectedGoal(''); setError(null); setSavedAmt(0)
  }

  // Shared styles
  const card: React.CSSProperties = {
    background: "#fff", borderRadius: 12, border: "1px solid #E5EAF0",
    padding: "20px 24px", marginBottom: 16,
  }
  const sectionTitle: React.CSSProperties = {
    fontSize: 11, fontWeight: 700, color: "#6B7F8E",
    textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: 14,
  }

  // Topbar — shared
  const Topbar = () => (
    <div style={{ background: "#fff", borderBottom: "1px solid #E5EAF0", padding: "0 48px", height: 60, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      <div style={{ width: 36, height: 36, background: "#16a34a", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
            <line x1="3" y1="6" x2="21" y2="6" stroke="#fff" strokeWidth="1.8" strokeLinecap="round"/>
            <path d="M16 10a4 4 0 01-8 0" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>
        <span style={{ fontSize: 18, fontWeight: 700, color: "#0F1923" }}>FreshMart Express</span>
      </div>
      <div style={{ display: "flex", gap: 28, fontSize: 14, color: "#6B7F8E" }}>
        <span>Home</span><span>Shop</span><span>Deals</span><span>Contact</span>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 14, color: "#0F1923", fontWeight: 500 }}>
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M2 2h2.5l2.5 9h7l1.5-5H6" stroke="#0F1923" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/><circle cx="8" cy="15" r="1.2" fill="#0F1923"/><circle cx="12.5" cy="15" r="1.2" fill="#0F1923"/></svg>
        Cart (4)
      </div>
    </div>
  )

  // Step indicator — shared
  const Steps = () => (
    <div style={{ display: "flex", alignItems: "center", gap: 0, maxWidth: 900, margin: "24px auto 28px", padding: "0 48px" }}>
      {[{ n: 1, label: "Cart" }, { n: 2, label: "Payment" }, { n: 3, label: "Confirm" }].map((st, i) => (
        <div key={st.n} style={{ display: "flex", alignItems: "center", flex: i < 2 ? 1 : 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{
              width: 28, height: 28, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 13, fontWeight: 700, flexShrink: 0,
              background: step > st.n ? "#16a34a" : step === st.n ? "#0F1923" : "transparent",
              border: step <= st.n && step !== st.n ? "1.5px solid #D1D9E0" : "none",
              color: step >= st.n ? "#fff" : "#6B7F8E",
            }}>
              {step > st.n ? "✓" : st.n}
            </div>
            <span style={{ fontSize: 14, fontWeight: step === st.n ? 600 : 400, color: step === st.n ? "#0F1923" : step > st.n ? "#16a34a" : "#6B7F8E" }}>
              {st.label}
            </span>
          </div>
          {i < 2 && <div style={{ flex: 1, height: 1.5, background: step > st.n + 1 ? "#16a34a" : "#E5EAF0", margin: "0 16px" }} />}
        </div>
      ))}
    </div>
  )

  // Order summary sidebar — reused in steps 1 & 2
  const OrderSummary = () => (
    <div style={card}>
      <div style={sectionTitle}>Order summary</div>
      {[["Subtotal (4 items)", fmt(subtotal)], ["GST (9%)", fmt(gst)], ["Delivery fee", "Free"]].map(([l, v]) => (
        <div key={l} style={{ display: "flex", justifyContent: "space-between", fontSize: 13, color: "#6B7F8E", padding: "4px 0" }}>
          <span>{l}</span>
          <span style={{ color: l === "Delivery fee" ? "#16a34a" : undefined }}>{v}</span>
        </div>
      ))}
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 15, fontWeight: 700, color: "#0F1923", paddingTop: 12, marginTop: 8, borderTop: "1.5px solid #E5EAF0" }}>
        <span>Total</span><span>{fmt(BASE)}</span>
      </div>
    </div>
  )

  // Cart items card — reused
  const CartItems = () => (
    <div style={card}>
      <div style={sectionTitle}>Your order</div>
      {CART_ITEMS.map(item => (
        <div key={item.name} style={{ display: "flex", alignItems: "center", gap: 14, padding: "10px 0", borderBottom: "1px solid #F4F6F8" }}>
          <div style={{ width: 52, height: 52, borderRadius: 10, background: "#F4F6F8", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, flexShrink: 0 }}>{item.emoji}</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 14, fontWeight: 500, color: "#0F1923" }}>{item.name}</div>
            <div style={{ fontSize: 12, color: "#6B7F8E", marginTop: 2 }}>{item.sub}</div>
          </div>
          <div style={{ fontSize: 14, fontWeight: 600, color: "#0F1923" }}>{fmt(item.qty * item.unitPrice)}</div>
        </div>
      ))}
    </div>
  )

  return (
    <div style={s}>
      <Topbar />
      <Steps />

      <div style={{ maxWidth: 900, margin: "0 auto", padding: "0 48px 48px" }}>

        {/* ── STEP 1: Cart ── */}
        {step === 1 && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: 20 }}>
            <div>
              <CartItems />
              {/* Delivery details */}
              <div style={card}>
                <div style={sectionTitle}>Delivery details</div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                  {[["Full name", "Afsana Parvin"], ["Phone", "+65 9123 4567"], ["Slot", "Today, 6–8 PM"], ["Order ref", "#FM-20240412"]].map(([l, v]) => (
                    <div key={l}>
                      <div style={{ fontSize: 11, color: "#6B7F8E", marginBottom: 4 }}>{l}</div>
                      <div style={{ fontSize: 13, fontWeight: 500, color: "#0F1923", background: "#F4F6F8", padding: "8px 10px", borderRadius: 8 }}>{v}</div>
                    </div>
                  ))}
                  <div style={{ gridColumn: "1/-1" }}>
                    <div style={{ fontSize: 11, color: "#6B7F8E", marginBottom: 4 }}>Address</div>
                    <div style={{ fontSize: 13, fontWeight: 500, color: "#0F1923", background: "#F4F6F8", padding: "8px 10px", borderRadius: 8 }}>Blk 123 Jurong West St 42, #08-12, S640123</div>
                  </div>
                </div>
              </div>
            </div>
            <div>
              <OrderSummary />
              <button
                onClick={() => setStep(2)}
                style={{ width: "100%", padding: "13px", borderRadius: 8, border: "none", background: "#0F1923", color: "#fff", fontSize: 15, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}
              >
                Continue to payment →
              </button>
            </div>
          </div>
        )}

        {/* ── STEP 2: Payment ── */}
        {step === 2 && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 360px", gap: 20 }}>
            {/* Left — items recap */}
            <div>
              <CartItems />
              <div style={card}>
                <div style={sectionTitle}>Delivery details</div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                  {[["Full name", "Afsana Parvin"], ["Phone", "+65 9123 4567"], ["Slot", "Today, 6–8 PM"], ["Address", "Blk 123 Jurong West St 42, #08-12, S640123"]].map(([l, v]) => (
                    <div key={l} style={{ gridColumn: l === "Address" ? "1/-1" : undefined }}>
                      <div style={{ fontSize: 11, color: "#6B7F8E", marginBottom: 4 }}>{l}</div>
                      <div style={{ fontSize: 13, fontWeight: 500, color: "#0F1923", background: "#F4F6F8", padding: "8px 10px", borderRadius: 8 }}>{v}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right — payment */}
            <div>
              <OrderSummary />
              <div style={card}>
                <div style={sectionTitle}>Payment method</div>

                {(['visa', 'paynow', 'savelah'] as PayMethod[]).map(m => (
                  <div
                    key={m}
                    onClick={() => setMethod(m)}
                    style={{
                      display: "flex", alignItems: "center", gap: 12, padding: "13px 14px",
                      border: `1.5px solid ${method === m ? (m === 'savelah' ? '#16a34a' : '#0F1923') : '#E5EAF0'}`,
                      borderRadius: 10, cursor: "pointer", marginBottom: 10, transition: "all 0.15s",
                      background: method === m ? (m === 'savelah' ? '#F0FDF4' : '#F8FAFB') : '#fff',
                    }}
                  >
                    {/* Radio */}
                    <div style={{
                      width: 18, height: 18, borderRadius: "50%", flexShrink: 0,
                      border: `2px solid ${method === m ? (m === 'savelah' ? '#16a34a' : '#0F1923') : '#D1D9E0'}`,
                      background: method === m ? (m === 'savelah' ? '#16a34a' : '#0F1923') : 'transparent',
                      display: "flex", alignItems: "center", justifyContent: "center",
                    }}>
                      {method === m && <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#fff" }} />}
                    </div>
                    {/* Logo */}
                    <div style={{
                      width: 40, height: 28, borderRadius: 6, flexShrink: 0,
                      background: m === 'visa' ? '#1A1F71' : m === 'paynow' ? '#9B1FE8' : '#0F1923',
                      display: "flex", alignItems: "center", justifyContent: "center",
                    }}>
                      {m === 'visa' && <span style={{ color: "#fff", fontSize: 11, fontWeight: 800, fontStyle: "italic" }}>VISA</span>}
                      {m === 'paynow' && <span style={{ color: "#fff", fontSize: 7, fontWeight: 800, textAlign: "center" as const, lineHeight: 1.2 }}>PAY<br/>NOW</span>}
                      {m === 'savelah' && (
                        <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
                          <path d="M4 11c0-3.31 2.69-6 6-6s6 2.69 6 6" stroke="#2DD4BF" strokeWidth="2.2" strokeLinecap="round"/>
                          <circle cx="10" cy="14" r="2" fill="#2DD4BF"/>
                        </svg>
                      )}
                    </div>
                    {/* Info */}
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 14, fontWeight: 600, color: "#0F1923", display: "flex", alignItems: "center", gap: 6 }}>
                        {m === 'visa' && 'Visa •••• 4242'}
                        {m === 'paynow' && 'PayNow'}
                        {m === 'savelah' && (
                          <>
                            SaveLah
                            <span style={{ fontSize: 10, background: "#DCFCE7", color: "#15803D", padding: "2px 8px", borderRadius: 99, fontWeight: 600 }}>
                              Save while you spend
                            </span>
                          </>
                        )}
                      </div>
                      <div style={{ fontSize: 12, color: "#6B7F8E", marginTop: 2 }}>
                        {m === 'visa' && 'Expires 09/27'}
                        {m === 'paynow' && 'Via UEN or mobile number'}
                        {m === 'savelah' && 'Round up & save to your goal automatically'}
                      </div>
                    </div>
                  </div>
                ))}

                {/* SaveLah panel */}
                {method === 'savelah' && (
                  <div style={{ background: "#F0FDF4", border: "1px solid #BBF7D0", borderRadius: 10, padding: "14px 16px", margin: "4px 0 12px" }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: "#15803D", textTransform: "uppercase" as const, letterSpacing: "0.5px", marginBottom: 8 }}>Round-up savings</div>
                    <div style={{ fontSize: 12, color: "#15803D", marginBottom: 10 }}>Choose how to round up your total:</div>
                    <div style={{ display: "flex", flexWrap: "wrap" as const, gap: 6, marginBottom: 10 }}>
                      {MODES.map(({ key, label }) => (
                        <button
                          key={key}
                          onClick={() => setRoundMode(key)}
                          style={{
                            padding: "4px 12px", fontSize: 11, borderRadius: 99, cursor: "pointer",
                            border: `1px solid ${roundMode === key ? '#16a34a' : '#BBF7D0'}`,
                            background: roundMode === key ? '#16a34a' : 'transparent',
                            color: roundMode === key ? '#fff' : '#15803D',
                            fontFamily: "inherit", transition: "all 0.12s",
                          }}
                        >{label}</button>
                      ))}
                    </div>
                    {roundMode === 'custom' && (
                      <input
                        type="number" step="0.01" min="0.01"
                        placeholder="Fixed amount e.g. 2.00"
                        value={customAmt}
                        onChange={e => setCustomAmt(e.target.value)}
                        style={{ width: "100%", padding: "7px 10px", borderRadius: 7, border: "1.5px solid #BBF7D0", fontSize: 12, background: "#fff", color: "#0F1923", fontFamily: "inherit", marginBottom: 8, boxSizing: "border-box" as const }}
                      />
                    )}
                    {[["FairPrice total", fmt(BASE)], ["Rounded to", fmt(effectiveRoundedTotal)]].map(([l, v]) => (
                      <div key={l} style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "#6B7F8E", padding: "2px 0" }}>
                        <span>{l}</span><span>{v}</span>
                      </div>
                    ))}
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, fontWeight: 700, color: "#15803D", paddingTop: 7, marginTop: 5, borderTop: "1px solid #BBF7D0" }}>
                      <span>You save</span><span>+{fmt(effectiveSavings)}</span>
                    </div>
                    {isCapped && (
                      <div style={{ marginTop: 8, padding: "7px 10px", background: "#FEF9C3", border: "1px solid #FDE047", borderRadius: 7, fontSize: 11, color: "#854D0E" }}>
                        ⚠ Round-up capped at {fmt(effectiveSavings)} - that's all you need to reach your goal target!
                      </div>
                    )}
                    <div style={{ marginTop: 12 }}>
                      <div style={{ fontSize: 11, fontWeight: 700, color: "#15803D", textTransform: "uppercase" as const, letterSpacing: "0.5px", marginBottom: 5 }}>Save to goal</div>
                      <select
                        value={selectedGoal}
                        onChange={e => setSelectedGoal(e.target.value)}
                        style={{ width: "100%", padding: "8px 10px", borderRadius: 7, border: "1.5px solid #BBF7D0", fontSize: 12, background: "#fff", color: selectedGoal ? "#0F1923" : "#6B7F8E", fontFamily: "inherit", boxSizing: "border-box" as const }}
                      >
                        <option value="">{goalsLoading ? "Loading..." : "Select a savings goal..."}</option>
                        {goals.map(g => <option key={g.Id} value={String(g.Id)}>{g.Title}</option>)}
                      </select>
                    </div>
                  </div>
                )}

                {/* Pay summary row */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "#F8FAFB", borderRadius: 9, padding: "11px 14px", border: "1px solid #E5EAF0", margin: "12px 0" }}>
                  <div>
                    <div style={{ fontSize: 11, color: "#6B7F8E" }}>You pay today</div>
                    <div style={{ fontSize: 17, fontWeight: 700, color: "#0F1923" }}>{fmt(payTotal)}</div>
                  </div>
                  {method === 'savelah' && effectiveSavings > 0 && (
                    <div style={{ textAlign: "right" as const }}>
                      <div style={{ fontSize: 11, color: "#6B7F8E" }}>Going to savings</div>
                      <div style={{ fontSize: 17, fontWeight: 700, color: "#16a34a" }}>+{fmt(effectiveSavings)}</div>
                    </div>
                  )}
                </div>

                {error && (
                  <div style={{ background: "#FEF2F2", border: "1px solid #FECACA", borderRadius: 7, padding: "9px 12px", marginBottom: 10, fontSize: 12, color: "#DC2626" }}>{error}</div>
                )}

                <button
                  onClick={handlePay}
                  disabled={!isReady || loading}
                  style={{
                    width: "100%", padding: 13, borderRadius: 8, border: "none", fontSize: 14, fontWeight: 700,
                    cursor: !isReady || loading ? "not-allowed" : "pointer",
                    fontFamily: "inherit", transition: "all 0.15s",
                    background: !isReady || loading ? "#E5EAF0" : method === 'savelah' ? "#16a34a" : "#0F1923",
                    color: !isReady || loading ? "#6B7F8E" : "#fff",
                  }}
                >
                  {loading ? "Processing payment..." : btnLabel}
                </button>

                <button
                  onClick={() => setStep(1)}
                  style={{ width: "100%", padding: "10px", borderRadius: 8, border: "1px solid #E5EAF0", background: "transparent", fontSize: 13, color: "#6B7F8E", cursor: "pointer", fontFamily: "inherit", marginTop: 8 }}
                >
                  ← Back to cart
                </button>

                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 5, marginTop: 10, fontSize: 11, color: "#6B7F8E" }}>
                  🔒 256-bit SSL encryption · Payments secured by FreshMart
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── STEP 3: Confirm ── */}
        {step === 3 && (
          <div style={{ maxWidth: 560, margin: "40px auto", textAlign: "center" as const }}>
            <div style={{ width: 64, height: 64, background: "#DCFCE7", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>
              <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
                <path d="M6 14l5 5 11-11" stroke="#16a34a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <div style={{ fontSize: 24, fontWeight: 700, color: "#0F1923", marginBottom: 6 }}>Order confirmed!</div>
            <div style={{ fontSize: 14, color: "#6B7F8E", marginBottom: 6 }}>Order #FM-20240412 · Estimated delivery: Today 6–8 PM</div>
            <div style={{ fontSize: 13, color: "#6B7F8E", marginBottom: 32 }}>A confirmation has been sent to your email.</div>

            {/* Receipt card */}
            <div style={{ background: "#fff", border: "1px solid #E5EAF0", borderRadius: 12, padding: "20px 24px", textAlign: "left" as const, marginBottom: 20 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: "#6B7F8E", textTransform: "uppercase" as const, letterSpacing: "0.8px", marginBottom: 14 }}>Receipt</div>
              {CART_ITEMS.map(item => (
                <div key={item.name} style={{ display: "flex", justifyContent: "space-between", fontSize: 13, color: "#0F1923", padding: "4px 0" }}>
                  <span>{item.name} ×{item.qty}</span>
                  <span>{fmt(item.qty * item.unitPrice)}</span>
                </div>
              ))}
              <div style={{ borderTop: "1px solid #E5EAF0", marginTop: 10, paddingTop: 10 }}>
                {[["Subtotal", fmt(subtotal)], ["GST (9%)", fmt(gst)], ["Delivery", "Free"]].map(([l, v]) => (
                  <div key={l} style={{ display: "flex", justifyContent: "space-between", fontSize: 13, color: "#6B7F8E", padding: "3px 0" }}>
                    <span>{l}</span><span style={{ color: l === "Delivery" ? "#16a34a" : undefined }}>{v}</span>
                  </div>
                ))}
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 15, fontWeight: 700, color: "#0F1923", paddingTop: 10, marginTop: 6, borderTop: "1.5px solid #E5EAF0" }}>
                  <span>Total charged</span><span>{fmt(payTotal)}</span>
                </div>
              </div>
            </div>

            {/* SaveLah savings callout */}
            {method === 'savelah' && savedAmt > 0 && (
              <div style={{ background: "#F0FDF4", border: "1px solid #BBF7D0", borderRadius: 12, padding: "16px 20px", marginBottom: 20 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: "#15803D", textTransform: "uppercase" as const, letterSpacing: "0.5px", marginBottom: 4 }}>SaveLah round-up saved</div>
                <div style={{ fontSize: 26, fontWeight: 700, color: "#15803D" }}>{fmt(savedAmt)}</div>
                <div style={{ fontSize: 12, color: "#6B7F8E", marginTop: 2 }}>added to your savings goal 🎉</div>
              </div>
            )}

            <button
              onClick={reset}
              style={{ padding: "11px 28px", borderRadius: 8, border: "1px solid #E5EAF0", background: "#fff", fontSize: 14, fontWeight: 600, color: "#0F1923", cursor: "pointer", fontFamily: "inherit" }}
            >
              Place another order
            </button>
          </div>
        )}
      </div>
    </div>
  )
}