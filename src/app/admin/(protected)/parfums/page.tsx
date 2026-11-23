import { prisma } from "@/lib/prisma"
import FlavorManager from "@/components/admin/FlavorManager"

export default async function ParfumsPage() {
  const flavors = await prisma.flavor.findMany({
    orderBy: { order: "asc" },
  })

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h2 className="text-2xl font-semibold text-gray-900">Gestion des Parfums</h2>
        <p className="text-gray-500 text-sm mt-1">
          Les parfums actifs apparaissent dans le formulaire de commande client.
        </p>
      </div>

      <FlavorManager initialFlavors={flavors} />
    </div>
  )
}

