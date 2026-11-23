import { prisma } from "@/lib/prisma"
import ClientsTable, { ClientData } from "@/components/admin/ClientsTable"
import { calculateBookingTotal } from "@/lib/orders"

export const metadata = {
  title: "CRM Clients - Fleurs Gourmandes",
}

export default async function CRMPage() {
  const bookings = await prisma.booking.findMany({
    where: { status: { not: "CANCELLED" } },
    orderBy: { createdAt: "desc" }
  })

  const clientsMap = new Map<string, ClientData>()

  bookings.forEach(b => {
    const email = b.customerEmail.toLowerCase().trim()
    const totalSpent = calculateBookingTotal(b)

    if (!clientsMap.has(email)) {
      clientsMap.set(email, {
        email,
        name: b.customerName,
        phone: b.customerPhone,
        totalSpent: 0,
        orderCount: 0,
        lastOrderDate: b.createdAt
      })
    }

    const client = clientsMap.get(email)!
    if (b.status === "CONFIRMED") {
      client.totalSpent += totalSpent
    }
    client.orderCount += 1
  })

  const clients = Array.from(clientsMap.values())
    .sort((a, b) => b.totalSpent - a.totalSpent)

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Base Clients (CRM)</h1>
          <p className="text-gray-500 text-sm mt-1">Gérez vos clients, identifiez vos meilleurs acheteurs et exportez vos contacts.</p>
        </div>
      </div>

      <ClientsTable initialClients={clients} />
    </div>
  )
}
