"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Mail, MapPin } from "lucide-react";
import { submitContact } from "@/app/actions/contact";

export default function ContactPage() {
  const [status, setStatus] = useState<{ success?: string; error?: string } | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setStatus(null);
    const formData = new FormData(e.currentTarget);
    const result = await submitContact({}, formData);
    setStatus(result);
    setLoading(false);
    if (result?.success) {
      (e.target as HTMLFormElement).reset();
    }
  };

  return (
    <div className="flex flex-col min-h-screen pt-24 bg-[#FDFBF9] overflow-hidden relative selection:bg-pink-200">
      {/* Background decorations artistiques */}
      <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-pink-100/40 rounded-full blur-[100px] opacity-70 -translate-y-1/4 translate-x-1/4 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-rose-100/40 rounded-full blur-[100px] opacity-60 translate-y-1/4 -translate-x-1/4 pointer-events-none" />

      <div className="container mx-auto px-4 max-w-6xl relative z-10 pb-32">
        {/* En-tête */}
        <div className="text-center mb-20 pt-12">
          <span className="text-pink-600 uppercase tracking-[0.4em] text-xs font-bold block mb-6">
            Contact
          </span>
          <h1 className="text-5xl md:text-7xl font-serif text-gray-900 mb-8 leading-tight">
            Écrivez-nous
          </h1>
          <div className="w-px h-24 bg-gradient-to-b from-pink-300 to-transparent mx-auto" />
        </div>

        <div className="flex flex-col lg:flex-row gap-16 lg:gap-24">
          {/* Colonne de gauche : Informations */}
          <div className="w-full lg:w-1/3">
            <h2 className="text-3xl font-serif text-gray-900 mb-6">Discutons de votre événement.</h2>
            <p className="text-gray-600 font-light leading-relaxed mb-12">
              Que ce soit pour une question sur notre carte, une demande de création sur-mesure, ou simplement pour nous dire bonjour, n&apos;hésitez pas à nous écrire.
            </p>

            <div className="space-y-8">
              {/* Localisation */}
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-white shadow-sm border border-pink-100 flex items-center justify-center flex-shrink-0">
                  <MapPin className="w-5 h-5 text-pink-600" aria-hidden="true" />
                </div>
                <div>
                  <h3 className="font-serif text-gray-900 text-lg mb-1">Localisation</h3>
                  <p className="text-gray-600 font-light text-sm">Heillecourt &amp; Grand Nancy (54)</p>
                  <p className="text-gray-500 font-light text-sm mt-1">Retrait sur rendez-vous uniquement.</p>
                </div>
              </div>

              {/* Email */}
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-white shadow-sm border border-pink-100 flex items-center justify-center flex-shrink-0">
                  <Mail className="w-5 h-5 text-pink-600" aria-hidden="true" />
                </div>
                <div>
                  <h3 className="font-serif text-gray-900 text-lg mb-1">Email</h3>
                  <a
                    href="mailto:contact@fleurs-gourmandes54.fr"
                    className="text-pink-600 hover:text-pink-700 font-medium text-sm transition-colors"
                  >
                    contact@fleurs-gourmandes54.fr
                  </a>
                </div>
              </div>

              {/* Réseaux sociaux */}
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-white shadow-sm border border-pink-100 flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-pink-600" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-serif text-gray-900 text-lg mb-1">Instagram</h3>
                  <a
                    href="https://www.instagram.com/fleurs_gourmandes54/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-pink-600 hover:text-pink-700 font-medium text-sm transition-colors"
                  >
                    @fleurs_gourmandes54
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Colonne de droite : Formulaire */}
          <div className="w-full lg:w-2/3">
            <div className="bg-white/80 backdrop-blur-md p-8 md:p-12 rounded-[2rem] shadow-xl border border-white/50">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Champ Honeypot invisible anti-spam */}
                <div className="hidden" aria-hidden="true">
                  <label htmlFor="website">Site web (ne pas remplir)</label>
                  <input
                    id="website"
                    name="website"
                    type="text"
                    tabIndex={-1}
                    autoComplete="off"
                  />
                </div>

                {status?.success && (
                  <div role="status" className="p-4 bg-green-50 text-green-700 rounded-xl border border-green-100 mb-6">
                    {status.success}
                  </div>
                )}

                {status?.error && (
                  <div role="alert" className="p-4 bg-red-50 text-red-700 rounded-xl border border-red-100 mb-6">
                    {status.error}
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label htmlFor="name" className="text-sm font-medium text-gray-700 ml-2">
                      Nom complet *
                    </label>
                    <Input
                      id="name"
                      name="name"
                      placeholder="Votre nom"
                      className="bg-white/50 border-stone-200 focus:border-pink-300 focus:ring-pink-300 rounded-xl px-4 py-6"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="email" className="text-sm font-medium text-gray-700 ml-2">
                      Adresse email *
                    </label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="vous@exemple.com"
                      className="bg-white/50 border-stone-200 focus:border-pink-300 focus:ring-pink-300 rounded-xl px-4 py-6"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label htmlFor="phone" className="text-sm font-medium text-gray-700 ml-2">
                      Téléphone
                    </label>
                    <Input
                      id="phone"
                      name="phone"
                      type="tel"
                      placeholder="06 12 34 56 78"
                      className="bg-white/50 border-stone-200 focus:border-pink-300 focus:ring-pink-300 rounded-xl px-4 py-6"
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="subject" className="text-sm font-medium text-gray-700 ml-2">
                      Sujet *
                    </label>
                    <select
                      id="subject"
                      name="subject"
                      className="flex h-[50px] w-full items-center justify-between rounded-xl border border-stone-200 bg-white/50 px-4 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-pink-300 focus:border-pink-300 disabled:cursor-not-allowed disabled:opacity-50"
                      required
                      defaultValue=""
                    >
                      <option value="" disabled>
                        Sélectionnez un sujet
                      </option>
                      <option value="information">Demande d&apos;information</option>
                      <option value="sur_mesure">Demande de création sur-mesure (Bouquet XXL, Mariage...)</option>
                      <option value="partenariat">Partenariat / Presse</option>
                      <option value="autre">Autre</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <label htmlFor="message" className="text-sm font-medium text-gray-700 ml-2">
                    Votre message *
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    placeholder="Parlez-nous de votre projet..."
                    className="w-full bg-white/50 border border-stone-200 focus:border-pink-300 focus:ring-pink-300 rounded-xl px-4 py-4 min-h-[150px] resize-none focus:outline-none focus:ring-2"
                    required
                  />
                </div>

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-pink-600 hover:bg-pink-700 text-white rounded-xl py-6 text-lg tracking-wide shadow-lg shadow-pink-600/20 transition-all hover:-translate-y-1 mt-4"
                >
                  {loading ? "Envoi en cours..." : "Envoyer le message"}
                </Button>

                <p className="text-xs text-center text-gray-500 mt-4 font-light">
                  En soumettant ce formulaire, vous acceptez que vos données soient traitées pour répondre à votre demande.
                </p>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
