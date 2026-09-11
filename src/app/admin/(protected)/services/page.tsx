import { prisma } from "@/lib/prisma"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Plus, Edit2, Trash2 } from "lucide-react"

export default async function AdminServicesPage() {
  const services = await prisma.service.findMany({
    orderBy: { createdAt: 'desc' }
  })

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Vos Créations & Prestations</h2>
          <p className="text-gray-500">Gérez les bouquets de cupcakes, gâteaux et autres créations que vos clients peuvent réserver.</p>
        </div>
        <Button asChild className="bg-pink-600 hover:bg-pink-700">
          <Link href="/admin/services/new">
            <Plus className="mr-2 h-4 w-4" /> Nouvelle Création
          </Link>
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {services.map(service => (
          <Card key={service.id}>
            <CardHeader className="pb-2">
              <CardTitle>{service.name}</CardTitle>
              <CardDescription className="text-pink-600 font-medium">{service.price} €</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-500 line-clamp-2 mb-4">{service.description}</p>
              <div className="flex justify-end gap-2 mt-4">
                <Button variant="outline" size="sm" asChild>
                  <Link href={`/admin/services/${service.id}/edit`}>
                    <Edit2 className="h-4 w-4 mr-1" /> Modifier
                  </Link>
                </Button>
                <Button variant="destructive" size="sm">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      
      {services.length === 0 && (
        <div className="text-center py-12 bg-white rounded-lg border border-dashed">
          <p className="text-gray-500 mb-4">Vous n'avez pas encore ajouté de création.</p>
          <Button asChild variant="outline">
            <Link href="/admin/services/new">
              <Plus className="mr-2 h-4 w-4" /> Ajouter ma première création
            </Link>
          </Button>
        </div>
      )}
    </div>
  )
}

