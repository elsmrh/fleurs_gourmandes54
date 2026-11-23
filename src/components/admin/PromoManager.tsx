"use client"

import { useState } from "react"
import { Tag, Trash2, Plus, Percent, Euro, Copy, Check, Eye, EyeOff, Loader2, Calendar, AlertTriangle } from "lucide-react"
import { createPromoAction, togglePromoActiveAction, deletePromoAction } from "@/app/actions/promos"

export interface PromoItem {
  id: string
  code: string
  type: string
  value: number
  active: boolean
  maxUses: number | null
  usesCount: number
  expiresAt: string | null
}

export default function PromoManager({ initialPromos }: { initialPromos: PromoItem[] }) {
  const [promos, setPromos] = useState<PromoItem[]>(initialPromos)
  const [code, setCode] = useState("")
  const [type, setType] = useState<"PERCENTAGE" | "FIXED">("PERCENTAGE")
  const [value, setValue] = useState("")
  const [maxUses, setMaxUses] = useState("")
  const [expiresAt, setExpiresAt] = useState("")
  const [isCreating, setIsCreating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loadingId, setLoadingId] = useState<string | null>(null)
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [confirmDelete, setConfirmDelete] = useState<PromoItem | null>(null)

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsCreating(true)
    try {
      const res = await createPromoAction({
        code,
        type,
        value: parseFloat(value),
        maxUses: maxUses ? parseInt(maxUses, 10) : null,
        expiresAt: expiresAt || null,
      })
      if (!res.success || !res.promo) {
        setError(res.error || "Erreur lors de la création.")
      } else {
        setPromos(prev => [res.promo!, ...prev])
        setCode("")
        setValue("")
        setMaxUses("")
        setExpiresAt("")
      }
    } catch {
      setError("Une erreur est survenue.")
    } finally {
      setIsCreating(false)
    }
  }

  const handleToggle = async (promo: PromoItem) => {
    setLoadingId(promo.id)
    try {
      const nextActive = !promo.active
      const res = await togglePromoActiveAction(promo.id, nextActive)
      if (res.success) {
        setPromos(prev => prev.map(p => p.id === promo.id ? { ...p, active: nextActive } : p))
      }
    } finally {
      setLoadingId(null)
    }
  }

  const handleConfirmDelete = async () => {
    if (!confirmDelete) return
    const targetId = confirmDelete.id
    setLoadingId(targetId)
    try {
      const res = await deletePromoAction(targetId)
      if (res.success) {
        setPromos(prev => prev.filter(p => p.id !== targetId))
        setConfirmDelete(null)
      }
    } finally {
      setLoadingId(null)
    }
  }

  const handleCopy = (promo: PromoItem) => {
    navigator.clipboard.writeText(promo.code).catch(() => {})
    setCopiedId(promo.id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  const getPromoState = (p: PromoItem) => {
    if (!p.active) return { label: "Désactivé", badge: "bg-gray-100 text-gray-500" }
    if (p.expiresAt && new Date(p.expiresAt) < new Date()) return { label: "Expiré", badge: "bg-red-100 text-red-700" }
    if (p.maxUses && p.usesCount >= p.maxUses) return { label: "Limite atteinte", badge: "bg-orange-100 text-orange-700" }
    return { label: "Actif", badge: "bg-emerald-100 text-emerald-700" }
  }

  return (
    <div className="space-y-8">
      {/* Formulaire de création */}
      <div className="bg-white rounded-3xl p-6 md:p-8 shadow-[0_2px_20px_-4px_rgba(0,0,0,0.05)] border border-stone-100">
        <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
          <Plus className="w-5 h-5 text-pink-600" /> Ajouter un code promo
        </h2>

        <form onSubmit={handleCreate} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="lg:col-span-1">
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Code *</label>
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                required
                placeholder="MAMAN15"
                className="w-full px-4 py-2.5 uppercase font-bold rounded-xl border border-gray-200 bg-stone-50 focus:bg-white focus:ring-2 focus:ring-pink-500 focus:border-pink-500 outline-none transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Type</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as "PERCENTAGE" | "FIXED")}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-stone-50 focus:bg-white focus:ring-2 focus:ring-pink-500 focus:border-pink-500 outline-none transition-all"
              >
                <option value="PERCENTAGE">Pourcentage (%)</option>
                <option value="FIXED">Montant fixe (€)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                Valeur ({type === "PERCENTAGE" ? "%" : "€"}) *
              </label>
              <input
                type="number"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                required
                min="0.5"
                max={type === "PERCENTAGE" ? "100" : undefined}
                step="0.01"
                placeholder="10"
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-stone-50 focus:bg-white focus:ring-2 focus:ring-pink-500 focus:border-pink-500 outline-none transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Max utilisations</label>
              <input
                type="number"
                value={maxUses}
                onChange={(e) => setMaxUses(e.target.value)}
                min="1"
                placeholder="Illimité"
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-stone-50 focus:bg-white focus:ring-2 focus:ring-pink-500 focus:border-pink-500 outline-none transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Expire le</label>
              <input
                type="date"
                value={expiresAt}
                onChange={(e) => setExpiresAt(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-stone-50 focus:bg-white focus:ring-2 focus:ring-pink-500 focus:border-pink-500 outline-none transition-all"
              />
            </div>
          </div>

          {error && (
            <p className="text-sm text-red-700 bg-red-50 border border-red-100 rounded-xl px-4 py-2.5 font-medium">
              {error}
            </p>
          )}

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={isCreating}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-gray-900 hover:bg-gray-800 disabled:opacity-60 text-white font-bold rounded-xl shadow-sm transition-colors h-[44px]"
            >
              {isCreating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
              Créer le code
            </button>
          </div>
        </form>
      </div>

      {/* Liste des codes */}
      <div className="bg-white rounded-3xl overflow-hidden shadow-[0_2px_20px_-4px_rgba(0,0,0,0.05)] border border-stone-100">
        {promos.length === 0 ? (
          <div className="px-6 py-12 text-center text-gray-500">Aucun code promo configuré.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-stone-50 border-b border-stone-100">
                <tr>
                  <th className="px-6 py-4 font-semibold text-gray-500 text-xs uppercase tracking-wider">Code Promo</th>
                  <th className="px-4 py-4 font-semibold text-gray-500 text-xs uppercase tracking-wider">Réduction</th>
                  <th className="px-4 py-4 font-semibold text-gray-500 text-xs uppercase tracking-wider">Utilisations</th>
                  <th className="px-4 py-4 font-semibold text-gray-500 text-xs uppercase tracking-wider">Validité</th>
                  <th className="px-4 py-4 font-semibold text-gray-500 text-xs uppercase tracking-wider">Statut</th>
                  <th className="px-6 py-4 font-semibold text-right text-gray-500 text-xs uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {promos.map(promo => {
                  const state = getPromoState(promo)
                  return (
                    <tr key={promo.id} className={`hover:bg-stone-50 transition-colors ${!promo.active ? "opacity-60" : ""}`}>
                      <td className="px-6 py-4">
                        <div className="inline-flex items-center gap-2">
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-pink-50 text-pink-700 font-black tracking-widest rounded-md border border-pink-100">
                            <Tag className="w-3.5 h-3.5" />
                            {promo.code}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleCopy(promo)}
                            title="Copier le code"
                            className="p-1.5 rounded-lg text-gray-400 hover:text-pink-600 hover:bg-pink-50 transition-colors"
                          >
                            {copiedId === promo.id ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                          </button>
                        </div>
                      </td>
                      <td className="px-4 py-4 font-bold text-gray-900">
                        {promo.type === "PERCENTAGE" ? (
                          <span className="flex items-center gap-1 text-emerald-600"><Percent className="w-4 h-4"/> {promo.value}%</span>
                        ) : (
                          <span className="flex items-center gap-1 text-emerald-600"><Euro className="w-4 h-4"/> {promo.value} €</span>
                        )}
                      </td>
                      <td className="px-4 py-4 text-gray-600 font-medium">
                        {promo.usesCount}{promo.maxUses ? ` / ${promo.maxUses}` : " (illimité)"}
                      </td>
                      <td className="px-4 py-4 text-gray-500 text-xs">
                        {promo.expiresAt ? (
                          <span className="inline-flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5 text-gray-400" />
                            Jusqu&apos;au {new Date(promo.expiresAt).toLocaleDateString("fr-FR")}
                          </span>
                        ) : (
                          <span className="text-gray-400">Sans limite</span>
                        )}
                      </td>
                      <td className="px-4 py-4">
                        <span className={`inline-block px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider ${state.badge}`}>
                          {state.label}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="inline-flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => handleToggle(promo)}
                            disabled={loadingId === promo.id}
                            title={promo.active ? "Désactiver ce code" : "Réactiver ce code"}
                            className="p-2 rounded-lg text-gray-400 hover:text-gray-800 hover:bg-stone-100 transition-colors"
                          >
                            {loadingId === promo.id ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : promo.active ? (
                              <EyeOff className="w-4 h-4" />
                            ) : (
                              <Eye className="w-4 h-4" />
                            )}
                          </button>
                          <button
                            type="button"
                            onClick={() => setConfirmDelete(promo)}
                            disabled={loadingId === promo.id}
                            title="Supprimer"
                            className="text-gray-400 hover:text-red-500 transition-colors p-2 rounded-lg hover:bg-red-50"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modale de confirmation de suppression */}
      {confirmDelete && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4" role="dialog" aria-modal="true">
          <div className="absolute inset-0 bg-black/30 backdrop-blur-[1px]" onClick={() => setConfirmDelete(null)} />
          <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-md p-6">
            <div className="flex items-start gap-4">
              <div className="h-11 w-11 shrink-0 rounded-full bg-red-50 text-red-600 flex items-center justify-center">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">Supprimer le code {confirmDelete.code} ?</h3>
                <p className="text-sm text-gray-500 mt-1">
                  Cette action est définitive. Astuce : vous pouvez simplement le désactiver avec l&apos;icône œil pour le réutiliser plus tard.
                </p>
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setConfirmDelete(null)}
                className="px-5 py-2.5 rounded-xl text-sm font-medium text-gray-600 hover:bg-stone-100 transition-colors"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={loadingId === confirmDelete.id}
                className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-red-600 hover:bg-red-700 flex items-center gap-2 transition-colors"
              >
                {loadingId === confirmDelete.id && <Loader2 className="w-4 h-4 animate-spin" />}
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

