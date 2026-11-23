"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ArrowRight, ArrowLeft, Check, Loader2, Flower2, X } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { Calendar } from "@/components/ui/calendar"
import { format } from "date-fns"
import { fr } from "date-fns/locale"

export interface ServiceOption {
  id: string
  name: string
  description: string | null
  price: number
  imageUrl: string | null
  badge: string | null
}

interface OrderFormProps {
  prestation: string
  prix: number
  image?: string
  services?: ServiceOption[]
}

interface Flavor {
  id: string
  name: string
}

const EVENT_TYPES = [
  "Mariage",
  "Anniversaire",
  "Baptême",
  "Baby Shower",
  "Fête / Soirée",
  "Entreprise",
  "Autre",
]

/**
 * Parse une date "YYYY-MM-DD" en heure locale (00:00:00) pour éviter le décalage UTC d'un jour.
 */
function parseLocalDate(dateStr: string): Date {
  const clean = dateStr.split("T")[0]
  return new Date(`${clean}T00:00:00`)
}

/**
 * Extrait le nombre maximum de parfums depuis la description d'une prestation (ex: "Jusqu'à 3 parfums").
 */
function extractMaxFlavors(description: string | null | undefined): number | null {
  if (!description) return null
  const match = description.match(/(\d+)\s*parfums?/i)
  return match ? parseInt(match[1], 10) : null
}

