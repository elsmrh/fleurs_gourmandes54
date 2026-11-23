import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Mail, Phone, CalendarDays, ArrowRight, MessageCircle, AlertTriangle } from "lucide-react"
import { calculateBookingTotal as getBookingTotal } from "@/lib/orders"
import StatusBadge from "@/components/admin/StatusBadge"
import { whatsAppLink } from "@/lib/contact-links"

export default async function ClientDetailPage({ params }: { params: Promise<{ email: string }> }) {
  const { email } = await params
  const decodedEmail = decodeURIComponent(email)

  const bookings = await prisma.booking.findMany({
    where: { customerEmail: { equals: decodedEmail, mode: "insensitive" } },
    orderBy: { createdAt: "desc" }
  })

  if (bookings.length === 0) {
    notFound()
  }

  const latestBooking = bookings[0]
  const clientName = latestBooking.customerName
  const clientPhone = latestBooking.customerPhone
  const firstName = clientName.trim().split(/\s+/)[0] || ""
  const waLink = whatsAppLink(clientPhone, `Bonjour ${firstName}, c'est Fleurs Gourmandes 54 🌸`)

  // Allergies connues sur l'ensemble des commandes du client
  const knownAllergies = Array.from(
    new Set(
      bookings
        .map(b => b.allergies?.trim())
        .filter((a): a is string => Boolean(a))
    )
  )

  const totalSpent = bookings.filter(b => b.status === "CONFIRMED").reduce((acc, b) => acc + getBookingTotal(b), 0)
  const orderCount = bookings.filter(b => b.status !== "CANCELLED").length

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      <Link href="/admin/clients" className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-pink-600 transition-colors font-medium">
        <ArrowLeft className="w-4 h-4" /> Retour à la liste des clients
      </Link>

      {/* Header Profile */}
      <div className="bg-white rounded-3xl p-6 md:p-8 shadow-[0_2px_20px_-4px_rgba(0,0,0,0.05)] border border-stone-100 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-start sm:items-center gap-5">
          <div className="w-16 h-16 shrink-0 bg-pink-100 text-pink-600 rounded-full flex items-center justify-center text-2xl font-black shadow-sm">
            {clientName.charAt(0).toUpperCase()}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">{clientName}</h1>
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mt-2 text-sm text-gray-600">
              <a href={`mailto:${decodedEmail}`} className="flex items-center gap-1.5 hover:text-pink-600 transition-colors">
                <Mail className="w-4 h-4 text-gray-400" /> {decodedEmail}
              </a>
              <a href={`tel:${clientPhone}`} className="flex items-center gap-1.5 hover:text-pink-600 transition-colors">
                <Phone className="w-4 h-4 text-gray-400" /> {clientPhone}
              </a>
              {waLink && (
                <a
                  href={waLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[#25D366]/10 text-[#128C7E] hover:bg-[#25D366]/20 font-semibold text-xs transition-colors w-fit"
                >
                  <MessageCircle className="w-3.5 h-3.5" /> WhatsApp
                </a>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-6 bg-stone-50 px-6 py-4 rounded-2xl border border-stone-100/50 w-full md:w-auto justify-between md:justify-start">
          <div className="text-center">
            <p className="text-[10px] uppercase tracking-widest text-gray-400 font-bold mb-1">Commandes</p>
            <p className="text-2xl font-black text-gray-900">{orderCount}</p>
          </div>
          <div className="w-px h-10 bg-gray-200"></div>
          <div className="text-center">
            <p className="text-[10px] uppercase tracking-widest text-gray-400 font-bold mb-1">Total Dépensé</p>
            <p className="text-2xl font-black text-emerald-600">{totalSpent.toFixed(2).replace('.00', '')} €</p>
          </div>
        </div>
      </div>

      {/* Alerte allergies connues */}
      {knownAllergies.length > 0 && (
        <div className="flex items-start gap-3 bg-red-50 border border-red-100 rounded-2xl p-4 text-red-700">
          <AlertTriangle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
          <div>
            <p className="text-xs font-bold uppercase tracking-wider">Allergies signalées sur ses commandes</p>
            <p className="text-sm font-medium mt-0.5">{knownAllergies.join(" • ")}</p>
          </div>
        </div>
      )}

      {/* Historique des commandes */}
      <h2 className="text-lg font-bold text-gray-900 mt-8 mb-4">Historique des commandes</h2>
      
      <div className="bg-white rounded-3xl p-5 shadow-[0_2px_20px_-4px_rgba(0,0,0,0.05)] border border-stone-100">
        
        {/* Vue Mobile (Cartes) */}
        <div className="md:hidden flex flex-col gap-3">
          {bookings.map(booking => (
            <Link key={booking.id} href={`/admin/commandes/${booking.id}`} className="block bg-white hover:bg-stone-50 transition-colors rounded-2xl p-4 border border-stone-100 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
              <div className="flex justify-between items-start mb-3">
                <div className="flex-1">
                  <div className="font-bold text-gray-900 leading-tight mb-1">{booking.prestationName} <span className="text-gray-400 font-medium text-sm ml-1">×{booking.quantity}</span></div>
                  <div className="text-gray-500 text-xs flex items-center gap-1.5 mt-2">
                    <CalendarDays className="w-3.5 h-3.5" /> Événement : {booking.eventDate.toLocaleDateString('fr-FR')}
                  </div>
                </div>
                <div className="font-black text-pink-600 text-lg ml-3 whitespace-nowrap">
                  {getBookingTotal(booking).toFixed(0)} €
                </div>
              </div>
              <div className="flex justify-between items-center border-t border-stone-50 pt-3 mt-3">
                <div className="text-gray-400 text-[10px] uppercase tracking-wider font-semibold">
                  Acheté le {booking.createdAt.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: '2-digit' })}
                </div>
                <StatusBadge status={booking.status} className="text-[10px]" />
              </div>
            </Link>
          ))}
        </div>

        {/* Vue Desktop (Tableau) */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-stone-100 text-left text-gray-400 text-xs uppercase tracking-wider">
                <th className="pb-4 pr-4 font-semibold">Date d&apos;achat</th>
                <th className="pb-4 pr-4 font-semibold">Prestation</th>
                <th className="pb-4 pr-4 font-semibold">Événement</th>
                <th className="pb-4 pr-4 font-semibold">Total</th>
                <th className="pb-4 pr-4 font-semibold">Statut</th>
                <th className="pb-4 font-semibold text-right"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-50">
              {bookings.map(booking => (
                <tr key={booking.id} className="hover:bg-stone-50 transition-colors group">
                  <td className="py-4 pr-4 text-gray-600 font-medium">
                    {booking.createdAt.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </td>
                  <td className="py-4 pr-4">
                    <span className="font-semibold text-gray-900">{booking.prestationName}</span>
                    <span className="text-gray-400 ml-1">×{booking.quantity}</span>
                  </td>
                  <td className="py-4 pr-4 text-gray-500">
                    <div className="flex items-center gap-1.5">
                      <CalendarDays className="w-3.5 h-3.5" />
                      {booking.eventDate.toLocaleDateString('fr-FR')}
                    </div>
                  </td>
                  <td className="py-4 pr-4 font-black text-gray-900">
                    {getBookingTotal(booking).toFixed(2).replace('.00', '')} €
                  </td>
                  <td className="py-4 pr-4">
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
      </div>
    </div>
  )
}
