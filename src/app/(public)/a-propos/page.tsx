import Image from "next/image"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { Metadata } from "next"

export const metadata: Metadata = {
  title: "À Propos | Fleurs Gourmandes 54",
  description: "Découvrez qui se cache derrière Fleurs Gourmandes 54, créations artisanales de bouquets de cupcakes floraux à Heillecourt et Nancy (54).",
}

export default function AboutPage() {
  return (
    <div className="flex flex-col min-h-screen pt-24 bg-[#FDFBF9] overflow-hidden relative selection:bg-pink-200">
      {/* Background decorations artistiques fluides */}
      <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-pink-100/50 rounded-full blur-[100px] opacity-80 -translate-y-1/4 translate-x-1/4 pointer-events-none" />
      <div className="absolute top-[40%] left-0 w-[600px] h-[600px] bg-rose-100/40 rounded-full blur-[100px] opacity-60 -translate-x-1/4 pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[800px] h-[800px] bg-pink-100/40 rounded-full blur-[100px] opacity-60 translate-y-1/4 translate-x-1/4 pointer-events-none" />

      <div className="container mx-auto px-4 max-w-5xl relative z-10 pb-32">
        {/* TITRE PRINCIPAL */}
        <div className="text-center mb-24 pt-12">
          <span className="text-pink-600 uppercase tracking-[0.4em] text-xs font-bold block mb-6">
            Présentation
          </span>
          <h1 className="text-5xl md:text-7xl font-serif text-gray-900 mb-10 leading-tight">
            Qui se cache derrière <br className="hidden md:block" />
            <span className="text-pink-600">Fleurs Gourmandes</span> ?
          </h1>
          <div className="w-px h-32 bg-gradient-to-b from-pink-300 to-transparent mx-auto" />
        </div>

        {/* SECTION 1 : KAMÉLIA */}
        <div className="flex flex-col md:flex-row items-center gap-16 md:gap-24 mb-40">
          <div className="w-full md:w-1/2 relative">
            <div className="aspect-[4/5] w-full max-w-md mx-auto rounded-t-full rounded-b-[3rem] overflow-hidden shadow-2xl relative border-[12px] border-white">
              <Image
                src="/images/hero-bouquet.jpg"
                alt="Création florale artisanale par Kamélia — Fleurs Gourmandes 54"
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover hover:scale-105 transition-transform duration-1000"
              />
            </div>
            {/* Décoration texte responsive sans débordement sur petits écrans */}
            <div className="absolute -bottom-6 right-2 sm:-right-4 md:right-0 bg-white/95 backdrop-blur-sm px-6 sm:px-8 py-4 sm:py-5 rounded-full shadow-xl border border-pink-100">
              <p className="font-serif text-xl sm:text-2xl text-pink-600 italic">Kamélia, 25 ans</p>
            </div>
          </div>

          <div className="w-full md:w-1/2 text-center md:text-left">
            <h2 className="text-3xl md:text-4xl font-serif text-gray-900 mb-8 leading-relaxed">
              Une passionnée au service de vos plus beaux événements.
            </h2>
            <p className="text-lg text-gray-600 font-light leading-relaxed mb-6">
              Je m&apos;appelle Kamélia et je suis la créatrice de Fleurs Gourmandes 🌸
            </p>
            <p className="text-lg text-gray-600 font-light leading-relaxed">
              Laissez-moi vous raconter comment l&apos;amour de l&apos;art et la passion de la pâtisserie se sont rencontrés pour donner naissance à ce projet floral unique.
            </p>
          </div>
        </div>

        {/* SECTION 2 : L'ART (POLAROIDS RESPONSIVE < 360px) */}
        <div className="flex flex-col-reverse md:flex-row items-center gap-16 md:gap-24 mb-40">
          <div className="w-full md:w-1/2 text-center md:text-left">
            <span className="text-pink-600 uppercase tracking-[0.4em] text-xs font-bold block mb-4">
              Chapitre I
            </span>
            <h2 className="text-4xl md:text-5xl font-serif text-gray-900 mb-8">L&apos;Art</h2>
            <p className="text-2xl text-pink-600 italic font-serif mb-8">
              &ldquo;Créer a toujours fait partie de moi !&rdquo;
            </p>
            <p className="text-lg text-gray-600 font-light leading-relaxed mb-6">
              Depuis petite, j&apos;aime dessiner, peindre et laisser libre cours à ma créativité.
            </p>
            <p className="text-lg text-gray-600 font-light leading-relaxed">
              Une passion qui m&apos;a naturellement guidée vers des études en <strong>design d&apos;espace 🎓</strong>.
            </p>
          </div>

          <div className="w-full md:w-1/2 relative">
            <div className="flex justify-center items-center relative h-[360px] sm:h-[460px] md:h-[500px] max-w-full overflow-hidden sm:overflow-visible">
              {/* Polaroid 1 — Dimensions et translation adaptées aux petits écrans (< 360px) */}
              <div className="absolute z-10 bg-white p-2.5 sm:p-3 pb-8 sm:pb-12 shadow-2xl transform -rotate-6 -translate-x-6 sm:-translate-x-12 hover:-translate-y-4 hover:rotate-0 transition-all duration-500 w-36 sm:w-48">
                <div className="relative aspect-[6/7] w-full overflow-hidden">
                  <Image
                    src="/images/insta-1.png"
                    alt="Détail de pochage floral fait main"
                    fill
                    sizes="(max-width: 640px) 144px, 192px"
                    className="object-cover"
                  />
                </div>
              </div>
              {/* Polaroid 2 — Dimensions et translation adaptées aux petits écrans (< 360px) */}
              <div className="absolute z-20 bg-white p-2.5 sm:p-3 pb-8 sm:pb-12 shadow-2xl transform rotate-6 translate-x-6 sm:translate-x-12 translate-y-8 sm:translate-y-12 hover:-translate-y-4 hover:rotate-0 transition-all duration-500 w-36 sm:w-48">
                <div className="relative aspect-[6/7] w-full overflow-hidden">
                  <Image
                    src="/images/insta-2.png"
                    alt="Palette de couleurs et fleurs en crème au beurre"
                    fill
                    sizes="(max-width: 640px) 144px, 192px"
                    className="object-cover"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 3 : LE CAKE DESIGN */}
        <div className="flex flex-col md:flex-row items-center gap-16 md:gap-24 mb-40">
          <div className="w-full md:w-1/2 relative">
            <div className="bg-white p-4 pb-16 shadow-2xl rounded-sm transform -rotate-2 hover:rotate-0 transition-all duration-500 w-4/5 mx-auto">
              <div className="relative aspect-[4/5] w-full overflow-hidden">
                <Image
                  src="/images/bouquet-classique.jpg"
                  alt="Création pâtissière Fleurs Gourmandes 54"
                  fill
                  sizes="(max-width: 768px) 80vw, 40vw"
                  className="object-cover"
                />
              </div>
            </div>
          </div>

          <div className="w-full md:w-1/2 text-center md:text-left">
            <span className="text-pink-600 uppercase tracking-[0.4em] text-xs font-bold block mb-4">
              Chapitre II
            </span>
            <h2 className="text-4xl md:text-5xl font-serif text-gray-900 mb-6">Le Cake Design</h2>
            <p className="text-2xl text-pink-600 italic font-serif mb-6">Puis, la pâtisserie...</p>
            <p className="text-lg text-gray-600 font-light leading-relaxed mb-6">
              Tout a commencé avec des gâteaux pour mes proches... Je me suis ensuite longuement consacrée au cake design.
            </p>

            <div className="py-6 border-y border-pink-100/60 my-8">
              <p className="text-lg md:text-xl text-gray-800 font-serif italic tracking-wide leading-relaxed">
                Layer cakes <span className="text-pink-600 mx-1 md:mx-2">•</span> Wedding cakes{" "}
                <span className="text-pink-600 mx-1 md:mx-2">•</span> Créations sur-mesure
              </p>
            </div>

            <div className="mt-10">
              <h3 className="text-2xl text-pink-600 font-serif mb-2">L&apos;Expérience</h3>
              <p className="text-lg text-gray-500 font-light italic mb-6">
                J&apos;ai décidé d&apos;en faire mon métier...
              </p>

              <div className="flex flex-col gap-4 items-center md:items-start max-w-sm mx-auto md:mx-0">
                <div className="flex items-center gap-4 bg-white/60 backdrop-blur-sm px-6 py-4 rounded-2xl shadow-sm border border-stone-100 w-full justify-center md:justify-start">
                  <div className="w-2 h-2 rounded-full bg-pink-600" />
                  <span className="text-gray-700 font-medium tracking-wide">CAP Pâtissier obtenu</span>
                </div>
                <div className="flex items-center gap-4 bg-white/60 backdrop-blur-sm px-6 py-4 rounded-2xl shadow-sm border border-stone-100 w-full justify-center md:justify-start">
                  <div className="w-2 h-2 rounded-full bg-pink-600" />
                  <span className="text-gray-700 font-medium tracking-wide">
                    3 ans d&apos;expérience en pâtisserie
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 4 : LA PÂTISSERIE FLORALE */}
        <div className="text-center max-w-4xl mx-auto pt-32 border-t border-pink-100/50">
          <h2 className="text-5xl md:text-7xl font-serif text-pink-600 mb-10">
            La Pâtisserie Florale
          </h2>
          <p className="text-3xl text-gray-900 font-serif italic mb-8">
            &ldquo;J&apos;ai voulu réunir mes deux passions...&rdquo;
          </p>
          <p className="text-xl text-gray-600 font-light leading-relaxed mb-16 max-w-2xl mx-auto">
            Je me suis alors spécialisée dans les bouquets de cupcakes floraux et je me suis formée dans ce domaine fascinant 🌸
          </p>

          <div className="aspect-[16/9] w-full rounded-[2rem] sm:rounded-[3rem] overflow-hidden shadow-2xl mb-16 relative border-4 sm:border-8 border-white group">
            <Image
              src="/images/bouquet-champetre.jpg"
              alt="Bouquet de cupcakes floraux Fleurs Gourmandes 54"
              fill
              sizes="(max-width: 768px) 100vw, 896px"
              className="object-cover group-hover:scale-105 transition-transform duration-1000"
            />
          </div>

          <Button
            asChild
            size="lg"
            className="bg-pink-600 hover:bg-pink-700 text-white rounded-full px-10 sm:px-12 py-7 sm:py-8 text-base sm:text-lg tracking-wide shadow-xl shadow-pink-600/20 transition-all hover:-translate-y-1"
          >
            <Link href="/prestations" className="flex items-center justify-center">
              Découvrir mes créations <ArrowRight className="ml-2 w-5 h-5" />
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
