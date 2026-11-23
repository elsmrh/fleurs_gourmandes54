import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Mail, Phone, Calendar, Flower2, AlertTriangle, MessageCircle } from "lucide-react"
import StatusActions from "@/components/admin/StatusActions"
import StatusBadge from "@/components/admin/StatusBadge"
import PriceEditor from "@/components/admin/PriceEditor"
import { orderWhatsAppMessage, whatsAppLink } from "@/lib/contact-links"

export default async function CommandeDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const booking = await prisma.booking.findUnique({ where: { id } })

  if (!booking) notFound()

  const waLink = whatsAppLink(
    booking.customerPhone,
    orderWhatsAppMessage(booking.customerName, booking.prestationName, booking.eventDate)
  )

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-28 md:pb-12">
      {/* Navigation & Header */}
      <div className="mb-8">
        <Link href="/admin/commandes" className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-pink-600 mb-6 transition-colors font-medium">
          <ArrowLeft className="w-4 h-4" /> Retour aux commandes
        </Link>
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 flex-wrap mb-2">
              <h2 className="text-3xl font-bold text-gray-900 tracking-tight">Commande <span className="text-gray-400 font-medium">#{id.slice(-8).toUpperCase()}</span></h2>
              <StatusBadge status={booking.status} className="px-3" />
            </div>
            <p className="text-gray-500 text-sm">
              Reçue le {booking.createdAt.toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })} à {booking.createdAt.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
            </p>
          </div>
          <Link 
            href={`/admin/facture/${booking.id}`} 
            target="_blank"
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-white border border-stone-200 hover:bg-stone-50 hover:border-stone-300 text-gray-700 font-semibold rounded-xl transition-all shadow-sm"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
            Devis / Facture
          </Link>
        </div>
      </div>

      {/* Actions (Now directly visible without ugly generic card) */}
      <div className="bg-white rounded-2xl border border-stone-100 p-4 sm:p-6 shadow-sm mb-8">
        <StatusActions bookingId={booking.id} currentStatus={booking.status} customerName={booking.customerName} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Client */}
        <div className="bg-white rounded-2xl border border-stone-100 shadow-sm overflow-hidden">
          <div className="bg-stone-50 border-b border-stone-100 px-6 py-4 flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-sm">
              <Mail className="w-4 h-4 text-gray-500" />
            </div>
            <h3 className="font-semibold text-gray-900">Coordonnées Client</h3>
          </div>
          <div className="p-6 space-y-4">
            <p className="text-xl font-bold text-gray-900">{booking.customerName}</p>
            <div className="space-y-3">
              <a href={`mailto:${booking.customerEmail}`} className="flex items-center gap-3 text-pink-600 hover:text-pink-700 transition-colors font-medium">
                <Mail className="w-4 h-4 text-pink-400" />
                {booking.customerEmail}
              </a>
              <a href={`tel:${booking.customerPhone}`} className="flex items-center gap-3 text-gray-600 hover:text-gray-900 transition-colors font-medium">
                <Phone className="w-4 h-4 text-gray-400" />
                {booking.customerPhone}
              </a>
            </div>
            {waLink && (
              <a
                href={waLink}
                target="_blank"
                rel="noopener noreferrer"
                className="hidden md:inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#25D366]/10 text-[#128C7E] hover:bg-[#25D366]/20 font-semibold text-sm transition-colors"
              >
                <MessageCircle className="w-4 h-4" />
                Écrire sur WhatsApp
              </a>
            )}
          </div>
        </div>

        {/* Prestation */}
        <div className="bg-white rounded-2xl border border-stone-100 shadow-sm overflow-hidden">
          <div className="bg-pink-50/50 border-b border-pink-100/50 px-6 py-4 flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-sm">
              <Flower2 className="w-4 h-4 text-pink-500" />
            </div>
            <h3 className="font-semibold text-gray-900">Détails Prestation</h3>
          </div>
          <div className="p-6 space-y-4">
            <div className="text-xl font-bold text-gray-900">{booking.prestationName}</div>
            
            <PriceEditor 
              bookingId={booking.id} 
              prestationName={booking.prestationName}
              initialPrice={booking.prestationPrice} 
              quantity={booking.quantity}
              initialSupplements={(booking.supplements as any) || []}
            />
          </div>
        </div>

        {/* Événement */}
        <div className="bg-white rounded-2xl border border-stone-100 shadow-sm overflow-hidden">
          <div className="bg-stone-50 border-b border-stone-100 px-6 py-4 flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-sm">
              <Calendar className="w-4 h-4 text-gray-500" />
            </div>
            <h3 className="font-semibold text-gray-900">Événement</h3>
          </div>
          <div className="p-6 space-y-4">
            <div className="flex flex-col">
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Date prévue</span>
              <span className="text-lg font-bold text-gray-900 capitalize">
                {booking.eventDate.toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </span>
            </div>
            {booking.eventType && (
              <div className="pt-4 border-t border-stone-100">
                <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider block mb-1">Type d'événement</span>
                <span className="font-medium text-gray-900">{booking.eventType}</span>
              </div>
            )}
          </div>
        </div>

        {/* Personnalisation */}
        <div className="bg-white rounded-2xl border border-stone-100 shadow-sm overflow-hidden">
          <div className="bg-stone-50 border-b border-stone-100 px-6 py-4 flex items-center gap-2">
            <h3 className="font-semibold text-gray-900">Personnalisation</h3>
          </div>
          <div className="p-6 space-y-6">
            {/* Parfums */}
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Parfums souhaités</p>
              {booking.flavors ? (
                <div className="flex flex-wrap gap-2">
                  {booking.flavors.split(",").map(f => (
                    <span key={f} className="bg-pink-50 text-pink-700 px-3.5 py-1.5 rounded-full text-sm font-medium border border-pink-100">
                      {f.trim()}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-gray-400 italic text-sm">Aucun parfum spécifié</p>
              )}
            </div>

            {/* Allergies */}
            {booking.allergies && (
              <div className="flex gap-3 bg-red-50 rounded-xl p-4 border border-red-100">
                <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0" />
                <div>
                  <p className="font-bold text-red-700 text-xs uppercase tracking-wider mb-1">Allergies signalées !</p>
                  <p className="text-red-700 font-medium text-sm">{booking.allergies}</p>
                </div>
              </div>
            )}

            {/* Message et notes */}
            {(booking.message || booking.notes) && (
              <div className="space-y-4 pt-4 border-t border-stone-100">
                {booking.message && (
                  <div>
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Message sur la création</p>
                    <div className="bg-stone-50 rounded-xl p-4 text-sm font-medium text-gray-800 italic relative">
                      <span className="absolute text-stone-200 text-4xl leading-none -top-2 left-2 font-serif">"</span>
                      <span className="relative z-10 pl-4 block">{booking.message}</span>
                    </div>
                  </div>
                )}

                {booking.notes && (
                  <div>
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Notes client</p>
                    <p className="text-sm text-gray-700 bg-white border border-stone-100 rounded-xl p-4">{booking.notes}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Référence */}
      <div className="text-center pt-8 border-t border-gray-100 mt-8">
        <p className="text-xs text-gray-400 font-mono">ID: {booking.id}</p>
      </div>

      {/* Barre d'actions rapide (mobile) */}
      <nav
        aria-label="Contacter le client"
        className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur border-t border-stone-100 px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] grid grid-cols-3 gap-2"
      >
        <a href={`tel:${booking.customerPhone}`} className="flex flex-col items-center gap-1 py-2 rounded-xl bg-stone-50 text-gray-700 text-xs font-semibold active:scale-95 transition-transform">
          <Phone className="w-5 h-5" />
          Appeler
        </a>
        {waLink ? (
          <a href={waLink} target="_blank" rel="noopener noreferrer" className="flex flex-col items-center gap-1 py-2 rounded-xl bg-[#25D366]/10 text-[#128C7E] text-xs font-semibold active:scale-95 transition-transform">
            <MessageCircle className="w-5 h-5" />
            WhatsApp
          </a>
        ) : (
          <a href={`sms:${booking.customerPhone}`} className="flex flex-col items-center gap-1 py-2 rounded-xl bg-stone-50 text-gray-700 text-xs font-semibold active:scale-95 transition-transform">
            <MessageCircle className="w-5 h-5" />
            SMS
          </a>
        )}
        <a href={`mailto:${booking.customerEmail}`} className="flex flex-col items-center gap-1 py-2 rounded-xl bg-pink-50 text-pink-700 text-xs font-semibold active:scale-95 transition-transform">
          <Mail className="w-5 h-5" />
          Email
        </a>
      </nav>
    </div>
  )
}

