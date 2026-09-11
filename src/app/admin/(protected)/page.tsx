import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default async function AdminDashboard() {
  const upcomingBookingsCount = await prisma.booking.count({
    where: {
      date: {
        gte: new Date()
      }
    }
  })

  const servicesCount = await prisma.service.count()

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Réservations à venir</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{upcomingBookingsCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Prestations actives</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{servicesCount}</div>
          </CardContent>
        </Card>
      </div>

      <div className="bg-white rounded-lg border p-6">
        <h2 className="text-lg font-medium mb-4">Prochains rendez-vous</h2>
        <p className="text-gray-500 text-sm">Aucun rendez-vous pour le moment.</p>
      </div>
    </div>
  )
}

