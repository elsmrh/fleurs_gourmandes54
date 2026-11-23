import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { checkRateLimit, getClientIp } from "@/lib/rate-limit"

// Rate-limit : 10 vérifications de codes promo maximum par tranche de 5 minutes par IP
const PROMO_MAX_ATTEMPTS = 10
const PROMO_WINDOW_MS = 5 * 60 * 1000

export async function POST(req: NextRequest) {
  try {
    const ip = getClientIp(req.headers)
    const rate = checkRateLimit(`promo:${ip}`, PROMO_MAX_ATTEMPTS, PROMO_WINDOW_MS)
    if (!rate.allowed) {
      return NextResponse.json(
        { error: "Trop de tentatives. Veuillez patienter quelques minutes avant de réessayer." },
        { status: 429 }
      )
    }

    const { code } = await req.json()
    if (!code || typeof code !== "string") {
      return NextResponse.json({ error: "Code manquant" }, { status: 400 })
    }

    const promo = await prisma.promoCode.findUnique({
      where: { code: code.trim().toUpperCase() },
    })

    if (!promo) {
      return NextResponse.json({ error: "Code promo invalide." }, { status: 404 })
    }

    if (!promo.active) {
      return NextResponse.json({ error: "Ce code promo n'est plus actif." }, { status: 400 })
    }

    if (promo.maxUses && promo.usesCount >= promo.maxUses) {
      return NextResponse.json(
        { error: "Ce code promo a atteint sa limite d'utilisation." },
        { status: 400 }
      )
    }

    if (promo.expiresAt && promo.expiresAt < new Date()) {
      return NextResponse.json({ error: "Ce code promo a expiré." }, { status: 400 })
    }

    return NextResponse.json({
      code: promo.code,
      type: promo.type,
      value: promo.value,
    })
  } catch {
    return NextResponse.json({ error: "Erreur serveur." }, { status: 500 })
  }
}
