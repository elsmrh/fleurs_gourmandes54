import { Metadata } from "next"
import { prisma } from "@/lib/prisma"

export const dynamic = "force-dynamic"

export const metadata: Metadata = {
  title: "Conditions Générales de Vente | Fleurs Gourmandes 54",
  description: "Conditions générales de vente de Fleurs Gourmandes 54 — Bouquets de cupcakes floraux sur mesure à Heillecourt et Nancy (54).",
}

const DEFAULT_ADDRESS = "notre atelier à Heillecourt (54180 — Grand Nancy)"
const DEFAULT_SIRET = "communiqué sur le devis et la facture"
const REVISION_DATE = "Novembre 2026"

export default async function CGVPage() {
  let businessAddress = DEFAULT_ADDRESS
  let businessSiret = DEFAULT_SIRET
  let minNoticeHours = 48

  try {
    const settings = await prisma.setting.findMany({
      where: {
        key: { in: ["business_address", "business_siret", "MIN_NOTICE_HOURS", "min_notice_hours"] },
      },
    })
    const settingsMap = new Map(settings.map((s) => [s.key, s.value?.trim()]))
    if (settingsMap.get("business_address")) {
      businessAddress = settingsMap.get("business_address")!
    }
    if (settingsMap.get("business_siret")) {
      businessSiret = settingsMap.get("business_siret")!
    }
    const rawNotice = settingsMap.get("MIN_NOTICE_HOURS") || settingsMap.get("min_notice_hours")
    if (rawNotice && !Number.isNaN(parseInt(rawNotice, 10))) {
      minNoticeHours = parseInt(rawNotice, 10)
    }
  } catch {
    // Repli sur les valeurs officielles par défaut si la base de données est momentanément indisponible
  }

  return (
    <div className="flex flex-col min-h-screen pt-32 pb-20 bg-[#FDFBF9] selection:bg-pink-200">
      <div className="container mx-auto px-4 max-w-3xl">
        <div className="text-center mb-16">
          <span className="text-pink-600 uppercase tracking-[0.4em] text-xs font-bold block mb-6">
            Conditions Générales
          </span>
          <h1 className="text-4xl md:text-5xl font-serif text-gray-900 mb-6">
            Conditions Générales de Vente
          </h1>
          <div className="w-16 h-px bg-pink-300 mx-auto" />
        </div>

        <div className="prose prose-stone prose-p:font-light prose-p:leading-relaxed max-w-none">
          <p className="text-gray-500 mb-10 text-center italic">
            Dernière mise à jour : {REVISION_DATE}
          </p>

          <h2 className="text-2xl font-serif text-gray-900 mt-12 mb-4">
            1. Objet et Identification du Vendeur
          </h2>
          <p>
            Les présentes Conditions Générales de Vente (CGV) régissent les relations contractuelles entre{" "}
            <strong>Fleurs Gourmandes 54</strong> (édité par Kamélia, entreprise individuelle située à{" "}
            <strong>{businessAddress}</strong>, SIRET : <strong>{businessSiret}</strong>, joignable à l&apos;adresse{" "}
            <a
              href="mailto:contact@fleurs-gourmandes54.fr"
              className="text-pink-600 hover:text-pink-700 underline underline-offset-2"
            >
              contact@fleurs-gourmandes54.fr
            </a>
            ) et toute personne physique ou morale (ci-après « le Client ») souhaitant procéder à une commande via le site internet ou par tout autre moyen de communication.
          </p>

          <h2 className="text-2xl font-serif text-gray-900 mt-12 mb-4">
            2. Produits et Allergènes
          </h2>
          <p>
            Fleurs Gourmandes 54 propose à la vente des créations pâtissières sur mesure, notamment des bouquets de cupcakes floraux pochés à la main. S&apos;agissant de produits artisanaux réalisés à la demande, chaque création est unique. Les photographies illustrant les produits sur le site ne sont pas contractuelles.
          </p>
          <p>
            Nos produits sont susceptibles de contenir des allergènes majeurs (gluten, œufs, lait et produits laitiers, fruits à coque, soja). Il appartient au Client de signaler impérativement toute allergie ou intolérance alimentaire lors de la prise de commande.
          </p>

          <h2 className="text-2xl font-serif text-gray-900 mt-12 mb-4">
            3. Commandes et Délais
          </h2>
          <p>
            Toute commande doit être passée avec un délai minimum de{" "}
            <strong>{minNoticeHours} heures</strong> à l&apos;avance, sous réserve de disponibilité dans le planning de production.
          </p>
          <p>
            La demande effectuée en ligne constitue une pré-réservation. La commande n&apos;est définitivement confirmée qu&apos;après validation écrite par Fleurs Gourmandes 54 et, le cas échéant, réception d&apos;un acompte selon les modalités précisées sur le devis transmis au Client.
          </p>

          <h2 className="text-2xl font-serif text-gray-900 mt-12 mb-4">
            4. Prix et Modalités de paiement
          </h2>
          <p>
            Les prix de nos créations sont indiqués en euros (€) net (TVA non applicable, article 293 B du CGI). Fleurs Gourmandes 54 se réserve le droit de modifier ses tarifs à tout moment, étant entendu que le prix figurant au catalogue et validé sur le devis le jour de la commande sera le seul applicable au Client.
          </p>
          <p>
            Le règlement du solde s&apos;effectue au moment du retrait de la commande (en espèces ou selon le mode de règlement convenu lors de la validation du devis).
          </p>

          <h2 className="text-2xl font-serif text-gray-900 mt-12 mb-4">
            5. Retrait et Conservation
          </h2>
          <p>
            Les commandes sont à retirer sur rendez-vous à <strong>{businessAddress}</strong> (adresse précise communiquée lors de la confirmation de la commande). Le Client s&apos;engage à respecter le créneau horaire convenu. En cas de retard imprévu, le Client s&apos;engage à prévenir l&apos;atelier dans les plus brefs délais.
          </p>
          <p>
            Dès la remise de la commande en main propre, le Client assume l&apos;entière responsabilité de son transport (maintien à plat et au frais, à l&apos;abri de la chaleur directe) et de sa conservation. Nos pâtisseries doivent être conservées au réfrigérateur et sorties environ 20 à 30 minutes avant dégustation.
          </p>

          <h2 className="text-2xl font-serif text-gray-900 mt-12 mb-4">
            6. Droit de rétractation, Annulation et Modification
          </h2>
          <p>
            Conformément aux dispositions de l&apos;article L221-28 4° du Code de la consommation, s&apos;agissant de denrées alimentaires périssables confectionnées sur mesure selon les spécifications du Client, le droit de rétractation ne s&apos;applique pas.
          </p>
          <p>
            Toute demande d&apos;annulation ou de modification de commande de la part du Client doit être formulée au moins <strong>48 heures</strong> avant la date de retrait prévue. Passé ce délai, l&apos;acompte éventuellement versé sera conservé à titre d&apos;indemnisation des matières premières engagées, et la commande pourra être facturée.
          </p>
        </div>
      </div>
    </div>
  )
}
