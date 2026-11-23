"use client"

import { useRouter, useSearchParams, usePathname } from "next/navigation"
import { Search, CalendarDays, Loader2, ChevronLeft, ChevronRight } from "lucide-react"
import { useState, useEffect, useTransition } from "react"

/** Date locale → "YYYY-MM-DD" (sans passer par l'UTC, qui décalait d'un jour). */
function formatYMD(d: Date) {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

/** "YYYY-MM-DD" → Date locale à minuit. */
function parseLocalDay(value: string) {
  const [y, m, d] = value.split("-").map(Number)
  return new Date(y, (m || 1) - 1, d || 1)
}

export default function OrderFilters({ 
  initialDateStart = "", 
  initialDateEnd = "" 
}: { 
  initialDateStart?: string; 
  initialDateEnd?: string 
} = {}) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()
  
  const currentQ = searchParams.get("q") || ""
  const currentSort = searchParams.get("sort") || "created_desc"
  const currentDateStart = searchParams.has("dateStart") ? searchParams.get("dateStart") || "" : initialDateStart
  const currentDateEnd = searchParams.has("dateEnd") ? searchParams.get("dateEnd") || "" : initialDateEnd
  
  const [search, setSearch] = useState(currentQ)
  
  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => {
      if (search !== currentQ) {
        updateFilters({ q: search })
      }
    }, 400)
    return () => clearTimeout(t)
  }, [search])
  
  const updateFilters = (updates: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams.toString())
    params.delete("page") // Reset page when filters change
    
    Object.entries(updates).forEach(([k, v]) => {
      if (v) params.set(k, v)
      else params.delete(k)
    })
    
    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`)
    })
  }

  const handleShiftMonth = (offset: number) => {
    const baseDate = currentDateStart ? parseLocalDay(currentDateStart) : new Date()
    const newDate = new Date(baseDate.getFullYear(), baseDate.getMonth() + offset, 1)
    const lastDay = new Date(newDate.getFullYear(), newDate.getMonth() + 1, 0)

    updateFilters({
      dateStart: formatYMD(newDate),
      dateEnd: formatYMD(lastDay)
    })
  }

  const hasDateFilter = Boolean(currentDateStart || currentDateEnd)
  
  let displayMonth = ""
  const dStart = currentDateStart ? parseLocalDay(currentDateStart) : new Date()
  const dEnd = currentDateEnd ? parseLocalDay(currentDateEnd) : new Date()
  
  if (!hasDateFilter) {
    displayMonth = "Toutes les dates"
  } else if (currentDateStart && currentDateEnd) {
    const isSameMonth = dStart.getMonth() === dEnd.getMonth() && dStart.getFullYear() === dEnd.getFullYear()
    if (isSameMonth) {
      displayMonth = dStart.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })
    } else if (dStart.getFullYear() === dEnd.getFullYear()) {
      displayMonth = `${dStart.toLocaleDateString('fr-FR', { month: 'long' })} - ${dEnd.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}`
    } else {
      displayMonth = `${dStart.toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' })} - ${dEnd.toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' })}`
    }
  } else if (currentDateStart) {
    displayMonth = `Depuis le ${dStart.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}`
  } else {
    displayMonth = `Jusqu'au ${dEnd.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}`
  }

  const todayYMD = formatYMD(new Date())
  const isUpcoming = currentDateStart === todayYMD && !currentDateEnd

  return (
    <div className="bg-white rounded-2xl border border-stone-100 p-4 shadow-sm relative">
      {isPending && (
        <div className="absolute -top-2 -right-2 z-10 bg-white shadow-md rounded-full p-1.5 border border-stone-100">
          <Loader2 className="w-4 h-4 text-pink-500 animate-spin" />
        </div>
      )}

      {/* Navigation Rapide des Mois */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide">
          <button
            onClick={() => updateFilters({ dateStart: null, dateEnd: null })}
            className={`whitespace-nowrap px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${!hasDateFilter ? "bg-pink-50 text-pink-700" : "text-gray-500 hover:bg-stone-50"}`}
          >
            Toutes
          </button>
          <button
            onClick={() => updateFilters({ dateStart: todayYMD, dateEnd: null, sort: "event_asc" })}
            className={`whitespace-nowrap px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${isUpcoming ? "bg-pink-50 text-pink-700" : "text-gray-500 hover:bg-stone-50"}`}
          >
            À venir
          </button>
        </div>
        <div className="flex items-center gap-2 bg-stone-50 rounded-xl p-1 border border-stone-100 w-full sm:w-auto justify-between sm:justify-start">
          <button onClick={() => handleShiftMonth(-1)} aria-label="Mois précédent" className="p-2 hover:bg-white rounded-lg transition-all text-gray-500 hover:text-gray-900 hover:shadow-sm">
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-xs font-black text-gray-700 uppercase tracking-widest min-w-[130px] text-center">
            {displayMonth}
          </span>
          <button onClick={() => handleShiftMonth(1)} aria-label="Mois suivant" className="p-2 hover:bg-white rounded-lg transition-all text-gray-500 hover:text-gray-900 hover:shadow-sm">
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        {/* Recherche */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher (client, email, bouquet)..."
            className="w-full bg-stone-50 border-none rounded-xl pl-11 pr-4 py-3.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-pink-100 transition-shadow text-gray-900 placeholder:text-gray-400"
          />
        </div>
        
        {/* Filtres (Dates + Tri) */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
           {/* Date Du */}
           <div className="bg-stone-50 rounded-xl px-4 py-2.5 flex flex-col justify-center border border-transparent focus-within:border-pink-100 transition-colors">
             <span className="text-[10px] uppercase font-bold text-gray-400 mb-1 tracking-wider">Date début</span>
             <input 
               type="date" 
               value={currentDateStart}
               onChange={(e) => updateFilters({ dateStart: e.target.value })}
               className="bg-transparent border-none text-sm font-semibold text-gray-900 focus:outline-none cursor-pointer p-0 w-full" 
             />
           </div>
           
           {/* Date Au */}
           <div className="bg-stone-50 rounded-xl px-4 py-2.5 flex flex-col justify-center border border-transparent focus-within:border-pink-100 transition-colors">
             <span className="text-[10px] uppercase font-bold text-gray-400 mb-1 tracking-wider">Date fin</span>
             <input 
               type="date" 
               value={currentDateEnd}
               onChange={(e) => updateFilters({ dateEnd: e.target.value })}
               className="bg-transparent border-none text-sm font-semibold text-gray-900 focus:outline-none cursor-pointer p-0 w-full" 
             />
           </div>
           
           {/* Tri */}
           <div className="col-span-2 md:col-span-2 bg-stone-50 rounded-xl px-4 py-2.5 flex flex-col justify-center border border-transparent focus-within:border-pink-100 transition-colors">
             <span className="text-[10px] uppercase font-bold text-gray-400 mb-1 tracking-wider">Trier par</span>
             <select 
               value={currentSort}
               onChange={(e) => updateFilters({ sort: e.target.value })}
               className="bg-transparent border-none text-sm font-semibold text-gray-900 focus:outline-none cursor-pointer p-0 w-full appearance-none"
             >
               <option value="created_desc">Plus récentes (Création)</option>
               <option value="event_asc">Date événement (Proche)</option>
               <option value="event_desc">Date événement (Lointaine)</option>
             </select>
           </div>
        </div>
      </div>
    </div>
  )
}

