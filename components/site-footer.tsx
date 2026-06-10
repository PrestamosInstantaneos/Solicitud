import { Coins } from "lucide-react"

export function SiteFooter() {
  return (
    <footer className="border-t border-border py-12">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-6 px-6 lg:flex-row lg:px-10">
        <div className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary">
            <Coins className="h-4 w-4 text-primary-foreground" />
          </span>
          <span className="font-heading text-lg font-bold tracking-tight text-foreground">
            CREDI<span className="text-primary">FAST</span>
          </span>
        </div>
        <p className="text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()} CrediFast. Todos los derechos reservados.
          Préstamos sujetos a aprobación crediticia.
        </p>
        <div className="flex gap-6 text-xs font-medium text-muted-foreground">
          <a href="#" className="hover:text-foreground">Términos</a>
          <a href="#" className="hover:text-foreground">Privacidad</a>
          <a href="#" className="hover:text-foreground">Ayuda</a>
        </div>
      </div>
    </footer>
  )
}
