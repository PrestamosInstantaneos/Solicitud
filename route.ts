import { NextResponse } from "next/server"
import { getBcvRate } from "@/lib/bcv"

export const runtime = "nodejs"
export const dynamic = "force-dynamic" // Asegura que la ruta siempre se ejecute dinámicamente

export async function GET() {
  const rate = await getBcvRate()

  return NextResponse.json(rate)
}