"use client"

import { useMemo, useState } from "react"
import useSWR from "swr"
import { Slider } from "@/components/ui/slider"

const MONTHLY_RATE = 0.018 // 1.8% mensual

type BcvRate = {
  usd: number
  fetchedAt: string
  source: "bcv" | "fallback"
}

const fetcher = (url: string) => fetch(url).then((r) => r.json())

function formatCurrency(value: number) {
  return new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value)
}

function formatBs(value: number) {
  return new Intl.NumberFormat("es-VE", {
    maximumFractionDigits: 2,
    minimumFractionDigits: 2,
  }).format(value)
}

/**
 * Calcula la cuota de un préstamo con sistema de amortización francés
 * (cuota fija). Devuelve la cuota mensual, el total a pagar y los intereses.
 */
function calculateLoan(amount: number, months: number, monthlyRate = MONTHLY_RATE) {
  if (amount <= 0 || months <= 0) {
    return { monthly: 0, total: 0, interest: 0 }
  }

  // Si no hay interés, la cuota es simplemente el capital dividido en los meses.
  const monthly =
    monthlyRate === 0
      ? amount / months
      : (amount * monthlyRate) / (1 - Math.pow(1 + monthlyRate, -months))

  const total = monthly * months
  const interest = total - amount

  return { monthly, total, interest }
}

export function LoanSimulator() {
  const [amount, setAmount] = useState(15000)
  const [months, setMonths] = useState(24)

  const { monthly, total, interest } = useMemo(
    () => calculateLoan(amount, months),
    [amount, months],
  )

  // Tasa del dólar del BCV (se revalida al volver a la pestaña).
  const { data: rate } = useSWR<BcvRate>("/api/bcv-rate", fetcher, {
    revalidateOnFocus: true,
    refreshInterval: 1000 * 60 * 60, // reintenta cada hora en el cliente
  })

  const bcvUsd = rate?.usd ?? 0
  const monthlyBs = bcvUsd > 0 ? monthly * bcvUsd : 0
  const amountBs = bcvUsd > 0 ? amount * bcvUsd : 0
  const totalBs = bcvUsd > 0 ? total * bcvUsd : 0

  return (
    <section id="simulador" className="border-t border-border py-20 lg:py-28">
      <div className="mx-auto max-w-7xl px-6 lg:px-10">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div>
            <p className="mb-4 text-xs font-semibold tracking-[0.3em] text-primary">
              SIMULADOR
            </p>
            <h2 className="font-heading text-3xl font-bold tracking-tight text-foreground text-balance sm:text-4xl">
              Calcula tu cuota mensual
            </h2>
            <p className="mt-4 max-w-md text-base leading-relaxed text-muted-foreground text-pretty">
              Ajusta el monto y el plazo para ver tu cuota estimada. Sin
              compromiso y totalmente transparente.
            </p>

            {/* Tasa del dólar oficial (BCV) */}
            <div className="mt-6 inline-flex items-center gap-3 rounded-lg border border-border bg-card px-4 py-3">
              <span className="flex h-2.5 w-2.5 shrink-0 rounded-full bg-primary" />
              <div className="text-sm">
                <span className="text-muted-foreground">Dólar oficial BCV: </span>
                <span className="font-semibold text-foreground">
                  {rate ? `Bs. ${formatBs(rate.usd)}` : "Cargando..."}
                </span>
                {rate && (
                  <span className="ml-2 text-xs text-muted-foreground">
                    {rate.source === "bcv"
                      ? `· Actualizado ${new Date(rate.fetchedAt).toLocaleDateString("es-VE")}`
                      : "· Valor de referencia"}
                  </span>
                )}
              </div>
            </div>

            <div className="mt-10 space-y-10">
              <div>
                <div className="mb-4 flex items-baseline justify-between">
                  <span className="text-sm font-medium text-muted-foreground">
                    Monto del préstamo
                  </span>
                  <span className="font-heading text-2xl font-bold text-foreground">
                    {amountBs > 0 ? `Bs. ${formatBs(amountBs)}` : formatCurrency(amount)}
                  </span>
                </div>
                <Slider
                  value={[amount]}
                  onValueChange={(v) =>
                    setAmount(Array.isArray(v) ? v[0] : v)
                  }
                  min={1000}
                  max={100000}
                  step={1000}
                />
                <div className="mt-2 flex justify-between text-xs text-muted-foreground">
                  <span>
                    {bcvUsd > 0 ? `Bs. ${formatBs(1000 * bcvUsd)}` : "$1.000"}
                  </span>
                  <span>
                    {bcvUsd > 0 ? `Bs. ${formatBs(100000 * bcvUsd)}` : "$100.000"}
                  </span>
                </div>
              </div>

              <div>
                <div className="mb-4 flex items-baseline justify-between">
                  <span className="text-sm font-medium text-muted-foreground">
                    Plazo
                  </span>
                  <span className="font-heading text-2xl font-bold text-foreground">
                    {months} meses
                  </span>
                </div>
                <Slider
                  value={[months]}
                  onValueChange={(v) =>
                    setMonths(Array.isArray(v) ? v[0] : v)
                  }
                  min={6}
                  max={72}
                  step={6}
                />
                <div className="mt-2 flex justify-between text-xs text-muted-foreground">
                  <span>6 meses</span>
                  <span>72 meses</span>
                </div>
              </div>
            </div>
          </div>

          {/* Result card */}
          <div className="rounded-2xl border border-border bg-card p-8 lg:p-10">
            <p className="text-sm font-medium text-muted-foreground">
              Tu cuota mensual estimada
            </p>
            <p className="mt-2 font-heading text-5xl font-extrabold tracking-tight text-primary">
              {formatCurrency(monthly)}
            </p>
            {monthlyBs > 0 && (
              <p className="mt-1 text-sm text-muted-foreground">
                ≈ Bs. {formatBs(monthlyBs)} al cambio oficial
              </p>
            )}

            <div className="mt-8 space-y-4 border-t border-border pt-6">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Monto solicitado</span>
                <span className="font-semibold text-foreground">
                  {amountBs > 0 ? `Bs. ${formatBs(amountBs)}` : formatCurrency(amount)}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Intereses totales</span>
                <span className="font-semibold text-foreground">
                  {formatCurrency(interest)}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Tasa mensual</span>
                <span className="font-semibold text-foreground">
                  {(MONTHLY_RATE * 100).toFixed(1)}%
                </span>
              </div>
              <div className="flex justify-between border-t border-border pt-4 text-base">
                <span className="font-medium text-foreground">Total a pagar</span>
                <span className="font-heading font-bold text-foreground">
                  {totalBs > 0 ? `Bs. ${formatBs(totalBs)}` : formatCurrency(total)}
                </span>
              </div>
            </div>

            <a
              href="#solicitar"
              className="mt-8 block w-full rounded-md bg-primary py-4 text-center text-sm font-semibold tracking-widest text-primary-foreground transition-opacity hover:opacity-90"
            >
              SOLICITAR ESTE PRÉSTAMO
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}
