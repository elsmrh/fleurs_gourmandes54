"use client"

import { useSearchParams } from "next/navigation"
import { Suspense, useState, useEffect } from "react"
import OrderForm, { ServiceOption } from "@/components/OrderForm"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

function OrderContent() {
  const searchParams = useSearchParams()
  const serviceId = searchParams.get("serviceId") || ""
  const [services, setServices] = useState<ServiceOption[]>([])
  const [service, setService] = useState<ServiceOption | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    let cancelled = false
    async function loadCatalog() {
      try {
        const res = await fetch("/api/services")
        if (!res.ok) throw new Error("failed to load services")
        const allServices: ServiceOption[] = await res.json()
        if (cancelled) return

        setServices(allServices)

        if (serviceId) {
          const found = allServices.find((s) => s.id === serviceId)
          if (found) {
            setService(found)
            setLoading(false)
            return
          }
          // Fallback : tenter de récupérer la prestation directement par son ID
          const singleRes = await fetch(`/api/services/${serviceId}`)
          if (singleRes.ok) {
            const singleData: ServiceOption = await singleRes.json()
            if (!cancelled) {
              setService(singleData)
              setLoading(false)
            }
            return
          }
        } else if (allServices.length > 0) {
          // Si aucun serviceId n'est passé dans l'URL, présélectionner la 1ère prestation active de la DB
          setService(allServices[0])
          setLoading(false)
          return
        }

        if (!cancelled) {
          setError(true)
          setLoading(false)
        }
      } catch {
        if (!cancelled) {
          setError(true)
          setLoading(false)
        }
      }
    }

    loadCatalog()
    return () => {
      cancelled = true
    }
  }, [serviceId])

  if (loading) return <div className="text-center py-20 text-gray-400">Chargement...</div>
  if (error || !service) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-serif text-gray-900 mb-4">Aucune prestation disponible</h2>
        <p className="text-gray-500 font-light mb-8">Veuillez d&apos;abord choisir un bouquet dans notre carte.</p>
        <Link
          href="/prestations"
          className="inline-flex items-center gap-2 bg-pink-500 text-white rounded-full px-8 py-3 hover:bg-pink-600 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Voir la carte
        </Link>
      </div>
    )
  }

  return (
    <OrderForm
      prestation={service.name}
      prix={service.price}
      image={service.imageUrl || ""}
      services={services}
    />
  )
}

export default function CommanderPage() {
  return (
    <div className="min-h-screen pt-24 bg-[#FDFBF9] relative overflow-hidden selection:bg-pink-200">
      {/* Background decorations */}
      <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-pink-100/40 rounded-full blur-[100px] opacity-70 -translate-y-1/4 translate-x-1/4 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-rose-100/30 rounded-full blur-[100px] opacity-60 translate-y-1/4 -translate-x-1/4 pointer-events-none" />

      <div className="container mx-auto px-4 max-w-2xl relative z-10 pb-32">
        {/* Header */}
        <div className="text-center mb-12 pt-12">
          <Link
            href="/prestations"
            className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-pink-600 transition-colors mb-8"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Retour à la carte
          </Link>
          <span className="text-pink-600 uppercase tracking-[0.4em] text-xs font-bold block mb-6">
            Commander
          </span>
          <h1 className="text-4xl md:text-5xl font-serif text-gray-900 mb-4">Votre Commande</h1>
          <div className="w-px h-16 bg-gradient-to-b from-pink-300 to-transparent mx-auto" />
        </div>

        {/* Form container */}
        <div className="bg-white/80 backdrop-blur-md rounded-[2rem] shadow-xl border border-white/50 p-6 md:p-10">
          <Suspense fallback={<div className="text-center py-20 text-gray-400">Chargement...</div>}>
            <OrderContent />
          </Suspense>
        </div>
      </div>
    </div>
  )
}
