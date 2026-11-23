"use client"

import { useEffect, useRef, useState } from "react"

const REVIEWS = [
  {
    name: "Sophie & Mickaël",
    event: "Mariage",
    text: "Un immense merci pour ce magnifique bouquet de cupcakes fleuris réalisé pour notre mariage ! Les invités ont adoré la beauté de la présentation et les parfums. Un vrai coup de cœur gourmand qui a fait son effet tout au long de la soirée. Nous recommandons à 100% sans hésitation.",
  },
  {
    name: "Marie L.",
    event: "Anniversaire",
    text: "Bonjour, je tiens à vous remercier pour les cupcakes aussi beaux que bons. Mes invités étaient émerveillés de voir de si beaux cupcakes qui font vraiment un beau bouquet à mettre sur la table. Très bon travail et minutieux, je vous referai confiance pour d'autres événements !",
  },
  {
    name: "Chloé D.",
    event: "Fête des mères",
    text: "J'ai offert le bouquet pétale à ma maman pour la fête des mères, elle a pleuré de joie ! C'est d'un réalisme époustouflant, les fleurs en crème au beurre sont de véritables œuvres d'art. Et le goût Mangue Passion... un délice absolu !",
  },
  {
    name: "Amélie & Thomas",
    event: "Baptême",
    text: "Nous avions commandé le bouquet Harmonie (24 cupcakes) pour le baptême de notre fille avec des teintes pastel sur-mesure. Le résultat était au-delà de nos espérances. Non seulement c'est somptueux, mais la génoise est ultra moelleuse. Merci infiniment !",
  },
  {
    name: "Juliette V.",
    event: "Cadeau",
    text: "On ose à peine les manger tellement c'est beau ! J'ai choisi les parfums Bueno et Caramel beurre salé, une tuerie. La présentation dans l'écrin transparent avec le ruban fait vraiment très luxe. C'est devenu mon cadeau signature pour mes proches.",
  },
]

export default function TestimonialSlider() {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [isHovered, setIsHovered] = useState(false)
  const [isFocused, setIsFocused] = useState(false)
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)
  const [activeIndex, setActiveIndex] = useState(0)

  // Détection de la préférence système prefers-reduced-motion (WCAG 2.2.2)
  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)")
    setPrefersReducedMotion(mediaQuery.matches)

    const handleChange = (event: MediaQueryListEvent) => {
      setPrefersReducedMotion(event.matches)
    }

    mediaQuery.addEventListener("change", handleChange)
    return () => mediaQuery.removeEventListener("change", handleChange)
  }, [])

  useEffect(() => {
    if (isHovered || isFocused || prefersReducedMotion) return

    const interval = setInterval(() => {
      if (scrollRef.current) {
        const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current
        if (scrollLeft + clientWidth >= scrollWidth - 20) {
          scrollRef.current.scrollTo({ left: 0, behavior: "smooth" })
        } else {
          const scrollAmount = clientWidth > 768 ? 450 + 24 : clientWidth * 0.85 + 24
          scrollRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" })
        }
      }
    }, 3500)

    return () => clearInterval(interval)
  }, [isHovered, isFocused, prefersReducedMotion])

  const handleScroll = () => {
    if (!scrollRef.current) return
    const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current
    const maxScrollLeft = scrollWidth - clientWidth
    if (maxScrollLeft <= 0) return

    const index = Math.round((scrollLeft / maxScrollLeft) * (REVIEWS.length - 1))
    setActiveIndex(Math.min(Math.max(index, 0), REVIEWS.length - 1))
  }

  return (
    <div
      className="w-full flex flex-col items-center"
      role="region"
      aria-roledescription="carrousel"
      aria-label="Témoignages clients"
      onFocusCapture={() => setIsFocused(true)}
      onBlurCapture={() => setIsFocused(false)}
    >
      <div
        className="flex overflow-x-auto snap-x snap-mandatory gap-6 pb-8 pt-4 px-4 md:px-12 lg:px-32 [&::-webkit-scrollbar]:hidden w-full"
        style={{ scrollbarWidth: "none" }}
        ref={scrollRef}
        onScroll={handleScroll}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onTouchStart={() => setIsHovered(true)}
        onTouchEnd={() => {
          setTimeout(() => setIsHovered(false), 2000)
        }}
      >
        {REVIEWS.map((t, i) => (
          <div
            key={i}
            tabIndex={0}
            aria-label={`Témoignage ${i + 1} sur ${REVIEWS.length} : ${t.name}`}
            className="w-[85vw] sm:w-[400px] md:w-[450px] shrink-0 snap-center bg-white border border-stone-100 shadow-sm hover:shadow-xl transition-shadow duration-500 p-8 md:p-10 rounded-2xl relative flex flex-col justify-between cursor-pointer"
          >
            {/* Icône Quote en filigrane */}
            <div
              aria-hidden="true"
              className="absolute top-6 right-8 text-8xl font-serif text-pink-50/50 leading-none pointer-events-none select-none"
            >
              &ldquo;
            </div>

            <div className="relative z-10 flex-1">
              <div className="flex gap-1.5 mb-6" aria-label="Note : 5 étoiles sur 5">
                {[1, 2, 3, 4, 5].map((star) => (
                  <svg
                    key={star}
                    aria-hidden="true"
                    className="w-4 h-4 text-pink-500 fill-pink-500"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
                  </svg>
                ))}
              </div>
              <p className="text-gray-700 font-light leading-relaxed mb-8 italic">&ldquo;{t.text}&rdquo;</p>
            </div>

            <div className="relative z-10 flex flex-col border-t border-stone-100 pt-6">
              <p className="font-serif text-lg text-gray-900">{t.name}</p>
              <p className="text-pink-600 text-sm font-medium mt-1">{t.event}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Indicateur de scroll interactif (zone de clic agrandie >= 32x32px pour WCAG 2.5.8) */}
      <div className="flex justify-center items-center gap-1 mt-4 mb-2" role="group" aria-label="Navigation des témoignages">
        {REVIEWS.map((_, i) => {
          const isCurrent = i === activeIndex
          return (
            <button
              key={i}
              type="button"
              onClick={() => {
                if (!scrollRef.current) return
                const { scrollWidth, clientWidth } = scrollRef.current
                const maxScrollLeft = scrollWidth - clientWidth
                const targetScroll = (i / (REVIEWS.length - 1)) * maxScrollLeft
                scrollRef.current.scrollTo({
                  left: targetScroll,
                  behavior: prefersReducedMotion ? "auto" : "smooth",
                })
              }}
              className="w-8 h-8 flex items-center justify-center rounded-full focus-visible:ring-2 focus-visible:ring-pink-600"
              aria-label={`Aller au témoignage ${i + 1}`}
              aria-current={isCurrent ? "true" : undefined}
            >
              <span
                className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                  isCurrent ? "bg-pink-600 scale-125" : "bg-stone-300 hover:bg-stone-400"
                }`}
              />
            </button>
          )
        })}
      </div>
    </div>
  )
}
