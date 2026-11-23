"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Bell, BellRing, ShoppingBag, X } from "lucide-react"

const POLL_INTERVAL_MS = 30_000
const TOAST_DURATION_MS = 20_000
const LAST_SEEN_KEY = "fg_admin_last_seen_order"

type LatestOrder = {
  id: string
  customerName: string
  prestationName: string
  quantity: number
  createdAt: string
}

type Toast = LatestOrder & { toastId: string }

/** Petit "ding-dong" généré avec Web Audio (aucun fichier son nécessaire). */
function playChime(ctxRef: React.MutableRefObject<AudioContext | null>) {
  try {
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
    if (!AudioCtx) return
    const ctx = ctxRef.current ?? new AudioCtx()
    ctxRef.current = ctx
    if (ctx.state === "suspended") ctx.resume().catch(() => {})

    const notes = [880, 1318.5] // La5 puis Mi6
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      const start = ctx.currentTime + i * 0.18
      osc.type = "sine"
      osc.frequency.value = freq
      gain.gain.setValueAtTime(0.0001, start)
      gain.gain.exponentialRampToValueAtTime(0.25, start + 0.02)
      gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.6)
      osc.connect(gain).connect(ctx.destination)
      osc.start(start)
      osc.stop(start + 0.65)
    })
  } catch {
    // Le navigateur peut bloquer le son tant que l'utilisateur n'a pas interagi avec la page
  }
}

/**
 * Surveille l'arrivée de nouvelles commandes (polling toutes les 30 s).
 * - compteur des commandes en attente (badge)
 * - toast dans le coin de l'écran + son
 * - notification système du navigateur (si autorisée)
 * - compteur dans le titre de l'onglet
 */
export function useNewOrders() {
  const router = useRouter()
  const pathname = usePathname()
  const [pendingCount, setPendingCount] = useState(0)
  const [toasts, setToasts] = useState<Toast[]>([])
  const [permission, setPermission] = useState<NotificationPermission | "unsupported">("unsupported")
  const audioCtxRef = useRef<AudioContext | null>(null)
  const pathnameRef = useRef(pathname)
  useEffect(() => {
    pathnameRef.current = pathname
  }, [pathname])

  const dismissToast = useCallback((toastId: string) => {
    setToasts((prev) => prev.filter((t) => t.toastId !== toastId))
  }, [])

  const notify = useCallback(
    (orders: LatestOrder[]) => {
      playChime(audioCtxRef)

      const newToasts = orders.map((o) => ({ ...o, toastId: `${o.id}-${Date.now()}` }))
      setToasts((prev) => [...newToasts, ...prev].slice(0, 4))
      newToasts.forEach((t) => setTimeout(() => dismissToast(t.toastId), TOAST_DURATION_MS))

      if ("Notification" in window && Notification.permission === "granted") {
        orders.forEach((o) => {
          const n = new Notification("🌸 Nouvelle commande !", {
            body: `${o.customerName} — ${o.prestationName}${o.quantity > 1 ? ` (x${o.quantity})` : ""}`,
            tag: `order-${o.id}`,
          })
          n.onclick = () => {
            window.focus()
            router.push(`/admin/commandes/${o.id}`)
            n.close()
          }
        })
      }

      // Rafraîchit les listes si on est sur le tableau de bord ou les commandes
      const p = pathnameRef.current
      if (p === "/admin" || p.startsWith("/admin/commandes")) router.refresh()
    },
    [dismissToast, router]
  )

  const check = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/new-orders", { cache: "no-store" })
      if (!res.ok) return
      const data: { pendingCount: number; latest: LatestOrder[] } = await res.json()
      setPendingCount(data.pendingCount)

      const newest = data.latest[0]
      if (!newest) return

      const lastSeen = localStorage.getItem(LAST_SEEN_KEY)
      localStorage.setItem(LAST_SEEN_KEY, newest.createdAt)

      // Première visite : on mémorise sans notifier
      if (!lastSeen) return

      const fresh = data.latest.filter((o) => new Date(o.createdAt) > new Date(lastSeen))
      if (fresh.length > 0) notify(fresh)
    } catch {
      // Erreur réseau ponctuelle : on réessaiera au prochain cycle
    }
  }, [notify])

  // Polling + vérification au retour sur l'onglet
  useEffect(() => {
    if ("Notification" in window) setPermission(Notification.permission)
    check()
    const interval = setInterval(check, POLL_INTERVAL_MS)
    const onFocus = () => check()
    window.addEventListener("focus", onFocus)
    return () => {
      clearInterval(interval)
      window.removeEventListener("focus", onFocus)
    }
  }, [check])

  // Compteur dans le titre de l'onglet
  useEffect(() => {
    const base = document.title.replace(/^\(\d+\)\s*/, "")
    document.title = pendingCount > 0 ? `(${pendingCount}) ${base}` : base
  }, [pendingCount, pathname])

  const requestPermission = useCallback(async () => {
    if (!("Notification" in window)) return
    const result = await Notification.requestPermission()
    setPermission(result)
    if (result === "granted") playChime(audioCtxRef) // test + débloque le son
  }, [])

  return { pendingCount, toasts, dismissToast, permission, requestPermission }
}

/** Bouton pour activer les notifications système du navigateur. */
export function NotificationToggle({
  permission,
  onRequest,
}: {
  permission: NotificationPermission | "unsupported"
  onRequest: () => void
}) {
  if (permission === "unsupported") return null

  if (permission === "granted") {
    return (
      <span title="Notifications activées" className="ml-auto text-pink-500">
        <BellRing className="h-5 w-5" />
      </span>
    )
  }

  return (
    <button
      type="button"
      onClick={onRequest}
      disabled={permission === "denied"}
      title={
        permission === "denied"
          ? "Notifications bloquées : autorisez-les dans les réglages du navigateur"
          : "Activer les notifications de nouvelles commandes"
      }
      className="ml-auto p-1.5 rounded-lg text-gray-400 hover:text-pink-600 hover:bg-pink-50 disabled:opacity-40 disabled:hover:bg-transparent transition-colors"
    >
      <Bell className="h-5 w-5" />
    </button>
  )
}

/** Pile de toasts "Nouvelle commande" en bas à droite. */
export function NewOrderToasts({ toasts, onDismiss }: { toasts: Toast[]; onDismiss: (id: string) => void }) {
  if (toasts.length === 0) return null

  return (
    <div className="fixed bottom-4 right-4 z-[60] flex flex-col gap-3 w-[calc(100%-2rem)] max-w-sm" aria-live="polite" role="status">
      {toasts.map((t) => (
        <div
          key={t.toastId}
          className="bg-white border border-pink-200 shadow-xl rounded-2xl p-4 flex gap-3 animate-in slide-in-from-right-8 fade-in duration-300"
        >
          <div className="h-10 w-10 shrink-0 rounded-full bg-pink-100 text-pink-600 flex items-center justify-center">
            <ShoppingBag className="h-5 w-5" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-gray-900">🌸 Nouvelle commande !</p>
            <p className="text-sm text-gray-600 truncate">
              {t.customerName} — {t.prestationName}
              {t.quantity > 1 ? ` (x${t.quantity})` : ""}
            </p>
            <Link
              href={`/admin/commandes/${t.id}`}
              onClick={() => onDismiss(t.toastId)}
              className="inline-block mt-2 text-sm font-medium text-pink-600 hover:text-pink-700"
            >
              Voir la commande →
            </Link>
          </div>
          <button
            type="button"
            onClick={() => onDismiss(t.toastId)}
            aria-label="Fermer la notification"
            className="self-start p-1 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ))}
    </div>
  )
}
