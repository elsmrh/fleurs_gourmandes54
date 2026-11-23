import { prisma } from "@/lib/prisma"
import AdminCalendar from "@/components/admin/AdminCalendar"

export const dynamic = "force-dynamic"

export default async function CalendarPage() {
  const bookings = await prisma.booking.findMany({
    orderBy: { eventDate: "asc" }
  })

  const blockedDates = await prisma.availability.findMany({
    where: { isBlocked: true }
  })

  const serializedBookings = bookings.map(b => ({
    id: b.id,
    customerName: b.customerName,
    prestationName: b.prestationName,
    quantity: b.quantity,
    prestationPrice: b.prestationPrice,
    supplements: b.supplements,
    discountAmount: b.discountAmount,
    eventDate: b.eventDate.toISOString(),
    status: b.status,
    eventType: b.eventType,
    allergies: b.allergies,
  }))

  const serializedBlockedDates = blockedDates.map(b => ({
    id: b.id,
    date: b.date.toISOString(),
    reason: b.reason
  }))

  const minNoticeSetting = await prisma.setting.findUnique({ where: { key: "MIN_NOTICE_HOURS" } })
  const minNoticeHours = minNoticeSetting ? parseInt(minNoticeSetting.value, 10) : 48

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-gray-900">Calendrier des prestations</h2>
        <p className="text-gray-500 text-sm mt-1">
          Vue d&apos;ensemble des commandes et événements à venir. Cliquez sur une date ou bloquez une période de congés.
        </p>
      </div>

      <AdminCalendar 
        bookings={serializedBookings} 
        blockedDates={serializedBlockedDates} 
        initialMinNoticeHours={minNoticeHours} 
      />
    </div>
  )
}
