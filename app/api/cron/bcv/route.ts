import { revalidateTag } from "next/cache"
import { NextResponse } from "next/server"
import { BCV_RATE_TAG, getBcvRate } from "@/lib/bcv"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

/**
 * Endpoint que ejecuta el Cron de Vercel cada mañana.
 * Invalida la cache y vuelve a consultar el BCV para que
 * el valor quede actualizado al inicio del día.
 */
export async function GET(request: Request) {
  // Verificación opcional del secreto del cron (Vercel envía este header).
  const authHeader = request.headers.get("authorization")
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  }

  // Invalida la cache y fuerza una nueva consulta.
  revalidateTag(BCV_RATE_TAG, "max")
  const rate = await getBcvRate()

  return NextResponse.json({ ok: true, refreshedAt: new Date().toISOString(), rate })
}
