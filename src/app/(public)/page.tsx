import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, Star, Heart, Sparkles, Gift, Calendar, Eye, Cake, Briefcase, Smile, Users, PartyPopper } from "lucide-react"
import TestimonialSlider from "@/components/TestimonialSlider"

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">

      {/* ═══════════════════════════════════════════════════════════
          HERO — Plein écran, immersif
      ═══════════════════════════════════════════════════════════ */}
      <section className="relative w-full min-h-screen flex items-center justify-center overflow-hidden">
        {/* Background — Photo hero bouquet cupcakes */}
        <div className="absolute inset-0">
          <img src="/images/hero-bouquet.jpg" alt="" className="w-full h-full object-cover object-center" />
          <div className="absolute inset-0 bg-black/50 md:bg-black/40" />
        </div>
        
        <div className="relative z-10 container px-4 md:px-6 mx-auto text-center flex flex-col items-center pt-24">
          <span className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-md rounded-full text-pink-100 font-medium text-sm mb-8 border border-white/20 shadow-lg">
            <Sparkles className="h-4 w-4" /> Nancy & Meurthe-et-Moselle
          </span>
          
          <h1 className="text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-bold text-white mb-6 font-serif leading-[1.1] drop-shadow-lg">
            Vous croyez voir<br/>des fleurs ?
          </h1>
          <div className="mb-10 transform -rotate-2">
            <span className="inline-block bg-pink-600/90 backdrop-blur-sm text-white text-2xl md:text-4xl font-serif italic px-8 py-3 shadow-2xl rounded-sm border border-pink-500/50">
              Ce sont des gâteaux.
            </span>
          </div>
          <p className="max-w-[650px] text-base md:text-lg text-gray-100 mb-10 leading-relaxed drop-shadow-md">
            Fleurs Gourmandes 54 crée des bouquets de cupcakes en trompe-l'œil si réalistes que vos invités n'en croiront pas leurs yeux. 
            Chaque fleur est un gâteau, chaque pétale est poché à la main. L'illusion parfaite, la gourmandise en plus.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto mb-16">
            <Button asChild size="lg" className="bg-pink-600 hover:bg-pink-700 text-white rounded-full px-8 md:px-10 py-6 md:py-7 text-base md:text-lg border-none shadow-xl">
              <Link href="/prestations" className="flex items-center justify-center">
                <Gift className="mr-2 h-5 w-5" /> Commander un bouquet
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="bg-transparent rounded-full px-8 md:px-10 py-6 md:py-7 text-base md:text-lg border border-white text-white hover:bg-white/10 backdrop-blur-sm">
              <Link href="/galerie" className="flex items-center justify-center">
                <Eye className="mr-2 h-5 w-5" /> Voir nos créations
              </Link>
            </Button>
          </div>

          {/* Scroll indicator */}
          <div className="animate-bounce text-pink-400">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          CONCEPT — Explication du trompe-l'œil
      ═══════════════════════════════════════════════════════════ */}
      <section className="w-full py-24 md:py-32 bg-stone-50 relative">
        {/* Background decorative elements */}
        <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-pink-200 to-transparent" />
        
        <div className="container mx-auto px-4 relative z-10">
          {/* Tagline */}
          <div className="text-center mb-24">
            <span className="text-pink-600/80 uppercase tracking-[0.4em] text-xs font-bold">L'Artisanat</span>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-serif text-gray-900 mt-6 leading-tight">
              Des bouquets qui se mangent.
            </h2>
            <div className="w-24 h-px bg-pink-300 mx-auto mt-8" />
          </div>

          {/* 3 columns explanation */}
          <div className="relative max-w-6xl mx-auto">
            {/* Ligne courbée mobile */}
            <svg className="absolute left-0 top-0 w-full h-full text-pink-200 md:hidden -z-10 pointer-events-none" preserveAspectRatio="none" viewBox="0 0 100 100">
              <path 
                d="M50,0 C90,20 90,40 50,50 C10,60 10,80 50,100" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2" 
                vectorEffect="non-scaling-stroke" 
                strokeDasharray="6 6" 
              />
            </svg>

            {/* Ligne horizontale desktop */}
            <div className="absolute top-0 left-[16%] right-[16%] h-px border-t-2 border-dashed border-pink-200 hidden md:block -z-10" />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-12 lg:gap-16 pt-8 md:pt-0">
              {/* Step 1 */}
              <div className="relative p-8 md:p-10 bg-white/90 backdrop-blur-sm border border-stone-100 shadow-sm hover:shadow-xl transition-all duration-500 group text-center">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 bg-white border border-pink-100 rounded-full flex items-center justify-center text-pink-500 shadow-sm group-hover:scale-110 group-hover:bg-pink-50 transition-all duration-500">
                  <span className="font-serif italic text-2xl">1</span>
                </div>
                <h3 className="text-2xl font-serif text-gray-900 mt-6 mb-4">
                  La Base Moelleuse
                </h3>
                <p className="text-gray-500 leading-relaxed font-light">
                  Chaque "fleur" de votre bouquet est un cupcake artisanal cuit le jour même. Vanille Bourbon, chocolat intense ou cœur fruits rouges, c'est vous qui choisissez l'expérience gustative.
                </p>
              </div>

              {/* Step 2 */}
              <div className="relative p-8 md:p-10 bg-white/90 backdrop-blur-sm border border-stone-100 shadow-sm hover:shadow-xl transition-all duration-500 group text-center mt-8 md:mt-0">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 bg-white border border-pink-100 rounded-full flex items-center justify-center text-pink-500 shadow-sm group-hover:scale-110 group-hover:bg-pink-50 transition-all duration-500">
                  <span className="font-serif italic text-2xl">2</span>
                </div>
                <h3 className="text-2xl font-serif text-gray-900 mt-6 mb-4">
                  Le Pochage d'Orfèvre
                </h3>
                <p className="text-gray-500 leading-relaxed font-light">
                  Aucun moule. Chaque pétale de rose, de pivoine ou de dahlia est poché minutieusement à la main, un par un, avec une crème au beurre soyeuse, légère et peu sucrée.
                </p>
              </div>

              {/* Step 3 */}
              <div className="relative p-8 md:p-10 bg-white/90 backdrop-blur-sm border border-stone-100 shadow-sm hover:shadow-xl transition-all duration-500 group text-center mt-8 md:mt-0">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 bg-white border border-pink-100 rounded-full flex items-center justify-center text-pink-500 shadow-sm group-hover:scale-110 group-hover:bg-pink-50 transition-all duration-500">
                  <span className="font-serif italic text-2xl">3</span>
                </div>
                <h3 className="text-2xl font-serif text-gray-900 mt-6 mb-4">
                  L'Illusion Parfaite
                </h3>
                <p className="text-gray-500 leading-relaxed font-light">
                  Les cupcakes sont ensuite assemblés et emballés avec du véritable papier fleuriste et un ruban de satin. Le résultat final est un cadeau spectaculaire, prêt à éblouir et à être dévoré.
                </p>
              </div>
            </div>
          </div>

          {/* Big visual CTA */}
          <div className="mt-20 bg-gray-900 rounded-3xl overflow-hidden relative">
            <div className="absolute inset-0 bg-gradient-to-r from-gray-900/95 to-gray-900/60 z-10" />
            {/* Background image placeholder */}
            <div className="absolute inset-0 bg-gradient-to-br from-pink-900/20 to-rose-900/30" />
            <div className="relative z-20 flex flex-col md:flex-row items-center p-10 md:p-16">
              <div className="flex-1 mb-8 md:mb-0">
                <h3 className="text-2xl md:text-4xl font-serif text-white mb-4">
                  "On a cru que c'étaient de vraies fleurs !"
                </h3>
                <p className="text-white/70 text-lg">
                  C'est LA réaction que provoquent nos bouquets à chaque fois. 
                  L'effet de surprise est garanti pour vos invités.
                </p>
              </div>
              <div className="flex-shrink-0">
                <Button asChild size="lg" className="bg-pink-500 hover:bg-pink-600 text-white rounded-full px-8 py-6 text-lg border-none shadow-lg mt-6 md:mt-0">
                  <Link href="/prestations" className="flex items-center justify-center">
                    Offrir un bouquet <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          OCCASIONS — Pour qui ? Pour quoi ?
      ═══════════════════════════════════════════════════════════ */}
      <section className="w-full py-20 md:py-32 bg-pink-50/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <span className="text-pink-600/80 uppercase tracking-[0.4em] text-xs font-bold">Occasions</span>
            <h2 className="text-4xl md:text-5xl font-serif text-gray-900 mt-6 leading-tight">
              Pour chaque moment de vie
            </h2>
            <div className="w-24 h-px bg-pink-300 mx-auto mt-8" />
            <p className="text-gray-500 mt-8 max-w-2xl mx-auto font-light leading-relaxed">
              Un cadeau qui surprend, qui émeut, et qui se déguste. Bien plus qu'un simple bouquet.
            </p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {[
              { title: "Mariages", desc: "Centre de table ou cadeau pour les témoins", Icon: Users },
              { title: "Anniversaires", desc: "L'alternative originale au gâteau classique", Icon: Cake },
              { title: "Fête des Mères", desc: "Le bouquet qu'elle ne verra pas venir", Icon: Heart },
              { title: "Entreprise", desc: "Impressionnez vos collaborateurs", Icon: Briefcase },
              { title: "Saint-Valentin", desc: "Des fleurs... qui se mangent à deux", Icon: Gift },
              { title: "Fêtes de fin d'année", desc: "La pièce maîtresse de votre table", Icon: Star },
              { title: "Baby Shower", desc: "Douceur et mignonnerie garanties", Icon: Smile },
              { title: "Juste pour le plaisir", desc: "Parce qu'il n'y a pas besoin d'excuse", Icon: Sparkles },
            ].map((occ, i) => (
              <div key={i} className="group relative bg-white rounded-xl p-6 md:p-8 border border-pink-100 shadow-sm hover:shadow-xl hover:border-pink-300 transition-all duration-500 text-center flex flex-col items-center justify-center h-full overflow-hidden">
                {/* Subtle gradient on hover */}
                <div className="absolute inset-0 bg-gradient-to-b from-transparent to-pink-50/80 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                
                <occ.Icon className="w-8 h-8 text-pink-400 mb-4 stroke-[1.5] group-hover:-translate-y-1 transition-transform duration-500 relative z-10" />
                
                <h3 className="font-serif text-base md:text-lg text-gray-900 mb-3 relative z-10">{occ.title}</h3>
                
                {/* Petit séparateur */}
                <div className="w-8 h-px bg-pink-200 mb-3 relative z-10 transition-all duration-500 group-hover:w-12 group-hover:bg-pink-400" />
                
                <p className="text-gray-500 text-xs md:text-sm font-light leading-relaxed relative z-10">{occ.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          BESTSELLERS — Créations phares
      ═══════════════════════════════════════════════════════════ */}
      <section className="w-full py-20 md:py-32 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <span className="text-pink-600/80 uppercase tracking-[0.4em] text-xs font-bold">Catalogue</span>
            <h2 className="text-4xl md:text-5xl font-serif text-gray-900 mt-6 leading-tight">
              Créations Phares
            </h2>
            <div className="w-24 h-px bg-pink-300 mx-auto mt-8" />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 lg:gap-16">
            {[
              {
                name: "Bouquet Délicat",
                desc: "7 cupcakes • 2 parfums au choix",
                price: "35",
                image: "/images/bouquet-classique.jpg",
                badge: ""
              },
              {
                name: "Bouquet Charmant",
                desc: "12 cupcakes • 2 parfums au choix",
                price: "60",
                image: "/images/bouquet-champetre.jpg",
                badge: "Best-seller"
              },
              {
                name: "Bouquet Pétale",
                desc: "19 cupcakes • 3 parfums au choix",
                price: "90",
                image: "https://images.unsplash.com/photo-1563241527-3004b7be0ffd?q=80&w=800&auto=format&fit=crop",
                badge: "Idéal Cadeau"
              }
            ].map((product, i) => (
              <Link href="/prestations" key={i} className="group flex flex-col items-center text-center">
                <div className="relative aspect-[4/5] w-full overflow-hidden rounded-2xl mb-8 shadow-sm group-hover:shadow-xl transition-all duration-500 border border-stone-100">
                  <img src={product.image} alt={product.name} className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-700" />
                  {product.badge && (
                    <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-white/95 backdrop-blur-sm px-4 py-1.5 rounded-full text-[10px] uppercase tracking-widest font-bold text-pink-600 shadow-sm border border-pink-50">
                      {product.badge}
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-500" />
                </div>
                
                <h3 className="font-serif text-2xl text-gray-900 mb-3 group-hover:text-pink-600 transition-colors">{product.name}</h3>
                
                {/* Petit séparateur */}
                <div className="w-8 h-px bg-pink-200 mb-4 transition-all duration-500 group-hover:w-16 group-hover:bg-pink-400" />
                
                <p className="text-gray-500 font-light text-sm mb-4">{product.desc}</p>
                <p className="text-xl font-serif text-pink-600 mb-6">{product.price} €</p>
                
                <div className="mt-auto w-full px-4 md:px-8">
                  <span className="w-full inline-flex items-center justify-center border border-stone-200 text-gray-700 rounded-full py-3 text-[11px] font-medium uppercase tracking-[0.2em] group-hover:border-pink-200 group-hover:bg-pink-50/50 group-hover:text-pink-600 transition-all duration-500">
                    Commander <ArrowRight className="ml-2 w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
          
          <div className="text-center mt-14">
            <Button asChild size="lg" className="bg-pink-600 hover:bg-pink-700 text-white rounded-full px-8 md:px-10 py-6 text-base md:text-lg shadow-lg border-none">
              <Link href="/prestations" className="flex items-center justify-center">
                Voir toute la carte <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          NOS PARFUMS — Les saveurs disponibles
      ═══════════════════════════════════════════════════════════ */}
      <section className="w-full py-20 md:py-32 bg-pink-50/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <span className="text-pink-600/80 uppercase tracking-[0.4em] text-xs font-bold">Gourmandise</span>
            <h2 className="text-4xl md:text-5xl font-serif text-gray-900 mt-6 leading-tight">
              Nos parfums
            </h2>
            <div className="w-24 h-px bg-pink-300 mx-auto mt-8" />
            <p className="text-gray-500 mt-8 max-w-xl mx-auto font-light leading-relaxed">
              Choisissez les saveurs qui composeront votre bouquet. Chaque cupcake peut avoir un parfum différent !
            </p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6 max-w-5xl mx-auto mt-12">
            {[
              "Nutella",
              "Fruits Rouges",
              "Mangue Passion",
              "Caramel Beurre Salé",
              "Bueno",
              "Chocolat Dubaï",
            ].map((flavor, i) => (
              <div key={i} className="group relative bg-white p-8 md:p-10 text-center shadow-sm hover:shadow-xl transition-all duration-700 flex flex-col items-center justify-center min-h-[160px]">
                {/* Cadre intérieur façon étiquette parfum/luxe */}
                <div className="absolute inset-2 md:inset-3 border border-stone-100 group-hover:border-pink-200 transition-colors duration-700 pointer-events-none" />
                
                <div className="relative z-10 flex flex-col items-center justify-center w-full">
                  <span className="font-serif italic text-stone-300 text-sm mb-3 group-hover:text-pink-400 transition-colors duration-500">
                    N° {String(i + 1).padStart(2, '0')}
                  </span>
                  <h3 className="font-serif text-lg md:text-xl text-gray-900 leading-snug group-hover:text-pink-600 transition-colors duration-500">
                    {flavor}
                  </h3>
                </div>
              </div>
            ))}
          </div>
          <p className="text-center text-sm text-gray-400 mt-6">* Chocolat Dubaï : supplément 1€/pièce en dessous de 30 cupcakes</p>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          COMMENT ÇA MARCHE — Process de commande (6 étapes)
      ═══════════════════════════════════════════════════════════ */}
      <section className="w-full py-20 md:py-32 bg-gray-900 text-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <span className="text-pink-400 uppercase tracking-[0.4em] text-xs font-bold">Simple & Rapide</span>
            <h2 className="text-4xl md:text-5xl font-serif text-white mt-6 leading-tight">
              Comment passer commande ?
            </h2>
            <div className="w-24 h-px bg-pink-500/50 mx-auto mt-8" />
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 max-w-6xl mx-auto mt-12">
            {[
              { step: "1", title: "L'Événement", desc: "Précisez l'occasion (mariage, anniversaire, cadeau...) pour une création parfaitement adaptée." },
              { step: "2", title: "La Date", desc: "Choisissez la date et l'heure idéales pour le retrait de votre commande à notre atelier." },
              { step: "3", title: "Le Format", desc: "Sélectionnez le nombre de cupcakes (de 7 à plus de 30) selon le nombre de gourmands." },
              { step: "4", title: "L'Écrin", desc: "Optez pour l'illusion parfaite du bouquet floral ou l'élégance sobre d'une box classique." },
              { step: "5", title: "Les Saveurs", desc: "Personnalisez votre création gustative en choisissant les parfums de vos cupcakes." },
              { step: "6", title: "Le Retrait", desc: "Venez récupérer votre création sur-mesure directement à notre atelier d'Heillecourt (54)." },
            ].map((item, i) => (
              <div key={i} className="group relative bg-white/5 p-8 md:p-10 rounded-2xl border border-white/10 hover:border-pink-400/30 hover:bg-white/10 transition-all duration-500 overflow-hidden text-left flex flex-col h-full">
                {/* Grand numéro en filigrane */}
                <div className="absolute -bottom-6 -right-2 text-9xl font-serif italic text-white/5 group-hover:text-pink-400/10 transition-colors duration-500 pointer-events-none select-none">
                  {item.step}
                </div>
                
                <div className="relative z-10 flex-1">
                  <span className="inline-block text-pink-400 text-xs font-bold tracking-[0.2em] uppercase mb-4">
                    Étape 0{item.step}
                  </span>
                  <h3 className="font-serif text-2xl text-white mb-3">{item.title}</h3>
                  <div className="w-8 h-px bg-white/20 mb-4 group-hover:w-16 group-hover:bg-pink-400/50 transition-all duration-500" />
                  <p className="text-gray-400 font-light text-sm leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
          
          <div className="text-center mt-14">
            <Button asChild size="lg" className="bg-pink-500 hover:bg-pink-600 text-white rounded-full px-8 md:px-10 py-6 text-base md:text-lg border-none shadow-xl shadow-pink-500/20">
              <Link href="/reservation" className="flex items-center justify-center">
                <Calendar className="mr-2 h-5 w-5" /> Réserver ma date
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          TÉMOIGNAGES
      ═══════════════════════════════════════════════════════════ */}
      <section className="w-full py-20 md:py-32 bg-stone-50 overflow-hidden">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <span className="text-pink-600/80 uppercase tracking-[0.4em] text-xs font-bold block mb-4">Livre d'Or</span>
            <h2 className="text-4xl md:text-5xl font-serif text-gray-900 mt-6 leading-tight">
              Vos plus beaux retours
            </h2>
            <div className="w-24 h-px bg-pink-300 mx-auto mt-8" />
          </div>
          
          <div className="w-full max-w-7xl mx-auto relative">
            {/* Dégradés sur les bords pour l'effet slider (desktop) */}
            <div className="hidden lg:block absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-stone-50 to-transparent z-10 pointer-events-none" />
            <div className="hidden lg:block absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-stone-50 to-transparent z-10 pointer-events-none" />
            
            <TestimonialSlider />
          </div>
        </div>
      </section>


      {/* ═══════════════════════════════════════════════════════════
          FINAL CTA — Bandeau d'appel à l'action
      ═══════════════════════════════════════════════════════════ */}
      <section className="w-full py-24 md:py-32 bg-stone-50 border-t border-stone-100 relative overflow-hidden">
        {/* Cercle décoratif très subtil en arrière-plan */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-pink-100/30 rounded-full blur-3xl opacity-50 pointer-events-none" />
        
        <div className="container mx-auto px-4 text-center relative z-10">
          <span className="text-pink-600/80 uppercase tracking-[0.4em] text-xs font-bold block mb-6">Événements</span>
          <h2 className="text-4xl md:text-6xl font-serif text-gray-900 mb-8 leading-tight max-w-3xl mx-auto">
            Prêt(e) à surprendre vos proches ?
          </h2>
          
          <div className="w-16 h-px bg-pink-300 mx-auto mb-8" />
          
          <p className="text-gray-500 font-light text-lg max-w-2xl mx-auto mb-12 leading-relaxed">
            Offrez bien plus qu'un dessert : une véritable création florale, confectionnée à la main avec amour pour rendre votre événement inoubliable.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
            <Button asChild size="lg" className="w-full sm:w-auto bg-pink-600 hover:bg-pink-700 text-white rounded-full px-10 py-7 text-base tracking-wide shadow-xl shadow-pink-600/20 transition-all duration-300 hover:-translate-y-1">
              <Link href="/prestations" className="flex items-center justify-center">
                Voir la carte <ArrowRight className="ml-2 w-4 h-4" />
              </Link>
            </Button>
            
            <Button asChild variant="outline" size="lg" className="w-full sm:w-auto bg-white text-gray-700 border-stone-200 hover:border-pink-300 hover:bg-pink-50 hover:text-pink-600 rounded-full px-10 py-7 text-base tracking-wide transition-all duration-300">
              <Link href="/contact" className="flex items-center justify-center">
                Demande sur-mesure
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}