export default function OrderForm({ prestation, prix, image, services: initialServices }: OrderFormProps) {
  const [step, setStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [orderId, setOrderId] = useState("")
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Catalogue dynamique des prestations depuis la DB
  const [availableServices, setAvailableServices] = useState<ServiceOption[]>(initialServices || [])
  const [selectedServiceName, setSelectedServiceName] = useState<string>(prestation)
  const [selectedServicePrice, setSelectedServicePrice] = useState<number>(prix)
  const [selectedServiceImage, setSelectedServiceImage] = useState<string | null>(image || null)
  const [selectedServiceDesc, setSelectedServiceDesc] = useState<string | null>(null)
  const [maxFlavors, setMaxFlavors] = useState<number | null>(null)

  // Promo
  const [promoCodeInput, setPromoCodeInput] = useState("")
  const [promoError, setPromoError] = useState("")
  const [appliedPromo, setAppliedPromo] = useState<{ code: string; type: string; value: number } | null>(null)
  const [isCheckingPromo, setIsCheckingPromo] = useState(false)

  // Parfums & disponibilités depuis la DB
  const [availableFlavors, setAvailableFlavors] = useState<Flavor[]>([])
  const [selectedFlavors, setSelectedFlavors] = useState<string[]>([])
  const [blockedDates, setBlockedDates] = useState<string[]>([])
  const [minNoticeHours, setMinNoticeHours] = useState(48)

  // Synchroniser si les props parentes changent
  useEffect(() => {
    setSelectedServiceName(prestation)
    setSelectedServicePrice(prix)
    if (image) setSelectedServiceImage(image)
  }, [prestation, prix, image])

  useEffect(() => {
    // 1. Récupérer les paramètres globaux (MIN_NOTICE_HOURS / min_notice_hours)
    fetch("/api/settings")
      .then((res) => res.json())
      .then((data) => {
        const rawNotice = data?.MIN_NOTICE_HOURS ?? data?.min_notice_hours
        if (rawNotice) {
          const parsed = parseInt(String(rawNotice), 10)
          if (!Number.isNaN(parsed) && parsed >= 0) {
            setMinNoticeHours(parsed)
          }
        }
      })
      .catch(() => {})

    // 2. Récupérer les parfums actifs
    fetch("/api/flavors")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setAvailableFlavors(data)
      })
      .catch(() => {})

    // 3. Récupérer les dates bloquées
    fetch("/api/availabilities")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setBlockedDates(data)
      })
      .catch(() => {})

    // 4. Récupérer dynamiquement toutes les prestations actives de la DB
    fetch("/api/services")
      .then((res) => res.json())
      .then((data: ServiceOption[]) => {
        if (Array.isArray(data) && data.length > 0) {
          setAvailableServices(data)
          const matched = data.find((s) => s.name === prestation)
          if (matched) {
            setSelectedServicePrice(matched.price)
            setSelectedServiceDesc(matched.description)
            setMaxFlavors(extractMaxFlavors(matched.description))
            if (matched.imageUrl && !image) {
              setSelectedServiceImage(matched.imageUrl)
            }
          }
        }
      })
      .catch(() => {})
  }, [prestation, image])

  // Permet de changer de prestation dynamiquement parmi toutes celles de la DB
  const handleSelectService = (srv: ServiceOption) => {
    setSelectedServiceName(srv.name)
    setSelectedServicePrice(srv.price)
    setSelectedServiceImage(srv.imageUrl)
    setSelectedServiceDesc(srv.description)
    const newMax = extractMaxFlavors(srv.description)
    setMaxFlavors(newMax)
    if (newMax !== null && selectedFlavors.length > newMax) {
      setSelectedFlavors((prev) => prev.slice(0, newMax))
    }
  }

  const displayImage = selectedServiceImage

  // Form data
  const [form, setForm] = useState({
    quantity: 1,
    eventDate: "",
    eventType: "",
    flavors: "",
    allergies: "",
    message: "",
    notes: "",
    customerName: "",
    customerEmail: "",
    customerPhone: "",
  })

  const update = (field: string, value: string | number) => {
    setForm((prev) => ({ ...prev, [field]: value }))
    setErrors((prev) => ({ ...prev, [field]: "" }))
  }

  const total = selectedServicePrice * form.quantity

  // Validation Étape 1 (dynamique avec minNoticeHours + heure locale T00:00:00)
  const validateStep1 = () => {
    const errs: Record<string, string> = {}
    if (!selectedServiceName) {
      errs.prestation = "Veuillez sélectionner une prestation."
    }
    if (!form.eventDate) {
      errs.eventDate = "Veuillez choisir une date."
    } else {
      const chosen = parseLocalDate(form.eventDate)
      const minDate = new Date()
      minDate.setHours(minDate.getHours() + minNoticeHours)
      minDate.setHours(0, 0, 0, 0)

      if (Number.isNaN(chosen.getTime())) {
        errs.eventDate = "Date invalide."
      } else if (chosen < minDate) {
        const delayText =
          minNoticeHours >= 24 && minNoticeHours % 24 === 0
            ? `${minNoticeHours / 24} jour(s) (${minNoticeHours}h)`
            : `${minNoticeHours}h`
        errs.eventDate = `La date doit être réservée au moins ${delayText} à l'avance.`
      } else if (blockedDates.includes(form.eventDate)) {
        errs.eventDate = "Cette date est complète ou fermée, merci d'en choisir une autre."
      }
    }
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  // Validation Étape 2 : bloque si le tableau des parfums est vide et affiche l'erreur inline dans le DOM
  const validateStep2 = () => {
    const errs: Record<string, string> = {}
    if (selectedFlavors.length === 0 && form.flavors.trim() === "") {
      errs.flavors = "Veuillez sélectionner au moins un parfum pour composer votre bouquet."
    } else if (maxFlavors !== null && selectedFlavors.length > maxFlavors) {
      errs.flavors = `Vous pouvez choisir au maximum ${maxFlavors} parfum(s) pour ce bouquet.`
    }
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  // Validation Étape 3
  const validateStep3 = () => {
    const errs: Record<string, string> = {}
    if (!form.customerName || form.customerName.trim().length < 2) errs.customerName = "Nom requis"
    if (!form.customerEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.customerEmail)) errs.customerEmail = "Email invalide"
    if (!form.customerPhone || form.customerPhone.trim().length < 8) errs.customerPhone = "Numéro invalide"
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const nextStep = () => {
    if (step === 1 && !validateStep1()) return
    if (step === 2 && !validateStep2()) return
    setStep((s) => Math.min(s + 1, 3))
  }

  const prevStep = () => setStep((s) => Math.max(s - 1, 1))

  const handleSubmit = async () => {
    if (!validateStep3()) return
    setIsSubmitting(true)

    // La remise est recalculée côté serveur à partir du code promo
    const promoCodeName = appliedPromo?.code

    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prestationName: selectedServiceName,
          quantity: form.quantity,
          eventDate: form.eventDate,
          eventType: form.eventType || undefined,
          flavors: [...selectedFlavors, ...(form.flavors.trim() ? [form.flavors.trim()] : [])].join(", ") || undefined,
          allergies: form.allergies || undefined,
          message: form.message || undefined,
          notes: form.notes || undefined,
          customerName: form.customerName.trim(),
          customerEmail: form.customerEmail.trim(),
          customerPhone: form.customerPhone.trim(),
          promoCode: promoCodeName,
        }),
      })
      const data = await res.json()
      if (res.ok && data.success) {
        setOrderId(data.orderId)
        setIsSuccess(true)
      } else {
        setErrors({
          submit: data.error || "Une erreur est survenue lors de la validation. Veuillez vérifier vos informations.",
        })
      }
    } catch {
      setErrors({ submit: "Une erreur réseau est survenue. Veuillez réessayer." })
    } finally {
      setIsSubmitting(false)
    }
  }

  // ═══ CONFIRMATION SCREEN ═══
  if (isSuccess) {
    return (
      <div className="text-center py-16 px-6">
        <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-8">
          <Check className="w-10 h-10 text-green-600" />
        </div>
        <h2 className="text-3xl md:text-4xl font-serif text-gray-900 mb-4">
          Merci {form.customerName.split(" ")[0]} !
        </h2>
        <p className="text-lg text-gray-600 font-light mb-2 max-w-md mx-auto">
          Votre demande pour <strong className="text-pink-600">{selectedServiceName}</strong> a bien été enregistrée.
        </p>
        <p className="text-gray-500 font-light mb-10 max-w-md mx-auto">
          Vous recevrez votre devis personnalisé par email sous <strong>24 à 48 heures</strong>.
        </p>

        <div className="bg-stone-50 rounded-2xl p-6 max-w-sm mx-auto mb-10 border border-stone-100 text-left">
          <h3 className="font-serif text-gray-900 mb-4 text-center">Récapitulatif</h3>
          <div className="space-y-2 text-sm text-gray-600">
            <div className="flex justify-between">
              <span>Bouquet</span>
              <span className="font-medium text-gray-900">{selectedServiceName}</span>
            </div>
            <div className="flex justify-between">
              <span>Quantité</span>
              <span className="font-medium text-gray-900">{form.quantity}</span>
            </div>
            <div className="flex justify-between">
              <span>Date</span>
              <span className="font-medium text-gray-900">
                {form.eventDate
                  ? parseLocalDate(form.eventDate).toLocaleDateString("fr-FR", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })
                  : ""}
              </span>
            </div>
            <div className="flex justify-between border-t border-stone-200 pt-2 mt-2">
              <span className="font-medium">Prix indicatif</span>
              <span className="font-bold text-pink-600">
                {appliedPromo
                  ? (appliedPromo.type === "PERCENTAGE"
                      ? total * (1 - appliedPromo.value / 100)
                      : Math.max(0, total - appliedPromo.value)
                    ).toFixed(2)
                  : total}{" "}
                €
              </span>
            </div>
          </div>
        </div>

        <p className="text-xs text-gray-400 mb-6">Référence : {orderId}</p>

        <Button asChild className="bg-pink-500 hover:bg-pink-600 text-white rounded-full px-10 py-6">
          <Link href="/">Retour à l&apos;accueil</Link>
        </Button>
      </div>
    )
  }

  // ═══ STEPPER VISUAL ═══
  const steps = [
    { num: 1, label: "Prestation" },
    { num: 2, label: "Personnalisation" },
    { num: 3, label: "Coordonnées" },
  ]

  return (
    <div>
      {/* Stepper */}
      <div className="flex items-center justify-center mb-12">
        {steps.map((s, i) => (
          <div key={s.num} className="flex items-center">
            <div className="flex flex-col items-center">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-all duration-300 ${
                  step > s.num
                    ? "bg-pink-500 text-white"
                    : step === s.num
                      ? "bg-pink-500 text-white scale-110 shadow-lg shadow-pink-500/30"
                      : "bg-stone-100 text-stone-400"
                }`}
              >
                {step > s.num ? <Check className="w-4 h-4" /> : s.num}
              </div>
              <span
                className={`text-xs mt-2 hidden md:block transition-colors ${
                  step >= s.num ? "text-pink-600 font-medium" : "text-stone-400"
                }`}
              >
                {s.label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div
                className={`w-16 md:w-24 h-px mx-2 transition-colors duration-300 ${
                  step > s.num ? "bg-pink-400" : "bg-stone-200"
                }`}
              />
            )}
          </div>
        ))}
      </div>

      {/* ═══ STEP 1: PRESTATION ═══ */}
      {step === 1 && (
        <div className="space-y-8 animate-in fade-in duration-300">
          {/* Sélecteur dynamique de toutes les prestations de la DB (si plusieurs prestations actives) */}
          {availableServices.length > 1 && (
            <div className="space-y-3">
              <label className="text-sm font-medium text-gray-700 ml-1">Format du bouquet</label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {availableServices.map((srv) => {
                  const isCurrent = srv.name === selectedServiceName
                  return (
                    <button
                      key={srv.id}
                      type="button"
                      onClick={() => handleSelectService(srv)}
                      aria-pressed={isCurrent}
                      className={`text-left p-3.5 rounded-2xl border transition-all duration-200 ${
                        isCurrent
                          ? "bg-pink-50/70 border-pink-400 shadow-sm ring-1 ring-pink-300"
                          : "bg-white border-stone-100 hover:border-pink-200 hover:bg-pink-50/20"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <span className="font-serif text-sm sm:text-base text-gray-900 font-medium truncate">
                          {srv.name}
                        </span>
                        {srv.badge && (
                          <span className="text-[10px] font-bold uppercase tracking-wider bg-pink-500 text-white px-2 py-0.5 rounded-full flex-shrink-0">
                            {srv.badge}
                          </span>
                        )}
                      </div>
                      <p className="text-pink-600 font-serif text-base font-semibold">{srv.price} €</p>
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {/* Recap prestation sélectionnée */}
          <div className="relative overflow-hidden bg-white rounded-2xl border border-pink-100 p-4 sm:p-5 flex items-center gap-3 sm:gap-4 shadow-[0_2px_10px_-4px_rgba(236,72,153,0.1)]">
            <div className="absolute top-0 right-0 w-32 h-32 bg-pink-50/50 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none" />

            {displayImage ? (
              <div className="relative w-12 h-12 sm:w-16 sm:h-16 rounded-full overflow-hidden flex-shrink-0 border border-pink-100 z-10 shadow-sm bg-stone-50">
                <Image
                  src={displayImage}
                  alt={`Bouquet ${selectedServiceName}`}
                  fill
                  sizes="(max-width: 640px) 48px, 64px"
                  className="object-cover"
                />
              </div>
            ) : (
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-gradient-to-tr from-pink-50 to-white flex items-center justify-center flex-shrink-0 border border-pink-100 relative z-10 shadow-sm">
                <Flower2 className="w-5 h-5 sm:w-6 sm:h-6 text-pink-500" />
              </div>
            )}

            <div className="flex-1 relative z-10 min-w-0">
              <p className="text-[10px] sm:text-[11px] font-bold uppercase tracking-widest text-pink-600 mb-0.5">
                Votre sélection
              </p>
              <h3 className="font-serif text-base sm:text-xl text-gray-900 leading-tight truncate">
                {selectedServiceName}
              </h3>
              {selectedServiceDesc && (
                <p className="text-xs text-gray-500 font-light line-clamp-1 mt-0.5">{selectedServiceDesc}</p>
              )}
            </div>

            <div className="text-right relative z-10 pl-3 sm:pl-4 border-l border-pink-100 flex-shrink-0">
              <p className="text-[10px] sm:text-[11px] text-gray-400 uppercase tracking-widest mb-0.5">Tarif</p>
              <p className="text-pink-600 font-serif text-lg sm:text-2xl">{selectedServicePrice} €</p>
            </div>
          </div>

          {/* Quantity */}
          <div className="space-y-3">
            <label className="text-sm font-medium text-gray-700 ml-1">Quantité</label>
            <div className="flex flex-wrap items-center justify-between sm:justify-start gap-4 bg-white rounded-2xl p-2 pr-4 border border-stone-100 shadow-sm w-full sm:w-fit">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  aria-label="Diminuer la quantité"
                  onClick={() => update("quantity", Math.max(1, form.quantity - 1))}
                  className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-stone-50 flex items-center justify-center text-lg hover:bg-stone-100 transition-colors"
                >
                  −
                </button>
                <span className="text-xl sm:text-2xl font-serif text-gray-900 w-10 text-center">{form.quantity}</span>
                <button
                  type="button"
                  aria-label="Augmenter la quantité"
                  onClick={() => update("quantity", form.quantity + 1)}
                  className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-stone-50 flex items-center justify-center text-lg hover:bg-stone-100 transition-colors"
                >
                  +
                </button>
              </div>
              <span className="text-gray-500 font-light sm:ml-4 text-sm sm:text-base">
                Total : <strong className="text-pink-600">{total} €</strong>
              </span>
            </div>
          </div>

          {/* Event Date */}
          <div className="space-y-3">
            <label className="text-sm font-medium text-gray-700 ml-1">
              Date de l&apos;événement / retrait souhaitée *
            </label>
            <div className="bg-white rounded-2xl shadow-sm border border-stone-100 flex justify-center p-3 sm:p-4">
              <Calendar
                mode="single"
                selected={form.eventDate ? parseLocalDate(form.eventDate) : undefined}
                onSelect={(date) => update("eventDate", date ? format(date, "yyyy-MM-dd") : "")}
                disabled={(date) => {
                  const minDate = new Date()
                  minDate.setHours(minDate.getHours() + minNoticeHours)
                  minDate.setHours(0, 0, 0, 0)
                  if (date < minDate) return true

                  const dateStr = format(date, "yyyy-MM-dd")
                  return blockedDates.includes(dateStr)
                }}
                modifiers={{
                  blocked: (date) => {
                    const dateStr = format(date, "yyyy-MM-dd")
                    return blockedDates.includes(dateStr)
                  },
                }}
                modifiersClassNames={{
                  blocked: "!bg-red-50 !text-red-500 line-through decoration-red-400 font-bold !opacity-100",
                }}
                locale={fr}
                className="pointer-events-auto"
              />
            </div>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between text-xs mt-2 px-2 gap-3">
              <p className="text-gray-500">
                Commande{" "}
                {minNoticeHours >= 24 && minNoticeHours % 24 === 0
                  ? `${minNoticeHours / 24} jour(s)`
                  : `${minNoticeHours}h`}{" "}
                à l&apos;avance minimum.
              </p>
              <div className="flex items-center gap-2 bg-red-50 px-2 py-1 rounded-full">
                <span className="w-2.5 h-2.5 rounded-full bg-red-400 block" />
                <span className="text-red-600 font-medium">Complet / Indisponible</span>
              </div>
            </div>
            {errors.eventDate && <p className="text-sm text-red-500 ml-1 text-left">{errors.eventDate}</p>}
          </div>

          {/* Event Type */}
          <div className="space-y-3">
            <label className="text-sm font-medium text-gray-700 ml-1">Type d&apos;événement</label>
            <div className="flex flex-wrap gap-2">
              {EVENT_TYPES.map((type) => {
                const isSelected = form.eventType === type
                return (
                  <button
                    key={type}
                    type="button"
                    aria-pressed={isSelected}
                    onClick={() => update("eventType", isSelected ? "" : type)}
                    className={`px-3 py-2 sm:px-4 sm:py-2.5 rounded-full text-xs sm:text-sm transition-all duration-200 border ${
                      isSelected
                        ? "bg-pink-500 text-white border-pink-500 shadow-md shadow-pink-500/20"
                        : "bg-white border-stone-100 text-gray-600 hover:border-pink-200 hover:bg-pink-50"
                    }`}
                  >
                    {type}
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      )}

      {/* ═══ STEP 2: PERSONALISATION ═══ */}
      {step === 2 && (
        <div className="space-y-8 animate-in fade-in duration-300">
          <div className="space-y-3">
            <label className="text-sm font-medium text-gray-700 ml-1">
              Parfums souhaités *{" "}
              {maxFlavors && <span className="text-pink-600">({maxFlavors} maximum)</span>}
            </label>
            {availableFlavors.length > 0 ? (
              <div className="flex flex-wrap gap-2" role="group" aria-label="Choix des parfums">
                {availableFlavors.map((flavor) => {
                  const isSelected = selectedFlavors.includes(flavor.name)
                  const isLimitReached = !isSelected && maxFlavors !== null && selectedFlavors.length >= maxFlavors
                  return (
                    <button
                      key={flavor.id}
                      type="button"
                      aria-pressed={isSelected}
                      aria-label={`Parfum ${flavor.name}${isSelected ? " (sélectionné)" : ""}`}
                      onClick={() => {
                        if (isSelected) {
                          setErrors((prev) => ({ ...prev, flavors: "" }))
                          setSelectedFlavors((prev) => prev.filter((f) => f !== flavor.name))
                          return
                        }
                        if (maxFlavors !== null && selectedFlavors.length >= maxFlavors) {
                          setErrors((prev) => ({
                            ...prev,
                            flavors: `Vous pouvez choisir au maximum ${maxFlavors} parfum(s) pour ce bouquet.`,
                          }))
                          return
                        }
                        setErrors((prev) => ({ ...prev, flavors: "" }))
                        setSelectedFlavors((prev) => [...prev, flavor.name])
                      }}
                      className={`px-3 py-2 sm:px-4 sm:py-2.5 rounded-full text-xs sm:text-sm transition-all duration-200 border ${
                        isSelected
                          ? "bg-pink-600 text-white border-pink-600 shadow-md shadow-pink-600/20"
                          : isLimitReached
                            ? "bg-stone-50 border-stone-200 text-gray-400 hover:border-pink-200"
                            : "bg-white border-stone-100 text-gray-700 hover:border-pink-200 hover:bg-pink-50"
                      }`}
                    >
                      {flavor.name}
                    </button>
                  )
                })}
              </div>
            ) : (
              <p className="text-sm text-gray-500 italic">Chargement des parfums...</p>
            )}
            {selectedFlavors.length > 0 && (
              <p className="text-xs text-pink-700 font-medium ml-1">
                Sélection ({selectedFlavors.length}{maxFlavors ? `/${maxFlavors}` : ""}) : {selectedFlavors.join(", ")}
              </p>
            )}
            <Input
              aria-label="Autre parfum personnalisé"
              value={form.flavors}
              onChange={(e) => update("flavors", e.target.value)}
              placeholder="Autre parfum non listé ? Précisez ici..."
              className="bg-white/50 border-stone-200 focus:border-pink-300 focus:ring-pink-300 rounded-xl px-4 py-5 mt-2"
            />
            {errors.flavors && (
              <div
                role="alert"
                className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3 mt-2"
              >
                {errors.flavors}
              </div>
            )}
          </div>

          <div className="space-y-2">
            <label htmlFor="allergies" className="text-sm font-medium text-gray-700 ml-1">
              Allergies à signaler
              <span className="text-red-500 ml-1 text-xs">(important)</span>
            </label>
            <textarea
              id="allergies"
              value={form.allergies}
              onChange={(e) => update("allergies", e.target.value)}
              placeholder="Ex : Gluten, Lactose, Fruits à coque, Œufs..."
              className="w-full bg-white/50 border border-stone-200 focus:border-pink-300 focus:ring-pink-300 rounded-xl px-4 py-4 min-h-[80px] resize-none focus:outline-none focus:ring-2 text-sm"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="message" className="text-sm font-medium text-gray-700 ml-1">
              Message à écrire sur la création <span className="text-gray-400">(optionnel)</span>
            </label>
            <Input
              id="message"
              value={form.message}
              onChange={(e) => update("message", e.target.value)}
              placeholder={`Ex : "Joyeux anniversaire Sophie !"`}
              className="bg-white/50 border-stone-200 focus:border-pink-300 focus:ring-pink-300 rounded-xl px-4 py-6"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="notes" className="text-sm font-medium text-gray-700 ml-1">
              Notes supplémentaires <span className="text-gray-400">(optionnel)</span>
            </label>
            <textarea
              id="notes"
              value={form.notes}
              onChange={(e) => update("notes", e.target.value)}
              placeholder="Couleurs préférées, thème particulier, remarques..."
              className="w-full bg-white/50 border border-stone-200 focus:border-pink-300 focus:ring-pink-300 rounded-xl px-4 py-4 min-h-[80px] resize-none focus:outline-none focus:ring-2 text-sm"
            />
          </div>
        </div>
      )}

      {/* ═══ STEP 3: COORDONNÉES + RECAP ═══ */}
      {step === 3 && (
        <div className="space-y-8 animate-in fade-in duration-300">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2 space-y-2">
              <label htmlFor="customerName" className="text-sm font-medium text-gray-700 ml-1">
                Nom complet *
              </label>
              <Input
                id="customerName"
                value={form.customerName}
                onChange={(e) => update("customerName", e.target.value)}
                placeholder="Votre nom et prénom"
                className="bg-white/50 border-stone-200 focus:border-pink-300 focus:ring-pink-300 rounded-xl px-4 py-6"
              />
              {errors.customerName && <p className="text-sm text-red-500 ml-1">{errors.customerName}</p>}
            </div>
            <div className="space-y-2">
              <label htmlFor="customerEmail" className="text-sm font-medium text-gray-700 ml-1">
                Adresse email *
              </label>
              <Input
                id="customerEmail"
                type="email"
                value={form.customerEmail}
                onChange={(e) => update("customerEmail", e.target.value)}
                placeholder="vous@exemple.com"
                className="bg-white/50 border-stone-200 focus:border-pink-300 focus:ring-pink-300 rounded-xl px-4 py-6"
              />
              {errors.customerEmail && <p className="text-sm text-red-500 ml-1">{errors.customerEmail}</p>}
            </div>
            <div className="space-y-2">
              <label htmlFor="customerPhone" className="text-sm font-medium text-gray-700 ml-1">
                Téléphone *
              </label>
              <Input
                id="customerPhone"
                type="tel"
                value={form.customerPhone}
                onChange={(e) => update("customerPhone", e.target.value)}
                placeholder="06 12 34 56 78"
                className="bg-white/50 border-stone-200 focus:border-pink-300 focus:ring-pink-300 rounded-xl px-4 py-6"
              />
              {errors.customerPhone && <p className="text-sm text-red-500 ml-1">{errors.customerPhone}</p>}
            </div>
          </div>

          {/* Récapitulatif */}
          <div className="bg-stone-50 rounded-2xl p-6 border border-stone-100 mt-6">
            <h3 className="font-serif text-lg text-gray-900 mb-4 text-center">Récapitulatif de votre commande</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between items-center py-2 border-b border-stone-100">
                <span className="text-gray-500">Bouquet</span>
                <span className="font-medium text-gray-900">{selectedServiceName}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-stone-100">
                <span className="text-gray-500">Quantité</span>
                <span className="font-medium text-gray-900">{form.quantity}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-stone-100">
                <span className="text-gray-500">Date</span>
                <span className="font-medium text-gray-900">
                  {form.eventDate
                    ? format(parseLocalDate(form.eventDate), "d MMMM yyyy", { locale: fr })
                    : "Non sélectionnée"}
                </span>
              </div>
              {form.eventType && (
                <div className="flex justify-between items-center py-2 border-b border-stone-100">
                  <span className="text-gray-500">Événement</span>
                  <span className="font-medium text-gray-900">{form.eventType}</span>
                </div>
              )}

              {/* Section Promo */}
              <div className="py-4 border-b border-stone-100">
                {!appliedPromo ? (
                  <div className="flex flex-col sm:flex-row gap-3">
                    <Input
                      type="text"
                      aria-label="Code promotionnel"
                      placeholder="Avez-vous un code promo ?"
                      value={promoCodeInput}
                      onChange={(e) => {
                        setPromoCodeInput(e.target.value.toUpperCase())
                        setPromoError("")
                      }}
                      className="flex-1 bg-white border-stone-200 focus:border-pink-300 focus:ring-pink-300 rounded-xl px-4 h-12 uppercase tracking-wide placeholder:normal-case placeholder:tracking-normal text-sm"
                    />
                    <Button
                      type="button"
                      onClick={async () => {
                        if (!promoCodeInput) return
                        setIsCheckingPromo(true)
                        setPromoError("")
                        try {
                          const res = await fetch("/api/promo/check", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ code: promoCodeInput }),
                          })
                          const data = await res.json()
                          if (res.ok) {
                            setAppliedPromo(data)
                          } else {
                            setPromoError(data.error)
                          }
                        } catch {
                          setPromoError("Erreur lors de la vérification")
                        } finally {
                          setIsCheckingPromo(false)
                        }
                      }}
                      disabled={isCheckingPromo || !promoCodeInput}
                      className="h-12 px-6 rounded-xl bg-stone-900 hover:bg-stone-800 text-white font-medium transition-colors w-full sm:w-auto"
                    >
                      {isCheckingPromo ? <Loader2 className="w-4 h-4 animate-spin" /> : "Appliquer"}
                    </Button>
                  </div>
                ) : (
                  <div className="flex justify-between items-center bg-green-50/80 text-green-800 px-4 py-3.5 rounded-xl border border-green-200/60 shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
                    <span className="font-medium flex items-center gap-2.5 text-sm">
                      <div className="bg-green-500 rounded-full p-0.5 text-white shadow-sm">
                        <Check className="w-3.5 h-3.5" />
                      </div>
                      <span>
                        Code <strong className="font-bold tracking-wide">{appliedPromo.code}</strong> appliqué
                      </span>
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setAppliedPromo(null)
                        setPromoCodeInput("")
                      }}
                      className="text-green-700/60 hover:text-red-500 text-[10px] font-bold uppercase tracking-widest transition-colors flex items-center gap-1"
                    >
                      <X className="w-3 h-3" /> Retirer
                    </button>
                  </div>
                )}
                {promoError && <p className="text-xs text-red-500 mt-2 ml-1 font-medium">{promoError}</p>}
              </div>

              {(selectedFlavors.length > 0 || form.flavors) && (
                <div className="flex justify-between items-center py-2 border-b border-stone-100">
                  <span className="text-gray-500">Parfums</span>
                  <span className="font-medium text-gray-900 text-right max-w-[200px]">
                    {[...selectedFlavors, ...(form.flavors ? [form.flavors] : [])].join(", ")}
                  </span>
                </div>
              )}
              {form.allergies && (
                <div className="flex justify-between items-center py-2 border-b border-stone-100">
                  <span className="text-red-500">Allergies</span>
                  <span className="font-medium text-red-600 text-right max-w-[200px]">{form.allergies}</span>
                </div>
              )}
              <div className="flex justify-between items-center pt-4">
                <span className="text-gray-900 font-medium text-base">Prix indicatif</span>
                <div className="text-right">
                  {appliedPromo && (
                    <div className="text-sm text-gray-400 line-through mb-1">{total} €</div>
                  )}
                  <span className="text-2xl font-serif text-pink-600">
                    {appliedPromo
                      ? (appliedPromo.type === "PERCENTAGE"
                          ? total * (1 - appliedPromo.value / 100)
                          : Math.max(0, total - appliedPromo.value)
                        ).toFixed(2)
                      : total}{" "}
                    €
                  </span>
                </div>
              </div>
            </div>
          </div>

          <p className="text-xs text-gray-400 text-center">
            Le prix final vous sera communiqué dans votre devis personnalisé. Le règlement s&apos;effectue en espèces lors du retrait.
          </p>

          {errors.submit && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-600 text-center">
              {errors.submit}
            </div>
          )}
        </div>
      )}

      {/* ═══ NAVIGATION ═══ */}
      <div className="flex flex-col-reverse sm:flex-row justify-between items-stretch sm:items-center mt-12 pt-8 border-t border-stone-100 gap-4 sm:gap-0">
        {step > 1 ? (
          <button
            type="button"
            onClick={prevStep}
            className="flex items-center justify-center gap-2 text-gray-500 hover:text-gray-700 transition-colors text-sm font-medium py-3 sm:py-0 w-full sm:w-auto"
          >
            <ArrowLeft className="w-4 h-4" /> Retour
          </button>
        ) : (
          <div className="hidden sm:block" />
        )}

        {step < 3 ? (
          <Button
            type="button"
            onClick={nextStep}
            className="bg-pink-500 hover:bg-pink-600 text-white rounded-full px-8 py-6 text-sm tracking-wide shadow-lg shadow-pink-500/20 transition-all sm:hover:-translate-y-0.5 w-full sm:w-auto"
          >
            Continuer <ArrowRight className="ml-2 w-4 h-4" />
          </Button>
        ) : (
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="bg-pink-500 hover:bg-pink-600 text-white rounded-full px-8 py-6 text-sm tracking-wide shadow-lg shadow-pink-500/20 transition-all sm:hover:-translate-y-0.5 w-full sm:w-auto disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 w-4 h-4 animate-spin" /> Envoi en cours...
              </>
            ) : (
              <>
                Envoyer ma demande <ArrowRight className="ml-2 w-4 h-4" />
              </>
            )}
          </Button>
        )}
      </div>
    </div>
  )
}
