import { unstable_cache } from "next/cache"
import * as cheerio from "cheerio"
import { Agent, fetch as undiciFetch } from "undici"

export type BcvRate = {
  /** Valor del dólar en bolívares (ej. 572.6784) */
  usd: number
  /** Fecha de la consulta (ISO) */
  fetchedAt: string
  /** Indica si el valor proviene del BCV o es un respaldo */
  source: "bcv" | "fallback"
}

// Valor de respaldo por si el BCV no responde (se actualiza al cachear uno real).
const FALLBACK_RATE = 572.6784

export const BCV_RATE_TAG = "bcv-rate"

// El BCV expone un certificado que Node considera no confiable.
// Usamos un dispatcher de undici que no rechaza la conexión TLS.
const insecureAgent = new Agent({
  connect: { rejectUnauthorized: false },
})

/**
 * Descarga la página del BCV y extrae el valor del dólar desde
 * el nodo `#dolar .strong-tb` (ej. "572,67840000").
 */
async function scrapeBcvRate(): Promise<BcvRate> {
  try {
    const res = await undiciFetch("https://www.bcv.org.ve/", {
      dispatcher: insecureAgent,
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36",
        Accept: "text/html,application/xhtml+xml",
      },
    })

    if (!res.ok) throw new Error(`BCV respondió ${res.status}`)

    const html = await res.text()
    const $ = cheerio.load(html)

    // El valor vive en #dolar .strong-tb, formato venezolano "572,67840000"
    const raw = $("#dolar .strong-tb").first().text().trim()
    if (!raw) throw new Error("No se encontró el valor del dólar")

    // Convertir "572,67840000" -> 572.6784
    const normalized = raw.replace(/\./g, "").replace(",", ".")
    const usd = Number.parseFloat(normalized)

    if (!Number.isFinite(usd) || usd <= 0) {
      throw new Error(`Valor inválido: "${raw}"`)
    }

    return { usd, fetchedAt: new Date().toISOString(), source: "bcv" }
  } catch (error) {
    console.log("[v0] Error al consultar el BCV:", (error as Error).message)
    return {
      usd: FALLBACK_RATE,
      fetchedAt: new Date().toISOString(),
      source: "fallback",
    }
  }
}

/**
 * Versión cacheada. El valor se almacena con un tag para poder
 * revalidarlo desde el cron diario, y como respaldo se revalida
 * automáticamente cada 6 horas.
 */
export const getBcvRate = unstable_cache(scrapeBcvRate, ["bcv-rate"], {
  tags: [BCV_RATE_TAG],
  revalidate: 60 * 60 * 6, // 6 horas
})
