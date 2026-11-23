import { prisma } from "@/lib/prisma"
import PromoManager from "@/components/admin/PromoManager"

export const metadata = {
  title: "Codes Promo - Fleurs Gourmandes",
}

export default async function PromosPage() {
  const promos = await prisma.promoCode.findMany({
    orderBy: { createdAt: "desc" }
  })

  const serializedPromos = promos.map(p => ({
    id: p.id,
    code: p.code,
    type: p.type,
    value: p.value,
    active: p.active,
    maxUses: p.maxUses,
    usesCount: p.usesCount,
    expiresAt: p.expiresAt ? p.expiresAt.toISOString() : null,
  }))

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-12">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Codes Promo</h1>
        <p className="text-gray-500 text-sm mt-1">Créez et gérez vos réductions (date d&apos;expiration, nombre max d&apos;utilisations, activation en 1 clic).</p>
      </div>

      <PromoManager initialPromos={serializedPromos} />
    </div>
  )
}
