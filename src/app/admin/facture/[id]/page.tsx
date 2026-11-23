import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import PrintButton from "@/components/admin/PrintButton"
import { calculateBookingTotal } from "@/lib/orders"

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const booking = await prisma.booking.findUnique({
    where: { id },
    select: { status: true, customerName: true },
  })
  const docType = booking?.status === "CONFIRMED" ? "Facture" : "Devis"
  const ref = id.slice(-8).toUpperCase()
  return {
    title: booking ? `${docType}-${ref}-${booking.customerName}` : `${docType}-${ref}`,
  }
}

export default async function InvoicePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const [booking, settings] = await Promise.all([
    prisma.booking.findUnique({ where: { id } }),
    prisma.setting.findMany(),
  ])

  if (!booking) notFound()

  const getSetting = (key: string, defaultValue = "") =>
    settings.find(s => s.key === key)?.value || defaultValue

  const businessAddress = getSetting("business_address", "Nancy, Meurthe-et-Moselle")
  const businessSiret = getSetting("business_siret", "")
  const depositPercent = parseFloat(getSetting("default_deposit_percent", "30")) || 0

  let supplements: { name: string; price: number }[] = []
  try {
    if (booking.supplements) {
      const parsed = typeof booking.supplements === 'string' ? JSON.parse(booking.supplements) : booking.supplements
      if (Array.isArray(parsed)) supplements = parsed
    }
  } catch {}

  const mainTotal = booking.prestationPrice * booking.quantity
  const supplementsTotal = supplements.reduce((acc, s) => acc + (Number(s.price) || 0), 0)
  const rawSubtotal = mainTotal + supplementsTotal
  const discountAmount = booking.discountAmount || 0

  const finalTotal = calculateBookingTotal({
    prestationPrice: booking.prestationPrice,
    quantity: booking.quantity,
    supplements: booking.supplements,
    discountAmount: booking.discountAmount,
  })

  const isDevis = booking.status === "PENDING" || booking.status === "DEVIS_SENT"
  const documentTitle = isDevis ? "DEVIS" : "FACTURE"
  const depositAmount = isDevis && depositPercent > 0 ? Math.round(finalTotal * (depositPercent / 100) * 100) / 100 : 0
  const remainingAmount = Math.max(0, finalTotal - depositAmount)

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4 print:bg-white print:py-0 print:px-0">
      {/* Supprime les en-têtes et pieds de page automatiques du navigateur (date, URL, 1/1) */}
      <style>{`
        @media print {
          @page {
            size: A4;
            margin: 0;
          }
          body {
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
        }
      `}</style>

      {/* Barre d'action supérieure (masquée à l'impression) */}
      <div className="max-w-3xl mx-auto mb-4 flex items-center justify-between print:hidden">
        <Link
          href={`/admin/commandes/${booking.id}`}
          className="inline-flex items-center gap-2 text-sm font-semibold text-gray-600 hover:text-pink-600 bg-white px-4 py-2.5 rounded-xl shadow-sm border border-gray-200 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Retour à la commande
        </Link>
        <div className="-mt-6">
          <PrintButton />
        </div>
      </div>

      <div className="max-w-3xl mx-auto bg-white p-8 sm:p-12 shadow-md rounded-2xl print:rounded-none print:shadow-none print:p-12">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start gap-6 border-b border-gray-200 pb-8 mb-8">
          <div>
            <h1 className="text-3xl sm:text-4xl font-black text-pink-600 mb-1">Fleurs Gourmandes</h1>
            <p className="text-gray-500 text-sm">Créations uniques de bouquets de cupcakes</p>
            <p className="text-gray-500 text-sm mt-4">{businessAddress}</p>
            <p className="text-gray-500 text-sm">contact@fleurs-gourmandes54.fr</p>
            {businessSiret && (
              <p className="text-gray-400 text-xs mt-1">SIRET : {businessSiret}</p>
            )}
          </div>
          <div className="sm:text-right">
            <h2 className="text-3xl font-bold text-gray-900 tracking-wider">{documentTitle}</h2>
            <p className="text-gray-500 font-medium mt-1">N° {booking.id.slice(-8).toUpperCase()}</p>
            <p className="text-gray-500 mt-4 text-sm">Date d&apos;émission : {new Date().toLocaleDateString('fr-FR')}</p>
            <p className="text-gray-500 text-sm">Date de l&apos;événement : <span className="font-semibold text-gray-900">{booking.eventDate.toLocaleDateString('fr-FR')}</span></p>
          </div>
        </div>

        {/* Client Info */}
        <div className="mb-10">
          <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-2">
            {isDevis ? "Destinataire :" : "Facturé à :"}
          </h3>
          <p className="text-xl font-bold text-gray-900">{booking.customerName}</p>
          <p className="text-gray-600">{booking.customerEmail}</p>
          <p className="text-gray-600">{booking.customerPhone}</p>
        </div>

        {/* Lines */}
        <table className="w-full mb-10 text-left">
          <thead>
            <tr className="border-b-2 border-pink-100 text-pink-700">
              <th className="py-3 font-semibold text-sm uppercase tracking-wider">Description</th>
              <th className="py-3 font-semibold text-sm uppercase tracking-wider text-center">Qté</th>
              <th className="py-3 font-semibold text-sm uppercase tracking-wider text-right">Prix Unitaire</th>
              <th className="py-3 font-semibold text-sm uppercase tracking-wider text-right">Total</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {/* Main Prestation */}
            <tr>
              <td className="py-4">
                <p className="font-bold text-gray-900">{booking.prestationName}</p>
                {booking.eventType && <p className="text-sm text-gray-500">Événement : {booking.eventType}</p>}
                {booking.flavors && <p className="text-sm text-gray-500">Parfums : {booking.flavors}</p>}
              </td>
              <td className="py-4 text-center font-medium text-gray-700">{booking.quantity}</td>
              <td className="py-4 text-right text-gray-700">{booking.prestationPrice.toFixed(2)} €</td>
              <td className="py-4 text-right font-bold text-gray-900">{mainTotal.toFixed(2)} €</td>
            </tr>

            {/* Supplements */}
            {supplements.map((sup, idx) => (
              <tr key={idx}>
                <td className="py-4">
                  <p className="font-medium text-gray-800">{sup.name}</p>
                </td>
                <td className="py-4 text-center font-medium text-gray-700">1</td>
                <td className="py-4 text-right text-gray-700">{Number(sup.price).toFixed(2)} €</td>
                <td className="py-4 text-right font-bold text-gray-900">{Number(sup.price).toFixed(2)} €</td>
              </tr>
            ))}

            {/* Discount */}
            {discountAmount > 0 ? (
              <tr>
                <td className="py-4">
                  <p className="font-medium text-emerald-700">Réduction / Code Promo</p>
                </td>
                <td className="py-4 text-center font-medium text-gray-700">1</td>
                <td className="py-4 text-right text-emerald-700">-{discountAmount.toFixed(2)} €</td>
                <td className="py-4 text-right font-bold text-emerald-700">-{discountAmount.toFixed(2)} €</td>
              </tr>
            ) : null}
          </tbody>
        </table>

        {/* Totals */}
        <div className="flex justify-end">
          <div className="w-full sm:w-2/3 md:w-1/2">
            <div className="flex justify-between py-2 border-b border-gray-100">
              <span className="text-gray-600">Sous-total</span>
              <span className="font-medium">{rawSubtotal.toFixed(2)} €</span>
            </div>
            {discountAmount > 0 && (
              <div className="flex justify-between py-2 border-b border-gray-100 text-emerald-700">
                <span>Remise appliquée</span>
                <span className="font-medium">-{discountAmount.toFixed(2)} €</span>
              </div>
            )}
            <div className="flex justify-between py-2 border-b border-gray-100">
              <span className="text-gray-600">TVA (0%) - Auto-entrepreneur</span>
              <span className="font-medium">0.00 €</span>
            </div>
            <div className="flex justify-between py-4 bg-pink-50/50 mt-2 px-4 rounded-lg">
              <span className="font-bold text-pink-900">Total TTC</span>
              <span className="font-black text-pink-600 text-xl">{finalTotal.toFixed(2)} €</span>
            </div>

            {depositAmount > 0 && (
              <div className="mt-3 p-3.5 rounded-lg bg-stone-50 border border-stone-200 text-xs space-y-1.5">
                <div className="flex justify-between text-gray-700 font-semibold">
                  <span>Acompte à la réservation ({depositPercent}%)</span>
                  <span>{depositAmount.toFixed(2)} €</span>
                </div>
                <div className="flex justify-between text-gray-500">
                  <span>Solde au retrait</span>
                  <span>{remainingAmount.toFixed(2)} €</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="mt-16 pt-8 border-t border-gray-200 text-center text-sm text-gray-500">
          <p>TVA non applicable, art. 293 B du CGI.</p>
          <p className="mt-1">Merci pour votre confiance ! En cas de question concernant ce document, n&apos;hésitez pas à nous contacter.</p>
          
          <PrintButton />
        </div>
      </div>
    </div>
  )
}
