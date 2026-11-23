"use client"

import Link from "next/link"
import { Flower2, Menu, X } from "lucide-react"
import { useState } from "react"

export default function PublicNavBar() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 w-full bg-white/90 backdrop-blur-md border-b border-gray-100 shadow-sm">
      <div className="container mx-auto flex h-16 md:h-20 items-center justify-between px-4 md:px-8">
        <Link href="/" className="flex items-center space-x-2">
          <Flower2 className="h-7 w-7 text-pink-600" aria-hidden="true" />
          <span className="text-xl md:text-2xl font-serif font-bold tracking-wide text-gray-900">
            Fleurs Gourmandes <span className="text-pink-600">54</span>
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav
          aria-label="Navigation principale"
          className="hidden md:flex items-center space-x-8 text-sm font-medium text-gray-600"
        >
          <Link href="/" className="hover:text-pink-600 transition-colors">
            Accueil
          </Link>
          <Link href="/prestations" className="hover:text-pink-600 transition-colors">
            La Carte
          </Link>
          <Link href="/a-propos" className="hover:text-pink-600 transition-colors">
            À propos
          </Link>
          <Link href="/contact" className="hover:text-pink-600 transition-colors">
            Contact
          </Link>
          <Link
            href="/prestations"
            className="bg-pink-600 text-white px-6 py-2.5 rounded-full hover:bg-pink-700 transition-colors font-semibold"
          >
            Commander
          </Link>
        </nav>

        {/* Mobile Nav Toggle (WCAG 4.1.2 : aria-label, aria-expanded, aria-controls) */}
        <button
          type="button"
          className="md:hidden text-gray-700 p-2 rounded-lg hover:bg-stone-100 transition-colors"
          onClick={() => setIsOpen(!isOpen)}
          aria-label={isOpen ? "Fermer le menu de navigation" : "Ouvrir le menu de navigation"}
          aria-expanded={isOpen}
          aria-controls="mobile-navigation"
        >
          {isOpen ? (
            <X className="h-6 w-6" aria-hidden="true" />
          ) : (
            <Menu className="h-6 w-6" aria-hidden="true" />
          )}
        </button>
      </div>

      {/* Mobile Nav Menu */}
      {isOpen && (
        <div id="mobile-navigation" className="md:hidden bg-white border-t border-gray-100 shadow-lg">
          <nav aria-label="Menu mobile" className="flex flex-col p-6 space-y-4">
            <Link
              href="/"
              className="text-gray-700 text-lg font-medium py-2 border-b border-gray-100"
              onClick={() => setIsOpen(false)}
            >
              Accueil
            </Link>
            <Link
              href="/prestations"
              className="text-gray-700 text-lg font-medium py-2 border-b border-gray-100"
              onClick={() => setIsOpen(false)}
            >
              La Carte
            </Link>
            <Link
              href="/a-propos"
              className="text-gray-700 text-lg font-medium py-2 border-b border-gray-100"
              onClick={() => setIsOpen(false)}
            >
              À propos
            </Link>
            <Link
              href="/contact"
              className="text-gray-700 text-lg font-medium py-2 border-b border-gray-100"
              onClick={() => setIsOpen(false)}
            >
              Contact
            </Link>
            <Link
              href="/prestations"
              className="bg-pink-600 text-white text-center px-6 py-3 rounded-full text-lg font-semibold mt-2"
              onClick={() => setIsOpen(false)}
            >
              Commander un bouquet
            </Link>
          </nav>
        </div>
      )}
    </header>
  )
}

