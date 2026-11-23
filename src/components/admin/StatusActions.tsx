"use client"

import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Loader2, Mail, CheckCircle2, XCircle, RotateCcw, AlertTriangle, ChevronDown } from "lucide-react"
import { BOOKING_STATUSES, STATUSES_WITH_EMAIL, getStatusConfig } from "@/lib/booking-status"

interface StatusActionsProps {
  bookingId: string
  currentStatus: string
}

type ActionConfig = {
  next: string
  label: string
  icon: React.ElementType
  color: string
}

const STATUS_FLOW: Record<string, ActionConfig[]> = {
  PENDING: [
    { next: "DEVIS_SENT", label: "Marquer devis envoyé", icon: Mail, color: "bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200" },
    { next: "CONFIRMED", label: "Confirmer directement", icon: CheckCircle2, color: "bg-green-50 hover:bg-green-100 text-green-700 border border-green-200" },
    { next: "CANCELLED", label: "Annuler la commande", icon: XCircle, color: "bg-white hover:bg-red-50 text-red-600 border border-red-100" },
  ],
  DEVIS_SENT: [
    { next: "CONFIRMED", label: "Confirmer la commande", icon: CheckCircle2, color: "bg-green-50 hover:bg-green-100 text-green-700 border border-green-200" },
    { next: "CANCELLED", label: "Annuler la commande", icon: XCircle, color: "bg-white hover:bg-red-50 text-red-600 border border-red-100" },
  ],
  CONFIRMED: [
    { next: "CANCELLED", label: "Annuler la commande", icon: XCircle, color: "bg-white hover:bg-red-50 text-red-600 border border-red-100" },
  ],
  CANCELLED: [
    { next: "PENDING", label: "Remettre en attente", icon: RotateCcw, color: "bg-orange-50 hover:bg-orange-100 text-orange-700 border border-orange-200" },
  ],
}

const CONFIRM_TEXT: Record<string, { title: string; description: string; button: string; danger?: boolean }> = {
  DEVIS_SENT: { title: "Marquer le devis comme envoyé ?", description: "La commande passera au statut « Devis envoyé ».", button: "Valider" },
  CONFIRMED:  { title: "Confirmer la commande ?", description: "La commande sera confirmée et comptée dans le chiffre d'affaires.", button: "Confirmer" },
  CANCELLED:  { title: "Annuler la commande ?", description: "La commande sera marquée comme annulée. Vous pourrez la remettre en attente plus tard si besoin.", button: "Oui, annuler", danger: true },
  PENDING:    { title: "Remettre en attente ?", description: "La commande repassera au statut « En attente ».", button: "Valider" },
}

/**
 * Gère le changement de statut : fenêtre de confirmation, option d'email au client,
 * appel API et messages d'erreur. Réutilisé par la fiche commande et la liste.
 */
export function useStatusChange(bookingId: string, customerName?: string) {
  const router = useRouter()
  const [pending, setPending] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [notify, setNotify] = useState(true)

  const request = (next: string) => {
    setError(null)
    setNotify(true)
    setPending(next)
  }

  const close = () => {
    if (!loading) setPending(null)
  }

  const confirm = async () => {
    if (!pending) return
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/orders/${bookingId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: pending, notify }),
      })
      if (!res.ok) throw new Error()
      setPending(null)
      router.refresh()
    } catch {
      setError("Le changement de statut a échoué. Vérifiez votre connexion et réessayez.")
    } finally {
      setLoading(false)
    }
  }

  const dialog = pending ? (
    <ConfirmStatusDialog
      next={pending}
      customerName={customerName}
      notify={notify}
      onNotifyChange={setNotify}
      loading={loading}
      error={error}
      onCancel={close}
      onConfirm={confirm}
    />
  ) : null

  return { request, dialog, loading }
}

