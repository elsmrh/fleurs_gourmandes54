/**
 * Convertit un numéro saisi par le client ("06 12 34 56 78", "+33 6...", "0033 6...")
 * au format international attendu par WhatsApp ("33612345678").
 * Renvoie null si le numéro est inexploitable.
 */
export function toWhatsAppNumber(phone: string): string | null {
  let digits = phone.replace(/[^\d+]/g, "")
  if (digits.startsWith("+")) digits = digits.slice(1)
  else if (digits.startsWith("00")) digits = digits.slice(2)
  else if (digits.startsWith("0")) digits = "33" + digits.slice(1) // numéro français
  digits = digits.replace(/\D/g, "")
  return digits.length >= 10 && digits.length <= 15 ? digits : null
}

/** Lien WhatsApp avec message pré-rempli, ou null si le numéro est invalide. */
export function whatsAppLink(phone: string, message: string): string | null {
  const number = toWhatsAppNumber(phone)
  if (!number) return null
  return `https://wa.me/${number}?text=${encodeURIComponent(message)}`
}

/** Message d'accroche par défaut pour une commande. */
export function orderWhatsAppMessage(customerName: string, prestationName: string, eventDate: Date) {
  const firstName = customerName.trim().split(/\s+/)[0] || ""
  const date = eventDate.toLocaleDateString("fr-FR", { day: "numeric", month: "long" })
  return `Bonjour ${firstName}, c'est Fleurs Gourmandes 54 🌸 Je reviens vers vous concernant votre commande « ${prestationName} » pour le ${date}.`
}

