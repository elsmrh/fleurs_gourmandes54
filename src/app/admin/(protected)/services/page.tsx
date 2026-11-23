import { prisma } from "@/lib/prisma"
import ServiceManager from "@/components/admin/ServiceManager"

export const dynamic = "force-dynamic"

export default async function AdminServicesPage() {
  const services = await prisma.service.findMany({
    orderBy: { order: "asc" }
  })

  const serializedServices = services.map(s => ({
    id: s.id,
    name: s.name,
    description: s.description || "",
    price: s.price,
    imageUrl: s.imageUrl || "",
    badge: s.badge || "",
    active: s.active,
    order: s.order
  }))

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Vos Créations & Prestations</h2>
        <p className="text-gray-500">
          Gérez vos bouquets. Les 3 premiers (actifs) apparaîtront sur la page d'accueil.
        </p>
      </div>

      <ServiceManager initialServices={serializedServices} />
    </div>
  )
}