function ConfirmStatusDialog({
  next, customerName, notify, onNotifyChange, loading, error, onCancel, onConfirm,
}: {
  next: string
  customerName?: string
  notify: boolean
  onNotifyChange: (v: boolean) => void
  loading: boolean
  error: string | null
  onCancel: () => void
  onConfirm: () => void
}) {
  const text = CONFIRM_TEXT[next] ?? CONFIRM_TEXT.PENDING
  const sendsEmail = STATUSES_WITH_EMAIL.includes(next as (typeof STATUSES_WITH_EMAIL)[number])

  // Fermer avec Échap
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onCancel()
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [onCancel])

  return (
    <div className="fixed inset-0 z-[70] flex items-end sm:items-center justify-center p-4" role="dialog" aria-modal="true" aria-labelledby="status-dialog-title">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-[1px]" onClick={onCancel} />
      <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-md p-6 animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-start gap-4">
          <div className={`h-11 w-11 shrink-0 rounded-full flex items-center justify-center ${text.danger ? "bg-red-50 text-red-600" : "bg-pink-50 text-pink-600"}`}>
            {text.danger ? <AlertTriangle className="h-5 w-5" /> : <CheckCircle2 className="h-5 w-5" />}
          </div>
          <div className="flex-1">
            <h3 id="status-dialog-title" className="text-lg font-bold text-gray-900">{text.title}</h3>
            <p className="text-sm text-gray-500 mt-1">
              {customerName ? <>Commande de <strong className="text-gray-700">{customerName}</strong>. </> : null}
              {text.description}
            </p>
          </div>
        </div>

        {sendsEmail && (
          <label className="mt-5 flex items-center gap-3 bg-stone-50 rounded-xl px-4 py-3 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={notify}
              onChange={(e) => onNotifyChange(e.target.checked)}
              className="h-4 w-4 accent-pink-600"
            />
            <span className="text-sm text-gray-700">
              <Mail className="inline h-4 w-4 mr-1 -mt-0.5 text-gray-400" />
              Prévenir le client par email
            </span>
          </label>
        )}

        {error && (
          <p className="mt-4 text-sm text-red-700 bg-red-50 border border-red-100 rounded-xl px-4 py-3" role="alert">{error}</p>
        )}

        <div className="mt-6 flex flex-col-reverse sm:flex-row sm:justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="px-5 py-3 rounded-xl text-sm font-medium text-gray-600 hover:bg-stone-100 transition-colors disabled:opacity-50"
          >
            Retour
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            autoFocus
            className={`px-5 py-3 rounded-xl text-sm font-semibold text-white flex items-center justify-center gap-2 transition-colors disabled:opacity-60 ${
              text.danger ? "bg-red-600 hover:bg-red-700" : "bg-gray-900 hover:bg-black"
            }`}
          >
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            {text.button}
          </button>
        </div>
      </div>
    </div>
  )
}

/** Boutons d'action sur la fiche commande. */
export default function StatusActions({ bookingId, currentStatus, customerName }: StatusActionsProps & { customerName?: string }) {
  const { request, dialog, loading } = useStatusChange(bookingId, customerName)
  const actions = STATUS_FLOW[currentStatus] || []

  if (actions.length === 0) return null

  return (
    <>
      <div className="flex flex-col sm:flex-row flex-wrap gap-3">
        {actions.map(action => {
          const Icon = action.icon
          return (
            <button
              key={action.next}
              onClick={() => request(action.next)}
              disabled={loading}
              className={`w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-3 rounded-xl font-medium text-sm transition-all duration-200 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed ${action.color}`}
            >
              <Icon className="w-4 h-4" />
              {action.label}
            </button>
          )
        })}
      </div>
      {dialog}
    </>
  )
}

/** Sélecteur de statut compact, en forme de badge, pour la liste des commandes. */
export function QuickStatusSelect({ bookingId, currentStatus, customerName }: StatusActionsProps & { customerName?: string }) {
  const { request, dialog, loading } = useStatusChange(bookingId, customerName)
  const cfg = getStatusConfig(currentStatus)

  return (
    <>
      <div className={`relative inline-flex items-center rounded-full ${cfg.badge}`}>
        <select
          value={currentStatus}
          disabled={loading}
          onChange={(e) => e.target.value !== currentStatus && request(e.target.value)}
          aria-label={`Changer le statut (actuel : ${cfg.label})`}
          className="appearance-none bg-transparent pl-2.5 pr-6 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-pink-300"
        >
          {BOOKING_STATUSES.map((s) => (
            <option key={s} value={s}>{getStatusConfig(s).label}</option>
          ))}
        </select>
        <ChevronDown className="pointer-events-none absolute right-1.5 h-3 w-3 opacity-70" />
      </div>
      {dialog}
    </>
  )
}
