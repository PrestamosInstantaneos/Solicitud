import { NextResponse } from "next/server"
import { getBcvRate } from "@/lib/bcv"

export const runtime = "nodejs"

export async function GET() {
  const rate = await getBcvRate()
  return NextResponse.json(rate)
}
