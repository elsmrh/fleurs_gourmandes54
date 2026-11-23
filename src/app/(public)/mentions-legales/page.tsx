import { Metadata } from "next"
import { prisma } from "@/lib/prisma"

export const dynamic = "force-dynamic"

export const metadata: Metadata = {
  title: "Mentions Légales | Fleurs Gourmandes 54",
  description: "Mentions légales du site Fleurs Gourmandes 54, créations artisanales de bouquets de cupcakes floraux à Heillecourt et Nancy (54).",
}

const DEFAULT_ADDRESS = "Atelier Fleurs Gourmandes 54 — 54180 Heillecourt (Grand Nancy), France"
const DEFAULT_SIRET = "Entreprise Individuelle — Numéro SIRET communiqué sur devis et facture"
const CONTACT_EMAIL = "contact@fleurs-gourmandes54.fr"
const INSTAGRAM_HANDLE = "@fleurs_gourmandes54"
const REVISION_DATE = "Novembre 2026"

export default async function MentionsLegalesPage() {
  let businessAddress = DEFAULT_ADDRESS
  let businessSiret = DEFAULT_SIRET

  try {
    const settings = await prisma.setting.findMany({
      where: {
        key: { in: ["business_address", "business_siret"] },
      },
    })
    const settingsMap = new Map(settings.map((s) => [s.key, s.value?.trim()]))
    if (settingsMap.get("business_address")) {
      businessAddress = settingsMap.get("business_address")!
    }
    if (settingsMap.get("business_siret")) {
      businessSiret = settingsMap.get("business_siret")!
    }
  } catch {
    // Repli sur les valeurs officielles par défaut si la base de données est momentanément indisponible
  }

  return (
    <div className="flex flex-col min-h-screen pt-32 pb-20 bg-[#FDFBF9] selection:bg-pink-200">
      <div className="container mx-auto px-4 max-w-3xl">
        <div className="text-center mb-16">
          <span className="text-pink-600 uppercase tracking-[0.4em] text-xs font-bold block mb-6">
            Informations Légales
          </span>
          <h1 className="text-4xl md:text-5xl font-serif text-gray-900 mb-6">
            Mentions Légales
          </h1>
          <div className="w-16 h-px bg-pink-300 mx-auto" />
        </div>

        <div className="prose prose-stone prose-p:font-light prose-p:leading-relaxed max-w-none">
          <p className="text-gray-500 mb-10 text-center italic">
            Dernière mise à jour : {REVISION_DATE}
          </p>

          <h2 className="text-2xl font-serif text-gray-900 mt-12 mb-4">
            1. Éditeur du site
          </h2>
          <p>
            Le site <strong>Fleurs Gourmandes 54</strong> est édité par{" "}
            <strong>Kamélia — Fleurs Gourmandes 54</strong>, entreprise individuelle d&apos;artisanat pâtissier.<br />
            <strong>Adresse de l&apos;atelier / Siège social :</strong> {businessAddress}<br />
            <strong>SIRET :</strong> {businessSiret}<br />
            <strong>Email :</strong>{" "}
            <a
              href={`mailto:${CONTACT_EMAIL}`}
              className="text-pink-600 hover:text-pink-700 underline underline-offset-2"
            >
              {CONTACT_EMAIL}
            </a>
            <br />
            <strong>Contact &amp; Réseaux :</strong> Via le{" "}
            <a
              href="/contact"
              className="text-pink-600 hover:text-pink-700 underline underline-offset-2"
            >
              formulaire de contact en ligne
            </a>{" "}
            ou sur Instagram ({INSTAGRAM_HANDLE})
          </p>

          <h2 className="text-2xl font-serif text-gray-900 mt-12 mb-4">
            2. Création et Développement
          </h2>
          <p>
            Le design et le développement du site ont été réalisés par :<br />
            <strong>HOMIKA Studio</strong><br />
            Site web :{" "}
            <a
              href="https://homika-studio.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-pink-600 hover:text-pink-700"
            >
              homika-studio.com
            </a>
          </p>

          <h2 className="text-2xl font-serif text-gray-900 mt-12 mb-4">
            3. Hébergement
          </h2>
          <p>
            Ce site est hébergé par :<br />
            <strong>OVH SAS</strong><br />
            2 rue Kellermann<br />
            59100 Roubaix, France<br />
            Site web :{" "}
            <a
              href="https://www.ovhcloud.com/fr/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-pink-600 hover:text-pink-700"
            >
              ovhcloud.com
            </a>
          </p>

          <h2 className="text-2xl font-serif text-gray-900 mt-12 mb-4">
            4. Propriété intellectuelle
          </h2>
          <p>
            L&apos;ensemble de ce site relève de la législation française et internationale sur le droit d&apos;auteur et la propriété intellectuelle. Tous les droits de reproduction sont réservés, y compris pour les documents téléchargeables et les représentations iconographiques et photographiques.
          </p>
          <p>
            La reproduction de tout ou partie de ce site sur un support électronique quel qu&apos;il soit est formellement interdite sauf autorisation expresse de la directrice de la publication.
          </p>

          <h2 className="text-2xl font-serif text-gray-900 mt-12 mb-4">
            5. Données personnelles (RGPD)
          </h2>
          <p>
            Les informations recueillies via les formulaires de commande et de contact (nom, adresse email, téléphone, détails de l&apos;événement et allergies éventuelles) sont strictement nécessaires au traitement de votre demande de réservation et à l&apos;établissement de votre devis.
          </p>
          <p>
            Conformément au Règlement Général sur la Protection des Données (RGPD), vous disposez d&apos;un droit d&apos;accès, de rectification et de suppression des données vous concernant en adressant votre demande à{" "}
            <a
              href={`mailto:${CONTACT_EMAIL}`}
              className="text-pink-600 hover:text-pink-700 underline underline-offset-2"
            >
              {CONTACT_EMAIL}
            </a>
            .
          </p>
        </div>
      </div>
    </div>
  )
}
