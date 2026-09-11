"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ArrowRight, ArrowLeft, Check, Loader2, Flower2 } from "lucide-react"
import Link from "next/link"

interface OrderFormProps {
  prestation: string
  prix: number
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

export default function OrderForm({ prestation, prix }: OrderFormProps) {
  const [step, setStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [orderId, setOrderId] = useState("")
  const [errors, setErrors] = useState<Record<string, string>>({})
  
  // Flavors from DB
  const [availableFlavors, setAvailableFlavors] = useState<Flavor[]>([])
  const [selectedFlavors, setSelectedFlavors] = useState<string[]>([])
  
  useEffect(() => {
    fetch("/api/flavors")
      .then(res => res.json())
      .then(data => setAvailableFlavors(data))
      .catch(() => {})
  }, [])

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
    setForm(prev => ({ ...prev, [field]: value }))
    setErrors(prev => ({ ...prev, [field]: "" }))
  }

  const total = prix * form.quantity

  // Validation
  const validateStep1 = () => {
    const errs: Record<string, string> = {}
    if (!form.eventDate) errs.eventDate = "Veuillez choisir une date"
    // Check date is at least 48h in the future
    if (form.eventDate) {
      const chosen = new Date(form.eventDate)
      const minDate = new Date()
      minDate.setHours(minDate.getHours() + 48)
      if (chosen < minDate) errs.eventDate = "La date doit être au moins 48h à l'avance"
    }
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const validateStep3 = () => {
    const errs: Record<string, string> = {}
    if (!form.customerName || form.customerName.length < 2) errs.customerName = "Nom requis"
    if (!form.customerEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.customerEmail)) errs.customerEmail = "Email invalide"
    if (!form.customerPhone || form.customerPhone.length < 8) errs.customerPhone = "Numéro invalide"
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const nextStep = () => {
    if (step === 1 && !validateStep1()) return
    setStep(s => Math.min(s + 1, 3))
  }

  const prevStep = () => setStep(s => Math.max(s - 1, 1))

  const handleSubmit = async () => {
    if (!validateStep3()) return
    setIsSubmitting(true)
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prestationName: prestation,
          prestationPrice: prix,
          quantity: form.quantity,
          eventDate: form.eventDate,
          eventType: form.eventType || undefined,
          flavors: [...selectedFlavors, ...(form.flavors ? [form.flavors] : [])].join(", ") || undefined,
          allergies: form.allergies || undefined,
          message: form.message || undefined,
          notes: form.notes || undefined,
          customerName: form.customerName,
          customerEmail: form.customerEmail,
          customerPhone: form.customerPhone,
        }),
      })
      const data = await res.json()
      if (data.success) {
        setOrderId(data.orderId)
        setIsSuccess(true)
      } else {
        setErrors({ submit: "Une erreur est survenue. Veuillez réessayer." })
      }
    } catch {
      setErrors({ submit: "Une erreur est survenue. Veuillez réessayer." })
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
          Votre demande pour <strong className="text-pink-600">{prestation}</strong> a bien été enregistrée.
        </p>
        <p className="text-gray-500 font-light mb-10 max-w-md mx-auto">
          Vous recevrez votre devis personnalisé par email sous <strong>24 à 48 heures</strong>.
        </p>
        
        <div className="bg-stone-50 rounded-2xl p-6 max-w-sm mx-auto mb-10 border border-stone-100 text-left">
          <h3 className="font-serif text-gray-900 mb-4 text-center">Récapitulatif</h3>
          <div className="space-y-2 text-sm text-gray-600">
            <div className="flex justify-between"><span>Bouquet</span><span className="font-medium text-gray-900">{prestation}</span></div>
            <div className="flex justify-between"><span>Quantité</span><span className="font-medium text-gray-900">{form.quantity}</span></div>
            <div className="flex justify-between"><span>Date</span><span className="font-medium text-gray-900">{new Date(form.eventDate).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}</span></div>
            <div className="flex justify-between border-t border-stone-200 pt-2 mt-2"><span className="font-medium">Prix indicatif</span><span className="font-bold text-pink-600">{total} €</span></div>
          </div>
        </div>

        <p className="text-xs text-gray-400 mb-6">Référence : {orderId}</p>
        
        <Button asChild className="bg-pink-500 hover:bg-pink-600 text-white rounded-full px-10 py-6">
          <Link href="/">Retour à l'accueil</Link>
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
              <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-all duration-300 ${
                step > s.num ? "bg-pink-500 text-white" :
                step === s.num ? "bg-pink-500 text-white scale-110 shadow-lg shadow-pink-500/30" :
                "bg-stone-100 text-stone-400"
              }`}>
                {step > s.num ? <Check className="w-4 h-4" /> : s.num}
              </div>
              <span className={`text-xs mt-2 hidden md:block transition-colors ${
                step >= s.num ? "text-pink-600 font-medium" : "text-stone-400"
              }`}>{s.label}</span>
            </div>
            {i < steps.length - 1 && (
              <div className={`w-16 md:w-24 h-px mx-2 transition-colors duration-300 ${
                step > s.num ? "bg-pink-400" : "bg-stone-200"
              }`} />
            )}
          </div>
        ))}
      </div>

      {/* ═══ STEP 1: PRESTATION ═══ */}
      {step === 1 && (
        <div className="space-y-8 animate-in fade-in duration-300">
          {/* Recap prestation */}
          <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-pink-100 flex flex-col sm:flex-row items-center gap-6">
            <div className="w-16 h-16 rounded-full bg-pink-50 flex items-center justify-center flex-shrink-0">
              <Flower2 className="w-8 h-8 text-pink-400" />
            </div>
            <div className="text-center sm:text-left flex-1">
              <h3 className="font-serif text-xl text-gray-900">{prestation}</h3>
              <p className="text-pink-600 font-serif text-2xl mt-1">{prix} €</p>
            </div>
          </div>

          {/* Quantity */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 ml-1">Quantité</label>
            <div className="flex items-center gap-4">
              <button 
                type="button"
                onClick={() => update("quantity", Math.max(1, form.quantity - 1))}
                className="w-12 h-12 rounded-xl border border-stone-200 flex items-center justify-center text-lg hover:bg-stone-50 transition-colors"
              >−</button>
              <span className="text-2xl font-serif text-gray-900 w-12 text-center">{form.quantity}</span>
              <button 
                type="button"
                onClick={() => update("quantity", form.quantity + 1)}
                className="w-12 h-12 rounded-xl border border-stone-200 flex items-center justify-center text-lg hover:bg-stone-50 transition-colors"
              >+</button>
              <span className="text-gray-500 font-light ml-2">Total : <strong className="text-pink-600">{total} €</strong></span>
            </div>
          </div>

          {/* Event Date */}
          <div className="space-y-2">
            <label htmlFor="eventDate" className="text-sm font-medium text-gray-700 ml-1">Date de l'événement / retrait souhaitée *</label>
            <Input
              id="eventDate"
              type="date"
              value={form.eventDate}
              onChange={(e) => update("eventDate", e.target.value)}
              min={new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString().split('T')[0]}
              className="bg-white/50 border-stone-200 focus:border-pink-300 focus:ring-pink-300 rounded-xl px-4 py-6"
            />
            {errors.eventDate && <p className="text-sm text-red-500 ml-1">{errors.eventDate}</p>}
            <p className="text-xs text-gray-400 ml-1">Commande 48h à l'avance minimum.</p>
          </div>

          {/* Event Type */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 ml-1">Type d'événement</label>
            <div className="flex flex-wrap gap-2">
              {EVENT_TYPES.map(type => (
                <button
                  key={type}
                  type="button"
                  onClick={() => update("eventType", form.eventType === type ? "" : type)}
                  className={`px-4 py-2.5 rounded-full text-sm transition-all duration-200 border ${
                    form.eventType === type 
                      ? "bg-pink-500 text-white border-pink-500 shadow-md" 
                      : "bg-white border-stone-200 text-gray-600 hover:border-pink-200 hover:bg-pink-50"
                  }`}
                >{type}</button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ═══ STEP 2: PERSONALISATION ═══ */}
      {step === 2 && (
        <div className="space-y-8 animate-in fade-in duration-300">
          <div className="space-y-3">
            <label className="text-sm font-medium text-gray-700 ml-1">Parfums souhaités</label>
            {availableFlavors.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {availableFlavors.map(flavor => (
                  <button
                    key={flavor.id}
                    type="button"
                    onClick={() => {
                      setSelectedFlavors(prev => 
                        prev.includes(flavor.name)
                          ? prev.filter(f => f !== flavor.name)
                          : [...prev, flavor.name]
                      )
                    }}
                    className={`px-4 py-2.5 rounded-full text-sm transition-all duration-200 border ${
                      selectedFlavors.includes(flavor.name)
                        ? "bg-pink-500 text-white border-pink-500 shadow-md"
                        : "bg-white border-stone-200 text-gray-600 hover:border-pink-200 hover:bg-pink-50"
                    }`}
                  >{flavor.name}</button>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-400 italic">Chargement des parfums...</p>
            )}
            {selectedFlavors.length > 0 && (
              <p className="text-xs text-pink-600 ml-1">
                Sélection : {selectedFlavors.join(", ")}
              </p>
            )}
            <Input
              value={form.flavors}
              onChange={(e) => update("flavors", e.target.value)}
              placeholder="Autre parfum non listé ? Précisez ici..."
              className="bg-white/50 border-stone-200 focus:border-pink-300 focus:ring-pink-300 rounded-xl px-4 py-5 mt-2"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="allergies" className="text-sm font-medium text-gray-700 ml-1">
              Allergies à signaler
              <span className="text-red-400 ml-1 text-xs">(important)</span>
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
            <label htmlFor="message" className="text-sm font-medium text-gray-700 ml-1">Message à écrire sur la création <span className="text-gray-400">(optionnel)</span></label>
            <Input
              id="message"
              value={form.message}
              onChange={(e) => update("message", e.target.value)}
              placeholder={`Ex : "Joyeux anniversaire Sophie !"`}
              className="bg-white/50 border-stone-200 focus:border-pink-300 focus:ring-pink-300 rounded-xl px-4 py-6"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="notes" className="text-sm font-medium text-gray-700 ml-1">Notes supplémentaires <span className="text-gray-400">(optionnel)</span></label>
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
              <label htmlFor="customerName" className="text-sm font-medium text-gray-700 ml-1">Nom complet *</label>
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
              <label htmlFor="customerEmail" className="text-sm font-medium text-gray-700 ml-1">Adresse email *</label>
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
              <label htmlFor="customerPhone" className="text-sm font-medium text-gray-700 ml-1">Téléphone *</label>
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
                <span className="font-medium text-gray-900">{prestation}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-stone-100">
                <span className="text-gray-500">Quantité</span>
                <span className="font-medium text-gray-900">{form.quantity}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-stone-100">
                <span className="text-gray-500">Date souhaitée</span>
                <span className="font-medium text-gray-900">{form.eventDate ? new Date(form.eventDate).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }) : "—"}</span>
              </div>
              {form.eventType && (
                <div className="flex justify-between items-center py-2 border-b border-stone-100">
                  <span className="text-gray-500">Événement</span>
                  <span className="font-medium text-gray-900">{form.eventType}</span>
                </div>
              )}
              {(selectedFlavors.length > 0 || form.flavors) && (
                <div className="flex justify-between items-center py-2 border-b border-stone-100">
                  <span className="text-gray-500">Parfums</span>
                  <span className="font-medium text-gray-900 text-right max-w-[200px]">{[...selectedFlavors, ...(form.flavors ? [form.flavors] : [])].join(", ")}</span>
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
                <span className="text-2xl font-serif text-pink-600">{total} €</span>
              </div>
            </div>
          </div>

          <p className="text-xs text-gray-400 text-center">
            Le prix final vous sera communiqué dans votre devis personnalisé. Le règlement s'effectue en espèces lors du retrait.
          </p>

          {errors.submit && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-600 text-center">
              {errors.submit}
            </div>
          )}
        </div>
      )}

      {/* ═══ NAVIGATION ═══ */}
      <div className="flex justify-between items-center mt-12 pt-8 border-t border-stone-100">
        {step > 1 ? (
          <button
            type="button"
            onClick={prevStep}
            className="flex items-center gap-2 text-gray-500 hover:text-gray-700 transition-colors text-sm font-medium"
          >
            <ArrowLeft className="w-4 h-4" /> Retour
          </button>
        ) : (
          <div />
        )}

        {step < 3 ? (
          <Button
            type="button"
            onClick={nextStep}
            className="bg-pink-500 hover:bg-pink-600 text-white rounded-full px-8 py-6 text-sm tracking-wide shadow-lg shadow-pink-500/20 transition-all hover:-translate-y-0.5"
          >
            Continuer <ArrowRight className="ml-2 w-4 h-4" />
          </Button>
        ) : (
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="bg-pink-500 hover:bg-pink-600 text-white rounded-full px-8 py-6 text-sm tracking-wide shadow-lg shadow-pink-500/20 transition-all hover:-translate-y-0.5 disabled:opacity-50"
          >
            {isSubmitting ? (
              <><Loader2 className="mr-2 w-4 h-4 animate-spin" /> Envoi en cours...</>
            ) : (
              <>Envoyer ma demande <ArrowRight className="ml-2 w-4 h-4" /></>
            )}
          </Button>
        )}
      </div>
    </div>
  )
}

