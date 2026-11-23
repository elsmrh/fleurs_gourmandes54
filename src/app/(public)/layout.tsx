import Link from "next/link"
import { Flower2 } from "lucide-react"
import Banner from "@/components/Banner"
import PublicNavBar from "@/components/PublicNavBar"

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <PublicNavBar />
      <Banner />

      <main className="flex-1">{children}</main>

      {/* ═══ Footer ═══ */}
      <footer className="bg-white text-stone-600 py-20 border-t border-stone-100 mt-auto">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-16 text-center md:text-left">
            {/* Colonne 1: Marque */}
            <div className="flex flex-col items-center md:items-start">
              <div className="flex items-center space-x-3 text-gray-900 mb-6">
                <Flower2 className="h-6 w-6 text-pink-600" aria-hidden="true" />
                <span className="text-xl font-serif tracking-widest uppercase">
                  Fleurs Gourmandes 54
                </span>
              </div>
              <p className="text-sm leading-relaxed max-w-xs font-light text-stone-600 mb-8">
                L&apos;art floral revisité en pâtisserie. Des créations uniques, pochées à la main avec passion et minutie pour vos plus beaux événements.
              </p>
              <div className="flex gap-4">
                <a
                  href="https://www.instagram.com/fleurs_gourmandes54/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full border border-stone-200 flex items-center justify-center text-stone-500 hover:bg-pink-600 hover:border-pink-600 hover:text-white transition-all duration-300"
                  aria-label="Suivre Fleurs Gourmandes 54 sur Instagram"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
                  </svg>
                </a>
              </div>
            </div>

            {/* Colonne 2: Navigation */}
            <div className="flex flex-col items-center md:items-center">
              <div className="text-center md:text-left">
                <h4 className="text-gray-900 font-serif text-sm font-bold mb-6 uppercase tracking-[0.2em]">
                  Navigation
                </h4>
                <div className="flex flex-col space-y-4 text-sm font-light">
                  <Link href="/prestations" className="hover:text-pink-600 transition-colors">
                    La Carte
                  </Link>
                  <Link href="/commander" className="hover:text-pink-600 transition-colors">
                    Commander
                  </Link>
                  <Link href="/a-propos" className="hover:text-pink-600 transition-colors">
                    À propos
                  </Link>
                </div>
              </div>
            </div>

            {/* Colonne 3: Contact */}
            <div className="flex flex-col items-center md:items-end md:text-right">
              <div className="text-center md:text-right">
                <h4 className="text-gray-900 font-serif text-sm font-bold mb-6 uppercase tracking-[0.2em]">
                  Informations
                </h4>
                <div className="flex flex-col space-y-4 text-sm font-light">
                  <span>Heillecourt &amp; Grand Nancy (54)</span>
                  <span>Retrait sur rendez-vous</span>
                  <span>Commande 48h à l&apos;avance</span>
                  <Link
                    href="/contact"
                    className="text-pink-600 hover:text-pink-700 transition-colors underline underline-offset-4 mt-2 inline-block font-medium"
                  >
                    Nous écrire
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Copyright & Crédits */}
          <div className="mt-20 pt-8 border-t border-stone-100 flex flex-col md:flex-row justify-between items-center gap-6 text-[11px] font-light text-stone-500 uppercase tracking-wider">
            <p>© {new Date().getFullYear()} Fleurs Gourmandes 54.</p>

            <div className="flex items-center gap-1.5">
              <span>Développé par</span>
              <a
                href="https://homika-studio.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-800 font-medium hover:text-pink-600 transition-colors"
              >
                HOMIKA Studio
              </a>
            </div>

            <div className="flex space-x-6">
              <Link href="/mentions-legales" className="hover:text-stone-900 transition-colors">
                Mentions légales
              </Link>
              <Link href="/cgv" className="hover:text-stone-900 transition-colors">
                C.G.V
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
