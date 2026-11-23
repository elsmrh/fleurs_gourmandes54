import { Fragment } from "react"
import { prisma } from "@/lib/prisma"
import Link from "next/link"
import { ArrowRight, Search, ChevronLeft, ChevronRight } from "lucide-react"
import OrderFilters from "@/components/admin/OrderFilters"
import { QuickStatusSelect } from "@/components/admin/StatusActions"
import { calculateBookingTotal } from "@/lib/orders"

const PAGE_SIZE = 10

/** "2026-11-30" → Date UTC à minuit (les dates d'événement sont stockées ainsi). */
function parseDay(value: string | undefined) {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return null
  const d = new Date(`${value}T00:00:00.000Z`)
  return isNaN(d.getTime()) ? null : d
}

export default async function CommandesPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; q?: string; page?: string; sort?: string; dateStart?: string; dateEnd?: string }>
}) {
  const params = await searchParams
  const statusFilter = params.status || "ALL"
  const search = params.q || ""
  const page = Math.max(1, parseInt(params.page || "1", 10) || 1)
  const sort = params.sort || "created_desc"

  // Par défaut : toutes les dates (sinon une commande pour un événement dans 3 mois
  // était invisible). Le filtre par mois reste disponible dans les filtres.
  const dateStart = params.dateStart || ""
  const dateEnd = params.dateEnd || ""
  const startDay = parseDay(dateStart)
  const endDay = parseDay(dateEnd)
  // Fin de période inclusive : on prend tout ce qui est avant le lendemain minuit
  const endExclusive = endDay ? new Date(endDay.getTime() + 24 * 60 * 60 * 1000) : null

  // Base where clause (everything EXCEPT status) for the tabs counts
  const baseWhere = {
    ...(search ? {
      OR: [
        { customerName: { contains: search, mode: "insensitive" as any } },
        { customerEmail: { contains: search, mode: "insensitive" as any } },
        { prestationName: { contains: search, mode: "insensitive" as any } },
      ]
    } : {}),
    ...(startDay || endExclusive ? {
      eventDate: {
        ...(startDay ? { gte: startDay } : {}),
        ...(endExclusive ? { lt: endExclusive } : {}),
      }
    } : {})
  }

  // Final where clause including status for the actual list
  const where = {
    ...baseWhere,
    ...(statusFilter !== "ALL" ? { status: statusFilter } : {}),
  }

  // Build order by
  let orderBy = {}
  if (sort === "event_asc") orderBy = { eventDate: "asc" }
  else if (sort === "event_desc") orderBy = { eventDate: "desc" }
  else orderBy = { createdAt: "desc" }

  // Fetch data
  const totalItems = await prisma.booking.count({ where })
  const totalPages = Math.ceil(totalItems / PAGE_SIZE)

  const bookings = await prisma.booking.findMany({
    where,
    orderBy,
    skip: (page - 1) * PAGE_SIZE,
    take: PAGE_SIZE,
  })

  // Fetch counts for tabs using baseWhere so it reflects current month/search but ignores the active tab
  const counts = await prisma.booking.groupBy({
    by: ["status"],
    where: baseWhere,
    _count: true,
  })
  const countMap: Record<string, number> = { ALL: 0 }
  counts.forEach(c => {
    countMap[c.status] = c._count
    countMap["ALL"] = (countMap["ALL"] || 0) + c._count
  })

  const filters = [
    { key: "ALL", label: "Toutes" },
    { key: "PENDING", label: "En attente" },
    { key: "DEVIS_SENT", label: "Devis envoyé" },
    { key: "CONFIRMED", label: "Confirmées" },
    { key: "CANCELLED", label: "Annulées" },
  ]

  const buildUrl = (updates: Record<string, string | null>) => {
    const p = new URLSearchParams()
    if (statusFilter !== "ALL") p.set("status", statusFilter)
    if (search) p.set("q", search)
    if (sort !== "created_desc") p.set("sort", sort)
    if (dateStart) p.set("dateStart", dateStart)
    if (dateEnd) p.set("dateEnd", dateEnd)
    if (page > 1) p.set("page", page.toString())

    Object.entries(updates).forEach(([k, v]) => {
      if (v === null) p.delete(k)
      else p.set(k, v)
    })
    
    return `/admin/commandes?${p.toString()}`
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 tracking-tight">Commandes</h2>
          <p className="text-gray-500 text-sm mt-1">{totalItems} commande(s) au total</p>
        </div>
      </div>

      <OrderFilters />

      {/* Status filters */}
      <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4 md:mx-0 md:px-0 md:pb-0 md:flex-wrap snap-x scrollbar-hide">
        {filters.map(f => {
          const isActive = statusFilter === f.key
          return (
            <Link
              key={f.key}
              href={buildUrl({ status: f.key, page: "1" })}
              className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-semibold transition-all snap-start flex items-center gap-2 ${
                isActive
                  ? "bg-stone-900 text-white shadow-sm"
                  : "bg-white border border-stone-200 text-gray-600 hover:border-stone-300 hover:bg-stone-50"
              }`}
            >
              {f.label}
              {countMap[f.key] > 0 && (
                <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${isActive ? "bg-white/20 text-white" : "bg-stone-100 text-gray-500"}`}>
                  {countMap[f.key]}
                </span>
              )}
            </Link>
          )
        })}
      </div>

      {bookings.length === 0 ? (
        <div className="bg-white rounded-3xl border border-stone-100 text-center py-20 px-4 shadow-sm">
          <div className="w-16 h-16 bg-stone-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <Search className="w-6 h-6 text-gray-300" />
          </div>
          <p className="text-lg font-bold text-gray-900 mb-1">Aucune commande</p>
          <p className="text-sm text-gray-500">Nous n'avons trouvé aucune commande correspondant à ces filtres.</p>
          {(search || dateStart || dateEnd || statusFilter !== "ALL") && (
            <Link href="/admin/commandes" className="inline-block mt-4 text-sm font-medium text-pink-600 hover:text-pink-700 bg-pink-50 hover:bg-pink-100 px-4 py-2 rounded-lg transition-colors">
              Effacer les filtres
            </Link>
          )}
        </div>
      ) : (
        <>
          {/* Vue Mobile (Cartes) */}
          <div className="md:hidden flex flex-col gap-6">
            {Object.entries(
              bookings.reduce((acc, booking) => {
                const monthYear = booking.eventDate.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })
                if (!acc[monthYear]) acc[monthYear] = []
                acc[monthYear].push(booking)
                return acc
              }, {} as Record<string, typeof bookings>)
            ).map(([monthYear, monthBookings]) => (
              <div key={monthYear} className="flex flex-col gap-3">
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">{monthYear}</h3>
                {monthBookings.map(booking => {
                  const total = calculateBookingTotal(booking)
                  return (
                    <div
                      key={booking.id}
                      className="bg-white rounded-2xl border border-stone-100 shadow-sm"
                    >
                      <div className="flex justify-between items-start gap-3 p-4 pb-0">
                        <Link href={`/admin/commandes/${booking.id}`} className="min-w-0 flex-1">
                          <div className="font-bold text-gray-900 truncate">{booking.customerName}</div>
                          <div className="text-gray-500 text-xs mt-0.5 capitalize">{booking.eventDate.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })}</div>
                        </Link>
                        <QuickStatusSelect bookingId={booking.id} currentStatus={booking.status} customerName={booking.customerName} />
                      </div>
                      
                      <Link
                        href={`/admin/commandes/${booking.id}`}
                        className="flex justify-between items-end mx-4 pb-4 pt-3 mt-3 border-t border-stone-50 active:opacity-70 transition-opacity"
                      >
                        <div>
                          <div className="font-medium text-gray-800 text-sm">{booking.prestationName}</div>
                          <div className="text-gray-400 text-xs mt-0.5">Quantité : {booking.quantity}</div>
                        </div>
                        <div className="font-black text-pink-600 text-lg">
                          {total.toFixed(0)} €
                        </div>
                      </Link>
                    </div>
                  )
                })}
              </div>
            ))}
          </div>

          {/* Vue Desktop (Tableau) */}
          <div className="hidden md:block bg-white rounded-2xl border border-stone-100 overflow-hidden shadow-sm">
            <table className="w-full text-sm">
              <thead className="bg-stone-50/80 border-b border-stone-100">
                <tr>
                  <th className="text-left py-4 px-6 font-semibold text-gray-500 uppercase tracking-wider text-xs">Client</th>
                  <th className="text-left py-4 px-4 font-semibold text-gray-500 uppercase tracking-wider text-xs">Bouquet</th>
                  <th className="text-left py-4 px-4 font-semibold text-gray-500 uppercase tracking-wider text-xs">Date événement</th>
                  <th className="text-left py-4 px-4 font-semibold text-gray-500 uppercase tracking-wider text-xs">Total</th>
                  <th className="text-left py-4 px-4 font-semibold text-gray-500 uppercase tracking-wider text-xs">Statut</th>
                  <th className="py-4 px-6 text-right font-semibold text-gray-500 uppercase tracking-wider text-xs">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-50">
                {Object.entries(
                  bookings.reduce((acc, booking) => {
                    const monthYear = booking.eventDate.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })
                    if (!acc[monthYear]) acc[monthYear] = []
                    acc[monthYear].push(booking)
                    return acc
                  }, {} as Record<string, typeof bookings>)
                ).map(([monthYear, monthBookings]) => (
                  <Fragment key={monthYear}>
                    <tr className="bg-stone-50/30">
                      <td colSpan={6} className="py-3 px-6 text-[10px] font-bold text-gray-400 uppercase tracking-wider bg-stone-50/50 border-y border-stone-100/50">
                        {monthYear}
                      </td>
                    </tr>
                    {monthBookings.map(booking => {
                      return (
                        <tr key={booking.id} className="hover:bg-stone-50/50 transition-colors group">
                          <td className="py-4 px-6">
                            <div className="font-bold text-gray-900">{booking.customerName}</div>
                            <div className="text-gray-400 text-xs">{booking.customerEmail}</div>
                            <div className="text-gray-400 text-xs">{booking.customerPhone}</div>
                          </td>
                          <td className="py-4 px-4">
                            <div className="font-medium text-gray-800">{booking.prestationName}</div>
                            <div className="text-gray-400 text-xs">× {booking.quantity}</div>
                          </td>
                          <td className="py-4 px-4 text-gray-500 capitalize">
                            {booking.eventDate.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                          </td>
                          <td className="py-4 px-4 font-bold text-gray-900">
                            {calculateBookingTotal(booking).toFixed(0)} €
                          </td>
                          <td className="py-4 px-4">
                            <QuickStatusSelect bookingId={booking.id} currentStatus={booking.status} customerName={booking.customerName} />
                          </td>
                          <td className="py-4 px-6 text-right">
                            <Link
                              href={`/admin/commandes/${booking.id}`}
                              className="inline-flex items-center justify-center p-2 text-gray-400 hover:text-pink-600 hover:bg-pink-50 rounded-xl transition-colors"
                            >
                              <ArrowRight className="w-4 h-4" />
                            </Link>
                          </td>
                        </tr>
                      )
                    })}
                  </Fragment>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between bg-white border border-stone-100 rounded-2xl px-4 py-3 shadow-sm mt-6">
              <Link 
                href={page > 1 ? buildUrl({ page: (page - 1).toString() }) : '#'} 
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${page > 1 ? "text-gray-700 hover:bg-stone-50" : "text-gray-300 pointer-events-none"}`}
              >
                <ChevronLeft className="w-4 h-4" /> Précédent
              </Link>
              
              <div className="text-sm font-medium text-gray-500">
                Page <span className="text-gray-900">{page}</span> sur {totalPages}
              </div>
              
              <Link 
                href={page < totalPages ? buildUrl({ page: (page + 1).toString() }) : '#'} 
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${page < totalPages ? "text-gray-700 hover:bg-stone-50" : "text-gray-300 pointer-events-none"}`}
              >
                Suivant <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          )}
        </>
      )}
    </div>
  )
}

