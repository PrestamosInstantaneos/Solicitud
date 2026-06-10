"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import useSWR from "swr"
import { format, differenceInMonths, addMonths, isBefore } from "date-fns"
import { es } from "date-fns/locale"
import { Calendar as CalendarIcon } from "lucide-react"
import { DayPicker } from "react-day-picker"
import { Slider } from "@/components/ui/slider"

type BcvRate = {
  usd: number
  fetchedAt: string
  source: "bcv" | "fallback"
}

const fetcher = (url: string) => fetch(url).then((r) => r.json())

function formatBs(value: number) {
  return new Intl.NumberFormat("es-VE", {
    maximumFractionDigits: 2,
    minimumFractionDigits: 2,
  }).format(value)
}

function formatUsd(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  }).format(value)
}

// Interés: 0.80 USD por cada 1.000 Bs
const INTEREST_PER_1000_BS_USD = 0.8

function calculateLoan(amountBs: number, bcvUsd: number, paymentDate: Date | undefined) {
  if (amountBs <= 0 || !paymentDate || bcvUsd <= 0) {
    return { amountUsd: 0, interestUsd: 0, interestBs: 0, totalUsd: 0, totalBs: 0, monthlyBs: 0, monthlyUsd: 0, months: 0 }
  }

  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const target = new Date(paymentDate)
  target.setHours(0, 0, 0, 0)

  const months = Math.max(differenceInMonths(target, today), 1)

  const amountUsd = amountBs / bcvUsd

  const interestUsd = (amountBs / 1000) * INTEREST_PER_1000_BS_USD
  const interestBs = interestUsd * bcvUsd

  const totalUsd = amountUsd + interestUsd
  const totalBs = totalUsd * bcvUsd

  const monthlyUsd = totalUsd / months
  const monthlyBs = monthlyUsd * bcvUsd

  return { amountUsd, interestUsd, interestBs, totalUsd, totalBs, monthlyBs, monthlyUsd, months }
}

