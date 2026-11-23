import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowRight, Sparkles } from "lucide-react"
import { prisma } from "@/lib/prisma"
import Image from "next/image"

import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'La Carte | Fleurs Gourmandes 54',
  description: 'Découvrez nos bouquets de cupcakes et gâteaux fleuris.'
}

// Rendu à la demande : la base n'est pas accessible pendant le build Docker
export const dynamic = "force-dynamic"

export default async function PrestationsPage() {
  const products = await prisma.service.findMany({
    where: { active: true },
    orderBy: { order: "asc" }
  })

  return (
    <div className="bg-stone-50 min-h-screen pb-24 pt-32">
      {/* En-tête de page luxueux */}
      <div className="container mx-auto px-4 mb-20 text-center">
        <span className="text-pink-600/80 uppercase tracking-[0.4em] text-xs font-bold mb-4 block">La Carte</span>
        <h1 className="text-5xl md:text-6xl font-bold font-serif text-gray-900 mb-6">Nos Créations Gourmandes</h1>
        <div className="w-24 h-px bg-pink-300 mx-auto mb-8" />
        <p className="text-gray-500 max-w-2xl mx-auto text-lg font-light leading-relaxed">
          Découvrez nos bouquets de cupcakes et gâteaux fleuris. Choisissez votre création et réservez votre date de retrait. Le règlement s'effectuera en espèces lors de la remise en mains propres.
        </p>
      </div>

      <div className="container mx-auto px-4 max-w-6xl">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 lg:gap-16">
          {products.map((product, i) => (
            <Link href={`/commander?serviceId=${product.id}`} key={i} className="group bg-white rounded-2xl p-6 shadow-sm hover:shadow-xl hover:border-pink-200 border border-stone-100 transition-all duration-500 flex flex-col items-center text-center">
              <div className="relative aspect-[4/5] w-full overflow-hidden rounded-xl mb-8 border border-stone-50">
                <Image 
                  src={product.imageUrl || '/images/placeholder.jpg'}
                  alt={`Bouquet ${product.name} - Fleurs Gourmandes 54`}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  className="object-cover group-hover:scale-105 transition-transform duration-700"
                />
                {product.badge && (
                  <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-white/95 backdrop-blur-sm px-4 py-1.5 rounded-full text-[10px] uppercase tracking-widest font-bold text-pink-600 shadow-sm border border-pink-50">
                    {product.badge}
                  </div>
                )}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-500" />
              </div>
              
              <h3 className="font-serif text-2xl text-gray-900 mb-3 group-hover:text-pink-600 transition-colors">{product.name}</h3>
              
              <div className="w-8 h-px bg-pink-200 mb-4 transition-all duration-500 group-hover:w-16 group-hover:bg-pink-400" />
              
              <p className="text-gray-500 font-light text-sm mb-4">{product.description}</p>
              <p className="text-xl font-serif text-pink-600 mb-6">{product.price} €</p>
              
              <div className="mt-auto w-full px-4 md:px-8">
                <span className="w-full inline-flex items-center justify-center border border-stone-200 text-gray-700 rounded-full py-3 text-[11px] font-medium uppercase tracking-[0.2em] group-hover:border-pink-200 group-hover:bg-pink-50/50 group-hover:text-pink-600 transition-all duration-500">
                  Commander <ArrowRight className="ml-2 w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </span>
              </div>
            </Link>
          ))}
        </div>
        
        <div className="mt-20 text-center">
          <Link
            href="/contact"
            className="inline-flex flex-col md:flex-row items-center justify-center bg-white border border-stone-200 hover:border-pink-300 hover:shadow-md transition-all duration-300 shadow-sm rounded-3xl md:rounded-full px-8 py-6 md:py-4 group"
          >
            <span className="font-serif italic text-gray-700 mb-2 md:mb-0">
              Besoin d&apos;une création sur-mesure ou XXL ?
            </span>
            <span className="hidden md:inline mx-4 text-pink-400">|</span>
            <span className="text-sm font-bold text-pink-600 group-hover:text-pink-700 uppercase tracking-widest inline-flex items-center gap-2">
              Plus de 50 cupcakes sur devis <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </span>
          </Link>
        </div>
      </div>
    </div>
  )
}
