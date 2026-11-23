/** Configuration unique des statuts de commande (libellés + couleurs). */
export const BOOKING_STATUSES = ["PENDING", "DEVIS_SENT", "CONFIRMED", "CANCELLED"] as const
export type BookingStatus = (typeof BOOKING_STATUSES)[number]

export const STATUS_CONFIG: Record<BookingStatus, { label: string; badge: string; dot: string }> = {
  PENDING:    { label: "En attente",   badge: "bg-orange-100 text-orange-700", dot: "bg-orange-400" },
  DEVIS_SENT: { label: "Devis envoyé", badge: "bg-blue-100 text-blue-700",     dot: "bg-blue-400" },
  CONFIRMED:  { label: "Confirmé",     badge: "bg-green-100 text-green-700",   dot: "bg-green-500" },
  CANCELLED:  { label: "Annulé",       badge: "bg-red-100 text-red-700",       dot: "bg-red-400" },
}

export function getStatusConfig(status: string) {
  return STATUS_CONFIG[status as BookingStatus] ?? STATUS_CONFIG.PENDING
}

/** Statuts pour lesquels un email est envoyé au client lors du changement. */
export const STATUSES_WITH_EMAIL: BookingStatus[] = ["DEVIS_SENT", "CONFIRMED"]
