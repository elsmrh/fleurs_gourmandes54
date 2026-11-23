import Link from "next/link"
import { CalendarClock, AlertCircle, TrendingUp, TrendingDown, ArrowRight, Wallet, ShoppingBag, AlertTriangle, ChefHat } from "lucide-react"
import { prisma } from "@/lib/prisma"
import RevenueChart from "@/components/admin/RevenueChart"
import StatusBadge from "@/components/admin/StatusBadge"
import { calculateBookingTotal as getBookingTotal } from "@/lib/orders"

const DAY_MS = 24 * 60 * 60 * 1000

/** Libellé lisible d'un jour d'événement ("Aujourd'hui", "Demain", "Samedi 8 nov."). */
function dayLabel(dayKey: string, todayKey: string, tomorrowKey: string) {
  if (dayKey === todayKey) return "Aujourd'hui"
  if (dayKey === tomorrowKey) return "Demain"
  const label = new Date(`${dayKey}T12:00:00.000Z`).toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "short", timeZone: "UTC" })
  return label.charAt(0).toUpperCase() + label.slice(1)
}

export default async function AdminDashboard() {
  const now = new Date()
  const startOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)

  // 12 months ago
  const startOf12MonthsAgo = new Date(now.getFullYear(), now.getMonth() - 11, 1)

  // Fenêtre "À préparer" : d'aujourd'hui à J+7 inclus.
  // Les dates d'événement sont stockées à minuit UTC, on compare donc en UTC.
  const todayUtc = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()))
  const weekEndUtc = new Date(todayUtc.getTime() + 8 * DAY_MS)
  const todayKey = todayUtc.toISOString().slice(0, 10)
  const tomorrowKey = new Date(todayUtc.getTime() + DAY_MS).toISOString().slice(0, 10)

  const weekBookings = await prisma.booking.findMany({
    where: {
      eventDate: { gte: todayUtc, lt: weekEndUtc },
      status: { not: "CANCELLED" },
    },
    orderBy: [{ eventDate: "asc" }, { createdAt: "asc" }],
  })

  const weekByDay = weekBookings.reduce((acc, b) => {
    const key = b.eventDate.toISOString().slice(0, 10)
    ;(acc[key] ||= []).push(b)
    return acc
  }, {} as Record<string, typeof weekBookings>)
  const weekAllergyCount = weekBookings.filter(b => b.allergies?.trim()).length
  const weekUnconfirmedCount = weekBookings.filter(b => b.status !== "CONFIRMED").length

  // Statistiques globales
  const upcomingBookingsCount = await prisma.booking.count({
    where: { eventDate: { gte: now }, status: { not: 'CANCELLED' } }
  })
  
  const pendingBookingsCount = await prisma.booking.count({
    where: { status: "PENDING" }
  })
  
  // Fetch all confirmed/devis bookings from the last 12 months
  const yearlyData = await prisma.booking.findMany({
    where: {
      createdAt: { gte: startOf12MonthsAgo },
      status: { in: ['CONFIRMED', 'DEVIS_SENT'] }
    }
  })

  let caThisMonth = 0
  let caLastMonth = 0
  let countThisMonth = 0
  let countLastMonth = 0

  // Build an array of 12 months initialized to 0
  const monthsStr = ["Jan", "Fév", "Mar", "Avr", "Mai", "Juin", "Juil", "Aoû", "Sep", "Oct", "Nov", "Déc"]
  const chartData: { monthStr: string; month: string; yearMonth: string; ca: number }[] = []
  for (let i = 11; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    chartData.push({
      monthStr: `${monthsStr[d.getMonth()]} ${d.getFullYear().toString().slice(-2)}`,
      month: monthsStr[d.getMonth()], // Displayed on x-axis
      yearMonth: `${d.getFullYear()}-${d.getMonth()}`, // For matching
      ca: 0
    })
  }

  yearlyData.forEach(b => {
    const isThisMonth = b.createdAt >= startOfThisMonth
    const isLastMonth = b.createdAt >= startOfLastMonth && b.createdAt < startOfThisMonth
    const total = getBookingTotal(b)
    
    // Add to chart data if confirmed
    if (b.status === "CONFIRMED") {
      const bYearMonth = `${b.createdAt.getFullYear()}-${b.createdAt.getMonth()}`
      const chartItem = chartData.find(c => c.yearMonth === bYearMonth)
      if (chartItem) chartItem.ca += total

      if (isThisMonth) caThisMonth += total
      else if (isLastMonth) caLastMonth += total
    }
    
    // Command counts
    if (isThisMonth) countThisMonth++
    else if (isLastMonth) countLastMonth++
  })

  const caGrowth = caLastMonth === 0 ? 100 : Math.round(((caThisMonth - caLastMonth) / caLastMonth) * 100)
  const countGrowth = countLastMonth === 0 ? 100 : Math.round(((countThisMonth - countLastMonth) / countLastMonth) * 100)

  // Dernières commandes
  const recentBookings = await prisma.booking.findMany({
    orderBy: { createdAt: "desc" },
    take: 5,
  })

  return (
    <div className="space-y-8">
      {/* 4 KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* CA du mois */}
        <div className="bg-white rounded-2xl p-5 border border-stone-100 shadow-sm flex flex-col justify-between">
           <div className="flex items-center justify-between mb-4">
             <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600">
               <Wallet className="w-5 h-5" />
             </div>
             {caGrowth !== 0 && (
               <div className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full ${caGrowth > 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
                 {caGrowth > 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                 {Math.abs(caGrowth)}%
               </div>
             )}
           </div>
           <div>
             <p className="text-gray-500 font-medium text-xs sm:text-sm mb-1 uppercase tracking-wider">CA (Ce mois)</p>
             <h3 className="text-2xl sm:text-3xl font-black text-gray-900">{caThisMonth.toFixed(0)} €</h3>
           </div>
        </div>

        {/* Commandes du mois */}
        <div className="bg-white rounded-2xl p-5 border border-stone-100 shadow-sm flex flex-col justify-between">
           <div className="flex items-center justify-between mb-4">
             <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
               <ShoppingBag className="w-5 h-5" />
             </div>
             {countGrowth !== 0 && (
               <div className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full ${countGrowth > 0 ? 'bg-blue-50 text-blue-600' : 'bg-red-50 text-red-600'}`}>
                 {countGrowth > 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                 {Math.abs(countGrowth)}%
               </div>
             )}
           </div>
           <div>
             <p className="text-gray-500 font-medium text-xs sm:text-sm mb-1 uppercase tracking-wider">Commandes</p>
             <h3 className="text-2xl sm:text-3xl font-black text-gray-900">{countThisMonth}</h3>
           </div>
        </div>

        {/* À traiter (Urgent) */}
        <Link href="/admin/commandes?status=PENDING" className="bg-gradient-to-br from-orange-50 to-orange-100/50 hover:from-orange-100 hover:to-orange-200/50 transition-colors rounded-2xl p-5 border border-orange-100 shadow-sm flex flex-col justify-between group">
           <div className="flex items-center justify-between mb-4">
             <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center text-orange-600">
               <AlertCircle className="w-5 h-5" />
             </div>
             <ArrowRight className="w-4 h-4 text-orange-400 group-hover:translate-x-1 transition-transform" />
           </div>
           <div>
             <p className="text-orange-600/80 font-bold text-xs sm:text-sm mb-1 uppercase tracking-wider">À traiter (Devis)</p>
             <h3 className="text-2xl sm:text-3xl font-black text-orange-700">{pendingBookingsCount}</h3>
           </div>
        </Link>
        
        {/* Événements à venir */}
        <Link href="/admin/calendar" className="bg-pink-50/50 hover:bg-pink-50 transition-colors rounded-2xl p-5 border border-pink-100 shadow-sm flex flex-col justify-between group">
           <div className="flex items-center justify-between mb-4">
             <div className="w-10 h-10 rounded-full bg-pink-100 flex items-center justify-center text-pink-600">
               <CalendarClock className="w-5 h-5" />
             </div>
             <ArrowRight className="w-4 h-4 text-pink-400 group-hover:translate-x-1 transition-transform" />
           </div>
           <div>
             <p className="text-pink-600/80 font-bold text-xs sm:text-sm mb-1 uppercase tracking-wider">Événements (Futur)</p>
             <h3 className="text-2xl sm:text-3xl font-black text-pink-700">{upcomingBookingsCount}</h3>
           </div>
        </Link>
      </div>

      {/* À préparer cette semaine */}
      <div className="bg-white rounded-3xl p-5 sm:p-7 shadow-[0_2px_20px_-4px_rgba(0,0,0,0.05)] border border-stone-100">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-pink-50 flex items-center justify-center text-pink-600">
              <ChefHat className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">À préparer cette semaine</h2>
              <p className="text-xs text-gray-500">
                {weekBookings.length === 0
                  ? "Rien de prévu sur les 7 prochains jours"
                  : `${weekBookings.length} création${weekBookings.length > 1 ? "s" : ""} sur les 7 prochains jours`}
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {weekAllergyCount > 0 && (
              <span className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full bg-red-50 text-red-700">
                <AlertTriangle className="w-3.5 h-3.5" />
                {weekAllergyCount} avec allergies
              </span>
            )}
            {weekUnconfirmedCount > 0 && (
              <span className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full bg-orange-50 text-orange-700">
                <AlertCircle className="w-3.5 h-3.5" />
                {weekUnconfirmedCount} pas encore confirmée{weekUnconfirmedCount > 1 ? "s" : ""}
              </span>
            )}
          </div>
        </div>

        {weekBookings.length === 0 ? (
          <div className="text-center py-8 bg-stone-50 rounded-2xl border border-dashed border-stone-200">
            <p className="text-gray-500 text-sm">Profitez-en pour souffler 🌸</p>
          </div>
        ) : (
          <div className="space-y-6">
            {Object.entries(weekByDay).map(([dayKey, dayBookings]) => (
              <div key={dayKey}>
                <h3 className={`text-xs font-bold uppercase tracking-wider mb-3 ${dayKey === todayKey ? "text-pink-600" : "text-gray-400"}`}>
                  {dayLabel(dayKey, todayKey, tomorrowKey)}
                  <span className="ml-2 font-semibold text-gray-300">· {dayBookings.length}</span>
                </h3>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                  {dayBookings.map((b) => (
                    <Link
                      key={b.id}
                      href={`/admin/commandes/${b.id}`}
                      className={`block rounded-2xl border p-4 transition-colors hover:bg-stone-50 ${b.allergies?.trim() ? "border-red-200" : "border-stone-100"}`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="font-bold text-gray-900 truncate">
                            {b.prestationName} <span className="text-gray-400 font-medium">×{b.quantity}</span>
                          </p>
                          <p className="text-xs text-gray-500 truncate">
                            {b.customerName}{b.eventType ? ` · ${b.eventType}` : ""}
                          </p>
                        </div>
                        <StatusBadge status={b.status} className="shrink-0 text-[10px]" />
                      </div>

                      {b.flavors && (
                        <div className="flex flex-wrap gap-1.5 mt-3">
                          {b.flavors.split(",").map((f) => f.trim()).filter(Boolean).map((f) => (
                            <span key={f} className="bg-pink-50 text-pink-700 px-2.5 py-0.5 rounded-full text-xs font-medium">{f}</span>
                          ))}
                        </div>
                      )}

                      {b.allergies?.trim() && (
                        <p className="mt-3 flex items-start gap-2 text-xs font-semibold text-red-700 bg-red-50 rounded-lg px-3 py-2">
                          <AlertTriangle className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                          <span>Allergies : {b.allergies}</span>
                        </p>
                      )}

                      {b.message && (
                        <p className="mt-2 text-xs text-gray-600 italic truncate">« {b.message} »</p>
                      )}
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Revenue Chart (12 months) */}
      <div className="bg-white rounded-3xl p-5 sm:p-7 shadow-[0_2px_20px_-4px_rgba(0,0,0,0.05)] border border-stone-100">
        <h2 className="text-lg font-bold text-gray-900 mb-6">Évolution du Chiffre d'Affaires (12 derniers mois)</h2>
        <RevenueChart data={chartData} />
      </div>

      {/* Dernières commandes */}
      <div className="bg-white rounded-3xl p-5 sm:p-7 shadow-[0_2px_20px_-4px_rgba(0,0,0,0.05)] border border-stone-100">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold text-gray-900">Dernières commandes</h2>
          <Link href="/admin/commandes" className="text-sm font-semibold text-pink-500 hover:text-pink-600 flex items-center gap-1 bg-pink-50 px-3 py-1.5 rounded-full transition-colors">
            Voir tout <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {recentBookings.length === 0 ? (
          <div className="text-center py-10 bg-stone-50 rounded-2xl border border-dashed border-stone-200">
            <p className="text-gray-500 text-sm">Aucune commande pour le moment.</p>
          </div>
        ) : (
          <>
            {/* Mobile View */}
            <div className="md:hidden flex flex-col gap-3">
              {recentBookings.map((booking) => (
                <Link key={booking.id} href={`/admin/commandes/${booking.id}`} className="block bg-white hover:bg-stone-50 transition-colors rounded-2xl p-4 border border-stone-100 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <div className="font-bold text-gray-900">{booking.customerName}</div>
                      <div className="text-gray-500 text-xs mt-0.5">{booking.eventDate.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })}</div>
                    </div>
                    <StatusBadge status={booking.status} className="text-[10px]" />
                  </div>
                  <div className="flex justify-between items-end border-t border-stone-50 pt-3">
                    <div className="text-sm">
                      <div className="font-medium text-gray-800">{booking.prestationName}</div>
                      <div className="text-gray-400 text-xs">Quantité : {booking.quantity}</div>
                    </div>
                    <div className="font-black text-pink-600 text-lg">
                      {getBookingTotal(booking).toFixed(0)} €
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {/* Desktop View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-stone-100 text-left text-gray-400 text-xs uppercase tracking-wider">
                    <th className="pb-4 pr-4 font-semibold">Client</th>
                    <th className="pb-4 pr-4 font-semibold">Bouquet</th>
                    <th className="pb-4 pr-4 font-semibold">Date événement</th>
                    <th className="pb-4 pr-4 font-semibold">Total</th>
                    <th className="pb-4 font-semibold">Statut</th>
                    <th className="pb-4 font-semibold text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-50">
                  {recentBookings.map((booking) => (
                    <tr key={booking.id} className="hover:bg-stone-50 transition-colors group">
                      <td className="py-4 pr-4">
                        <div className="font-semibold text-gray-900">{booking.customerName}</div>
                        <div className="text-gray-400 text-xs">{booking.customerEmail}</div>
                      </td>
                      <td className="py-4 pr-4">
                        <span className="font-medium text-gray-800">{booking.prestationName}</span>
                        <span className="text-gray-400 ml-1">×{booking.quantity}</span>
                      </td>
                      <td className="py-4 pr-4 text-gray-500">{booking.eventDate.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}</td>
                      <td className="py-4 pr-4 font-black text-gray-900">{getBookingTotal(booking).toFixed(2).replace('.00', '')} €</td>
                      <td className="py-4">
                        <StatusBadge status={booking.status} className="text-[10px]" />
                      </td>
                      <td className="py-4 text-right">
                        <Link href={`/admin/commandes/${booking.id}`} className="inline-flex items-center justify-center p-2 text-gray-400 hover:text-pink-600 hover:bg-pink-50 rounded-lg transition-colors">
                          <ArrowRight className="w-4 h-4" />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
