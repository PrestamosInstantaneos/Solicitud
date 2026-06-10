import { FileText, BadgeCheck, Wallet } from "lucide-react"

const steps = [
  {
    icon: FileText,
    title: "1. Completa la solicitud",
    desc: "Llena el formulario en línea en menos de 5 minutos. Solo necesitas tus datos básicos.",
  },
  {
    icon: BadgeCheck,
    title: "2. Aprobación en pocos minutos",
    desc: "Analizamos tu solicitud al instante y te damos una respuesta sin esperas innecesarias.",
  },
  {
    icon: Wallet,
    title: "3. Recibe tu dinero",
    desc: "Una vez aprobado, transferimos el monto directamente a tu cuenta bancaria.",
  },
]

export function HowItWorks() {
  return (
    <section id="como-funciona" className="border-t border-border py-20 lg:py-28">
      <div className="mx-auto max-w-7xl px-6 lg:px-10">
        <div className="mx-auto max-w-2xl text-center">
          <p className="mb-4 text-xs font-semibold tracking-[0.3em] text-primary">
            PROCESO SIMPLE
          </p>
          <h2 className="font-heading text-3xl font-bold tracking-tight text-foreground text-balance sm:text-4xl">
            Tu préstamo en 3 pasos
          </h2>
        </div>

        <div className="mt-14 grid gap-6 md:grid-cols-3">
          {steps.map((step) => (
            <div
              key={step.title}
              className="rounded-xl border border-border bg-card p-8 transition-colors hover:border-primary/50"
            >
              <span className="mb-6 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/15">
                <step.icon className="h-6 w-6 text-primary" />
              </span>
              <h3 className="font-heading text-lg font-bold text-card-foreground">
                {step.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {step.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
