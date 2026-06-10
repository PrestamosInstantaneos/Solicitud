"use client"

import { useState } from "react"
import { Menu, X, Coins } from "lucide-react"
import { cn } from "@/lib/utils"

const navLinks = [
  { label: "INICIO", href: "#inicio" },
  { label: "PRÉSTAMOS", href: "#prestamos" },
  { label: "SIMULADOR", href: "#simulador" },
  { label: "CÓMO FUNCIONA", href: "#como-funciona" },
  { label: "CONTACTO", href: "#solicitar" },
]

export function SiteHeader() {
  const [open, setOpen] = useState(false)

  return (
    <header className="absolute inset-x-0 top-0 z-50">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-6 lg:px-10">
        <a href="#inicio" className="flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary">
            <Coins className="h-5 w-5 text-primary-foreground" />
          </span>
          <span className="font-heading text-xl font-bold tracking-tight text-foreground">
            CREDI<span className="text-primary">FAST</span>
          </span>
        </a>

        <div className="hidden items-center gap-9 lg:flex">
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="text-xs font-semibold tracking-widest text-muted-foreground transition-colors hover:text-foreground"
            >
              {link.label}
            </a>
          ))}
        </div>

        <a
          href="#solicitar"
          className="hidden rounded-md bg-primary px-5 py-2.5 text-xs font-semibold tracking-widest text-primary-foreground transition-opacity hover:opacity-90 lg:block"
        >
          SOLICITAR
        </a>

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="text-foreground lg:hidden"
          aria-label="Abrir menú"
        >
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </nav>

      <div
        className={cn(
          "overflow-hidden border-t border-border bg-card/95 backdrop-blur lg:hidden",
          open ? "max-h-96" : "max-h-0",
          "transition-all duration-300",
        )}
      >
        <div className="flex flex-col gap-1 px-6 py-4">
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              onClick={() => setOpen(false)}
              className="rounded-md px-3 py-3 text-sm font-semibold tracking-wide text-muted-foreground hover:bg-secondary hover:text-foreground"
            >
              {link.label}
            </a>
          ))}
        </div>
      </div>
    </header>
  )
}
