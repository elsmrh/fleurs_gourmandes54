"use client"

import { useState } from "react"
import { Megaphone, ShieldAlert, Save, Loader2, CheckCircle2, FileText } from "lucide-react"
import { updateSettings } from "@/app/actions/settings"

interface SettingsFormProps {
  initialMaxOrders: string
  initialMaxRevenue: string
  initialBannerActive: boolean
  initialBannerText: string
  initialBusinessAddress: string
  initialBusinessSiret: string
  initialDepositPercent: string
}

export default function SettingsForm({
  initialMaxOrders,
  initialMaxRevenue,
  initialBannerActive,
  initialBannerText,
  initialBusinessAddress,
  initialBusinessSiret,
  initialDepositPercent,
}: SettingsFormProps) {
  const [bannerActive, setBannerActive] = useState(initialBannerActive)
  const [bannerText, setBannerText] = useState(initialBannerText)
  const [isSaving, setIsSaving] = useState(false)
  const [savedSuccess, setSavedSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSaving(true)
    setSavedSuccess(false)
    setError(null)
    try {
      const formData = new FormData(e.currentTarget)
      await updateSettings(formData)
      setSavedSuccess(true)
      setTimeout(() => setSavedSuccess(false), 4000)
    } catch {
      setError("Une erreur est survenue lors de l'enregistrement.")
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Anti-surmenage (Blocage auto) */}
      <div className="bg-white rounded-3xl p-6 md:p-8 shadow-[0_2px_20px_-4px_rgba(0,0,0,0.05)] border border-stone-100">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center text-orange-600">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-900">Blocage automatique (Anti-surmenage)</h2>
            <p className="text-sm text-gray-500">Bloquez automatiquement les nouvelles commandes sur une journée si un seuil est atteint.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Nombre de commandes MAX par jour
            </label>
            <input 
              type="number" 
              name="max_orders_per_day" 
              defaultValue={initialMaxOrders}
              placeholder="Ex: 5"
              min="1"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-stone-50 focus:bg-white focus:ring-2 focus:ring-pink-500 focus:border-pink-500 outline-none transition-all"
            />
            <p className="text-xs text-gray-400 mt-2">Laissez vide pour ne pas limiter au nombre.</p>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Chiffre d&apos;affaires MAX par jour (€)
            </label>
            <input 
              type="number" 
              name="max_revenue_per_day" 
              defaultValue={initialMaxRevenue}
              placeholder="Ex: 500"
              min="1"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-stone-50 focus:bg-white focus:ring-2 focus:ring-pink-500 focus:border-pink-500 outline-none transition-all"
            />
            <p className="text-xs text-gray-400 mt-2">Laissez vide pour ne pas limiter au montant.</p>
          </div>
        </div>
      </div>

      {/* Bannière publique */}
      <div className="bg-white rounded-3xl p-6 md:p-8 shadow-[0_2px_20px_-4px_rgba(0,0,0,0.05)] border border-stone-100">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
            <Megaphone className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-900">Bannière d&apos;annonce publique</h2>
            <p className="text-sm text-gray-500">Affichez un message tout en haut de votre site client.</p>
          </div>
        </div>

        <div className="space-y-6">
          <label className="flex items-center gap-3 cursor-pointer select-none">
            <input 
              type="checkbox" 
              name="public_banner_active" 
              value="true"
              checked={bannerActive}
              onChange={(e) => setBannerActive(e.target.checked)}
              className="w-5 h-5 rounded accent-pink-600 focus:ring-pink-500 border-gray-300"
            />
            <span className="text-sm font-semibold text-gray-900">Activer la bannière sur le site</span>
            {bannerActive && (
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-pink-100 text-pink-700">Active</span>
            )}
          </label>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Texte de la bannière
            </label>
            <input 
              type="text" 
              name="public_banner_text" 
              value={bannerText}
              onChange={(e) => setBannerText(e.target.value)}
              placeholder="Ex: 🌸 Carnet de commandes complet en Août 🌸"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-stone-50 focus:bg-white focus:ring-2 focus:ring-pink-500 focus:border-pink-500 outline-none transition-all"
            />
          </div>

          {/* Aperçu en direct */}
          {bannerText.trim() && (
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">
                Aperçu sur le site {bannerActive ? "(visible par les clients)" : "(actuellement masquée)"}
              </p>
              <div className={`bg-pink-100/90 border border-pink-200 rounded-xl py-2.5 px-4 flex items-center justify-center gap-4 overflow-hidden ${!bannerActive ? "opacity-50" : ""}`}>
                <span className="text-pink-400 text-xs">✨</span>
                <span className="text-pink-900 text-xs sm:text-sm font-bold uppercase tracking-[0.15em] truncate">
                  {bannerText}
                </span>
                <span className="text-pink-400 text-xs">✨</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Informations Devis & Facture */}
      <div className="bg-white rounded-3xl p-6 md:p-8 shadow-[0_2px_20px_-4px_rgba(0,0,0,0.05)] border border-stone-100">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-full bg-pink-100 flex items-center justify-center text-pink-600">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-900">Devis & Factures</h2>
            <p className="text-sm text-gray-500">Informations affichées sur vos devis et factures imprimables.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-1">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              N° SIRET (optionnel)
            </label>
            <input 
              type="text" 
              name="business_siret" 
              defaultValue={initialBusinessSiret}
              placeholder="Ex: 123 456 789 00012"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-stone-50 focus:bg-white focus:ring-2 focus:ring-pink-500 focus:border-pink-500 outline-none transition-all"
            />
          </div>

          <div className="md:col-span-1">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Adresse / Ville
            </label>
            <input 
              type="text" 
              name="business_address" 
              defaultValue={initialBusinessAddress}
              placeholder="Nancy, Meurthe-et-Moselle"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-stone-50 focus:bg-white focus:ring-2 focus:ring-pink-500 focus:border-pink-500 outline-none transition-all"
            />
          </div>

          <div className="md:col-span-1">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Acompte sur devis (%)
            </label>
            <input 
              type="number" 
              name="default_deposit_percent" 
              defaultValue={initialDepositPercent}
              placeholder="Ex: 30"
              min="0"
              max="100"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-stone-50 focus:bg-white focus:ring-2 focus:ring-pink-500 focus:border-pink-500 outline-none transition-all"
            />
            <p className="text-xs text-gray-400 mt-2">Affiche le montant d&apos;acompte demandé sur les devis.</p>
          </div>
        </div>
      </div>

      {/* Feedback & Bouton Enregistrer */}
      <div className="flex flex-col sm:flex-row items-center justify-end gap-4">
        {savedSuccess && (
          <div className="flex items-center gap-2 text-emerald-700 bg-emerald-50 border border-emerald-200 px-4 py-2.5 rounded-xl text-sm font-semibold animate-in fade-in duration-200">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            Modifications enregistrées !
          </div>
        )}
        {error && (
          <div className="text-red-700 bg-red-50 border border-red-200 px-4 py-2.5 rounded-xl text-sm font-semibold">
            {error}
          </div>
        )}
        <button 
          type="submit"
          disabled={isSaving}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-pink-600 hover:bg-pink-700 disabled:opacity-60 text-white font-bold py-3 px-8 rounded-xl shadow-lg shadow-pink-200 transition-all active:scale-95"
        >
          {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
          {isSaving ? "Enregistrement..." : "Enregistrer les modifications"}
        </button>
      </div>
    </form>
  )
}

