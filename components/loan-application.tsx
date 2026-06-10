"use client"

import { useState } from "react"
import { CheckCircle2 } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

const loanTypes = ["Personal", "Vehículo", "Hipotecario", "Educativo", "Negocio"]

export function LoanApplication() {
  const [submitted, setSubmitted] = useState(false)
  const [type, setType] = useState("Personal")

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitted(true)
  }

  return (
    <section id="solicitar" className="border-t border-border py-20 lg:py-28">
      <div className="mx-auto max-w-3xl px-6 lg:px-10">
        <div className="text-center">
          <p className="mb-4 text-xs font-semibold tracking-[0.3em] text-primary">
            SOLICITUD EN LÍNEA
          </p>
          <h2 className="font-heading text-3xl font-bold tracking-tight text-foreground text-balance sm:text-4xl">
            Solicita tu préstamo
          </h2>
          <p className="mt-4 text-base leading-relaxed text-muted-foreground text-pretty">
            Completa el formulario y recibe una respuesta en minutos. Tus datos
            están protegidos y cifrados.
          </p>
        </div>

        <div className="mt-12 rounded-2xl border border-border bg-card p-6 sm:p-10">
          {submitted ? (
            <div className="flex flex-col items-center py-12 text-center">
              <span className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-primary/15">
                <CheckCircle2 className="h-8 w-8 text-primary" />
              </span>
              <h3 className="font-heading text-2xl font-bold text-card-foreground">
                ¡Solicitud recibida!
              </h3>
              <p className="mt-3 max-w-md text-sm leading-relaxed text-muted-foreground">
                Hemos recibido tu solicitud de préstamo {type.toLowerCase()}.
                Nuestro equipo la revisará y te contactará en breve con la
                respuesta.
              </p>
              <button
                type="button"
                onClick={() => setSubmitted(false)}
                className="mt-8 rounded-md border border-border px-6 py-3 text-sm font-semibold tracking-widest text-foreground transition-colors hover:bg-secondary"
              >
                ENVIAR OTRA SOLICITUD
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Loan type selector */}
              <div>
                <Label className="mb-3 block text-sm font-medium text-foreground">
                  Tipo de préstamo
                </Label>
                <div className="flex flex-wrap gap-2">
                  {loanTypes.map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setType(t)}
                      className={
                        "rounded-md border px-4 py-2 text-sm font-medium transition-colors " +
                        (type === t
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-border bg-secondary text-muted-foreground hover:text-foreground")
                      }
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid gap-6 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name">Nombre completo</Label>
                  <Input id="name" placeholder="Juan Pérez" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Correo electrónico</Label>
                  <Input id="email" type="email" placeholder="juan@correo.com" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Teléfono</Label>
                  <Input id="phone" type="tel" placeholder="+1 555 123 4567" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="income">Ingresos mensuales</Label>
                  <Input id="income" type="number" placeholder="3000" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="amount">Monto solicitado</Label>
                  <Input id="amount" type="number" placeholder="15000" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="term">Plazo (meses)</Label>
                  <Input id="term" type="number" placeholder="24" required />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="purpose">Motivo del préstamo</Label>
                <Input id="purpose" placeholder="Ej: Compra de vehículo, consolidar deudas..." />
              </div>

              <label className="flex items-start gap-3 text-sm text-muted-foreground">
                <input
                  type="checkbox"
                  required
                  className="mt-0.5 h-4 w-4 accent-primary"
                />
                <span>
                  Acepto los términos y condiciones y la política de privacidad
                  de CrediFast.
                </span>
              </label>

              <button
                type="submit"
                className="w-full rounded-md bg-primary py-4 text-sm font-semibold tracking-widest text-primary-foreground transition-opacity hover:opacity-90"
              >
                ENVIAR SOLICITUD
              </button>
            </form>
          )}
        </div>
      </div>
    </section>
  )
}