export function LoanSimulator() {
  const [amountBs, setAmountBs] = useState(3000)
  const [paymentDate, setPaymentDate] = useState<Date | undefined>(undefined)
  const [calendarOpen, setCalendarOpen] = useState(false)
  const calendarRef = useRef<HTMLDivElement>(null)

  const { data: rate } = useSWR<BcvRate>("/api/bcv-rate", fetcher, {
    revalidateOnFocus: true,
    refreshInterval: 1000 * 60 * 60,
  })

  const bcvUsd = rate?.usd ?? 0

  const result = useMemo(
    () => calculateLoan(amountBs, bcvUsd, paymentDate),
    [amountBs, bcvUsd, paymentDate],
  )

  const today = new Date()
  const minDate = addMonths(today, 1)

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (calendarRef.current && !calendarRef.current.contains(e.target as Node)) {
        setCalendarOpen(false)
      }
    }
    if (calendarOpen) document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [calendarOpen])

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
              Ajusta el monto en bolívares y selecciona la fecha de pago para
              ver tu cuota estimada. Sin compromiso y totalmente transparente.
            </p>

            {/* BCV rate display */}
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
              {/* Amount in Bs */}
              <div>
                <div className="mb-4 flex items-baseline justify-between">
                  <span className="text-sm font-medium text-muted-foreground">
                    Monto del préstamo
                  </span>
                  <span className="font-heading text-2xl font-bold text-foreground">
                    Bs. {formatBs(amountBs)}
                  </span>
                </div>
                <Slider
                  value={[amountBs]}
                  onValueChange={(v) =>
                    setAmountBs(Array.isArray(v) ? v[0] : v)
                  }
                  min={500}
                  max={6000}
                  step={100}
                />
                <div className="mt-2 flex justify-between text-xs text-muted-foreground">
                  <span>Bs. 500</span>
                  <span>Bs. 6.000</span>
                </div>
                {bcvUsd > 0 && (
                  <p className="mt-2 text-xs text-muted-foreground">
                    Equivalente: {formatUsd(amountBs / bcvUsd)}
                  </p>
                )}
              </div>

              {/* Payment date calendar */}
              <div ref={calendarRef} className="relative">
                <span className="mb-4 block text-sm font-medium text-muted-foreground">
                  Fecha de pago
                </span>
                <button
                  type="button"
                  onClick={() => setCalendarOpen((v) => !v)}
                  className="flex w-full items-center justify-between rounded-lg border border-input bg-transparent px-3 py-2.5 text-sm text-foreground transition-colors hover:bg-secondary"
                >
                  {paymentDate ? (
                    format(paymentDate, "d 'de' MMMM, yyyy", { locale: es })
                  ) : (
                    <span className="text-muted-foreground">Selecciona la fecha de pago</span>
                  )}
                  <CalendarIcon className="ml-2 h-4 w-4 text-muted-foreground" />
                </button>
                {calendarOpen && (
                  <div className="absolute z-50 mt-2 rounded-lg border border-border bg-popover p-3 shadow-lg">
                    <DayPicker
                      mode="single"
                      selected={paymentDate}
                      onSelect={(date) => {
                        setPaymentDate(date)
                        setCalendarOpen(false)
                      }}
                      disabled={(date) => isBefore(date, minDate)}
                      locale={es}
                      classNames={{
                        months: "flex flex-col space-y-4",
                        month: "space-y-4",
                        caption: "flex justify-center pt-1 relative items-center",
                        caption_label: "text-sm font-medium",
                        nav: "space-x-1 flex items-center",
                        button_previous:
                          "absolute left-1 inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors hover:bg-muted hover:text-foreground h-7 w-7 bg-transparent p-0",
                        button_next:
                          "absolute right-1 inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors hover:bg-muted hover:text-foreground h-7 w-7 bg-transparent p-0",
                        table: "w-full border-collapse space-y-1",
                        head_row: "flex",
                        head_cell: "text-muted-foreground rounded-md w-8 font-normal text-[0.8rem]",
                        row: "flex w-full mt-2",
                        cell: "text-center text-sm p-0 relative [&:has([aria-selected])]:bg-primary/10 [&:has([aria-selected])]:rounded-md",
                        day: "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors hover:bg-muted hover:text-foreground h-8 w-8 p-0 aria-selected:bg-primary aria-selected:text-primary-foreground",
                        day_selected:
                          "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground",
                        day_today: "bg-accent text-accent-foreground",
                        day_outside: "text-muted-foreground aria-selected:bg-primary/10",
                        day_disabled: "text-muted-foreground opacity-50",
                        day_hidden: "invisible",
                      }}
                    />
                  </div>
                )}
                {paymentDate && (
                  <p className="mt-2 text-xs text-muted-foreground">
                    Plazo: {result.months} mes{result.months !== 1 ? "es" : ""}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Result card */}
          <div className="rounded-2xl border border-border bg-card p-8 lg:p-10">
            <p className="text-sm font-medium text-muted-foreground">
              Tu cuota mensual estimada
            </p>

            {result.monthlyBs > 0 ? (
              <>
                <p className="mt-2 font-heading text-5xl font-extrabold tracking-tight text-primary">
                  Bs. {formatBs(result.monthlyBs)}
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  &asymp; {formatUsd(result.monthlyUsd)} al cambio oficial
                </p>
              </>
            ) : (
              <p className="mt-2 font-heading text-2xl font-bold text-muted-foreground">
                Selecciona una fecha de pago
              </p>
            )}

            <div className="mt-8 space-y-4 border-t border-border pt-6">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Monto solicitado</span>
                <div className="text-right">
                  <span className="block font-semibold text-foreground">
                    Bs. {formatBs(amountBs)}
                  </span>
                  {result.amountUsd > 0 && (
                    <span className="block text-xs text-muted-foreground">
                      {formatUsd(result.amountUsd)}
                    </span>
                  )}
                </div>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Intereses</span>
                <div className="text-right">
                  <span className="block font-semibold text-foreground">
                    {formatUsd(result.interestUsd)}
                  </span>
                  {result.interestBs > 0 && (
                    <span className="block text-xs text-muted-foreground">
                      Bs. {formatBs(result.interestBs)}
                    </span>
                  )}
                </div>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Tasa de interés</span>
                <span className="font-semibold text-foreground">
                  $0,80 por cada Bs. 1.000
                </span>
              </div>
              {result.months > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Plazo</span>
                  <span className="font-semibold text-foreground">
                    {result.months} mes{result.months !== 1 ? "es" : ""}
                  </span>
                </div>
              )}
              <div className="flex justify-between border-t border-border pt-4 text-base">
                <span className="font-medium text-foreground">Total a pagar</span>
                <div className="text-right">
                  <span className="block font-heading font-bold text-foreground">
                    Bs. {formatBs(result.totalBs)}
                  </span>
                  {result.totalUsd > 0 && (
                    <span className="block text-sm text-muted-foreground">
                      {formatUsd(result.totalUsd)}
                    </span>
                  )}
                </div>
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
