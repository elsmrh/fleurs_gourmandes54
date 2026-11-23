import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"

/**
 * Utilisé par le panneau admin pour détecter les nouvelles commandes (polling).
 * Renvoie le nombre de commandes en attente + les dernières commandes reçues.
 * Réservé aux admins connectés.
 */
export async function GET() {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
  }

  const [pendingCount, latest] = await Promise.all([
    prisma.booking.count({ where: { status: "PENDING" } }),
    prisma.booking.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
      select: {
        id: true,
        customerName: true,
        prestationName: true,
        quantity: true,
        createdAt: true,
      },
    }),
  ])

  return NextResponse.json({ pendingCount, latest })
}
