"use client"

import { useState, useMemo } from "react"
import { ChevronLeft, ChevronRight, X, ArrowRight, Lock, Unlock, Loader2, CalendarRange, CheckCircle2 } from "lucide-react"
import Link from "next/link"
import { toggleDateBlockAction, blockDateRangeAction } from "@/app/actions/availability"
import { updateSettingAction } from "@/app/actions/settings"
import { calculateBookingTotal } from "@/lib/orders"
import { STATUS_CONFIG, getStatusConfig } from "@/lib/booking-status"

interface Booking {
  id: string
  customerName: string
  prestationName: string
  quantity: number
  prestationPrice: number
  supplements?: unknown
  discountAmount?: number | null
  eventDate: string // ISO string
  status: string
  eventType: string | null
  allergies: string | null
}

interface BlockedDate {
  id: string
  date: string // ISO string
  reason: string | null
}

interface AdminCalendarProps {
  bookings: Booking[]
  blockedDates: BlockedDate[]
  initialMinNoticeHours: number
}

const MONTHS_FR = [
  "Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
  "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"
]
const DAYS_FR = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"]

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate()
}

function getFirstDayOfMonth(year: number, month: number) {
  const day = new Date(year, month, 1).getDay()
  return day === 0 ? 6 : day - 1 // Monday = 0
}

export default function AdminCalendar({ bookings, blockedDates: initialBlockedDates, initialMinNoticeHours }: AdminCalendarProps) {
  const today = new Date()
  const [year, setYear] = useState(today.getFullYear())
  const [month, setMonth] = useState(today.getMonth())
  const [selectedDay, setSelectedDay] = useState<number | null>(null)
  
  const [blockedDates, setBlockedDates] = useState(initialBlockedDates)
  const [isTogglingBlock, setIsTogglingBlock] = useState(false)
  const [blockReasonInput, setBlockReasonInput] = useState("Fermé")
  const [minNoticeHours, setMinNoticeHours] = useState(initialMinNoticeHours)
  const [isSavingNotice, setIsSavingNotice] = useState(false)
  const [noticeSaved, setNoticeSaved] = useState(false)

  // Modal pour bloquer une période (vacances / congés)
  const [showRangeModal, setShowRangeModal] = useState(false)
  const [rangeStart, setRangeStart] = useState("")
  const [rangeEnd, setRangeEnd] = useState("")
  const [rangeReason, setRangeReason] = useState("Congés")
  const [isBlockingRange, setIsBlockingRange] = useState(false)
  const [rangeError, setRangeError] = useState<string | null>(null)

  const prevMonth = () => {
    if (month === 0) { setYear(y => y - 1); setMonth(11) }
    else setMonth(m => m - 1)
    setSelectedDay(null)
  }

  const nextMonth = () => {
    if (month === 11) { setYear(y => y + 1); setMonth(0) }
    else setMonth(m => m + 1)
    setSelectedDay(null)
  }

  const goToToday = () => {
    const now = new Date()
    setYear(now.getFullYear())
    setMonth(now.getMonth())
    setSelectedDay(now.getDate())
  }

  const isCurrentMonth = year === today.getFullYear() && month === today.getMonth()

  const daysInMonth = getDaysInMonth(year, month)
  const firstDay = getFirstDayOfMonth(year, month)

  const bookingsByDay = useMemo(() => {
    const map: Record<number, Booking[]> = {}
    bookings.forEach(b => {
      const d = new Date(b.eventDate)
      if (d.getUTCFullYear() === year && d.getUTCMonth() === month) {
        const day = d.getUTCDate()
        if (!map[day]) map[day] = []
        map[day].push(b)
      }
    })
    return map
  }, [bookings, year, month])

  const blocksByDay = useMemo(() => {
    const map = new Map<number, BlockedDate>()
    blockedDates.forEach(b => {
      const d = new Date(b.date)
      if (d.getUTCFullYear() === year && d.getUTCMonth() === month) {
        map.set(d.getUTCDate(), b)
      }
    })
    return map
  }, [blockedDates, year, month])

  const selectedBookings = selectedDay ? (bookingsByDay[selectedDay] || []) : []
  const selectedBlock = selectedDay ? blocksByDay.get(selectedDay) : undefined
  const isSelectedDayBlocked = Boolean(selectedBlock)

  const handleToggleBlock = async () => {
    if (!selectedDay) return
    setIsTogglingBlock(true)
    
    const d = new Date(Date.UTC(year, month, selectedDay))
    const iso = d.toISOString()
    
    try {
      const result = await toggleDateBlockAction(iso, blockReasonInput)
      if (result.blocked) {
        setBlockedDates(prev => [...prev, result.item ?? { id: 'temp', date: iso, reason: blockReasonInput || "Fermé" }])
      } else {
        setBlockedDates(prev => prev.filter(b => {
          const bd = new Date(b.date)
          return !(bd.getUTCFullYear() === year && bd.getUTCMonth() === month && bd.getUTCDate() === selectedDay)
        }))
      }
    } catch {
      // ignore
    } finally {
      setIsTogglingBlock(false)
    }
  }

  const handleBlockRange = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!rangeStart || !rangeEnd) return
    setRangeError(null)
    setIsBlockingRange(true)
    try {
      const res = await blockDateRangeAction(rangeStart, rangeEnd, rangeReason)
      if (!res.success) {
        setRangeError(res.error || "Erreur lors du blocage.")
      } else {
        if (res.items && res.items.length > 0) {
          setBlockedDates(prev => [...prev, ...res.items!])
        }
        setShowRangeModal(false)
        setRangeStart("")
        setRangeEnd("")
      }
    } catch {
      setRangeError("Erreur lors du blocage de la période.")
    } finally {
      setIsBlockingRange(false)
    }
  }

  const saveMinNotice = async (newVal: number) => {
    setIsSavingNotice(true)
    setNoticeSaved(false)
    setMinNoticeHours(newVal)
    try {
      await updateSettingAction("MIN_NOTICE_HOURS", newVal.toString())
      setNoticeSaved(true)
      setTimeout(() => setNoticeSaved(false), 2500)
    } finally {
      setIsSavingNotice(false)
    }
  }

  const cells: (number | null)[] = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ]
  while (cells.length % 7 !== 0) cells.push(null)

  const isToday = (day: number) =>
    day === today.getDate() && month === today.getMonth() && year === today.getFullYear()

  return (
    <div className="space-y-6">
      {/* Header & Settings Toolbar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
        <div>
          <h3 className="font-semibold text-gray-900">Disponibilités & Délai</h3>
          <p className="text-xs text-gray-500 mt-0.5">Configurez le préavis minimum ou bloquez une période de congés.</p>
        </div>
        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          <div className="flex items-center gap-2 bg-stone-50 rounded-xl px-3 py-2 border border-stone-200 flex-1 sm:flex-initial">
            <span className="text-xs text-gray-500 font-medium whitespace-nowrap">Préavis :</span>
            <select 
              value={minNoticeHours} 
              onChange={(e) => saveMinNotice(Number(e.target.value))}
              disabled={isSavingNotice}
              className="border-none bg-transparent outline-none focus:ring-0 text-sm font-semibold text-gray-900 cursor-pointer disabled:opacity-50"
            >
              <option value={24}>24h (1 jour)</option>
              <option value={48}>48h (2 jours)</option>
              <option value={72}>72h (3 jours)</option>
              <option value={120}>5 jours</option>
              <option value={168}>1 semaine</option>
              <option value={336}>2 semaines</option>
            </select>
            {isSavingNotice && <Loader2 className="w-4 h-4 animate-spin text-pink-500" />}
            {noticeSaved && <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
          </div>

          <button
            type="button"
            onClick={() => setShowRangeModal(true)}
            className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-pink-50 hover:bg-pink-100 text-pink-700 font-semibold text-sm border border-pink-100 transition-colors"
          >
            <CalendarRange className="w-4 h-4" />
            Bloquer une période
          </button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 relative">
        {/* Main Calendar Area */}
        <div className="flex-1 bg-white rounded-xl border border-gray-100 overflow-hidden shadow-sm">
          {/* Header */}
          <div className="flex items-center justify-between px-4 sm:px-6 py-4 border-b border-gray-100 bg-stone-50/50">
            <div className="flex items-center gap-2">
              <button onClick={prevMonth} aria-label="Mois précédent" className="p-2 rounded-lg hover:bg-white border border-transparent hover:border-gray-200 text-gray-500 transition-all">
                <ChevronLeft className="w-5 h-5" />
              </button>
              {!isCurrentMonth && (
                <button
                  type="button"
                  onClick={goToToday}
                  className="px-3 py-1.5 rounded-lg bg-white border border-stone-200 hover:bg-pink-50 hover:border-pink-200 hover:text-pink-700 text-xs font-bold text-gray-700 transition-colors shadow-xs"
                >
                  Aujourd&apos;hui
                </button>
              )}
            </div>
            <h3 className="text-lg font-bold text-gray-900 capitalize tracking-wide">
              {MONTHS_FR[month]} {year}
            </h3>
            <button onClick={nextMonth} aria-label="Mois suivant" className="p-2 rounded-lg hover:bg-white border border-transparent hover:border-gray-200 text-gray-500 transition-all">
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          {/* Day names */}
          <div className="grid grid-cols-7 border-b border-gray-100 bg-white">
            {DAYS_FR.map(d => (
              <div key={d} className="py-3 text-center text-[10px] sm:text-xs font-bold text-gray-400 uppercase tracking-wider">
                {d}
              </div>
            ))}
          </div>

          {/* Grid */}
          <div className="grid grid-cols-7 border-l border-t border-gray-50 bg-white">
            {cells.map((day, i) => {
              const dayBookings = day ? (bookingsByDay[day] || []) : []
              const isSelected = day === selectedDay
              const todayClass = day && isToday(day)
              const hasBookings = dayBookings.length > 0
              const blockInfo = day ? blocksByDay.get(day) : undefined
              const isBlocked = Boolean(blockInfo)

              return (
                <div
                  key={i}
                  onClick={() => day && setSelectedDay(isSelected ? null : day)}
                  className={`min-h-[70px] sm:min-h-[100px] p-1 sm:p-2 border-b border-r border-gray-50/80 transition-colors relative flex flex-col overflow-hidden ${
                    !day ? "bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:12px_12px] opacity-40 pointer-events-none" :
                    isBlocked ? "bg-red-50/30 cursor-pointer hover:bg-red-50" : 
                    hasBookings ? "bg-white cursor-pointer hover:bg-stone-50/50" : "bg-white cursor-pointer hover:bg-stone-50/50"
                  } ${isSelected ? (isBlocked ? "ring-2 ring-inset ring-red-300 z-10" : "bg-pink-50/50 ring-2 ring-inset ring-pink-300 z-10") : ""}`}
                >
                  {day && (
                    <>
                      <div className="flex items-start justify-between mb-1">
                        <div className={`w-6 h-6 sm:w-7 sm:h-7 flex items-center justify-center rounded-full text-[11px] sm:text-sm ${
                          todayClass ? "bg-pink-500 text-white font-bold shadow-sm" :
                          isSelected ? "bg-pink-100 text-pink-700 font-bold" :
                          isBlocked ? "text-red-700 font-medium" : "text-gray-700 font-medium"
                        }`}>
                          {day}
                        </div>
                        {isBlocked && (
                          <span className="flex items-center gap-1 text-[9px] text-red-500 font-semibold mt-1 mr-0.5 truncate max-w-[60px]" title={blockInfo?.reason || "Bloqué"}>
                            <Lock className="w-3 h-3 shrink-0" />
                          </span>
                        )}
                      </div>
                      
                      <div className="flex-1 flex flex-col justify-end sm:justify-start">
                        {/* Mobile Dots View */}
                        {hasBookings && (
                          <div className="flex sm:hidden flex-wrap gap-1 px-0.5 mt-auto pb-1">
                            {dayBookings.slice(0, 5).map((b, idx) => {
                              const cfg = getStatusConfig(b.status)
                              return <div key={`${b.id}-${idx}`} className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                            })}
                            {dayBookings.length > 5 && <div className="w-1.5 h-1.5 rounded-full bg-gray-300" />}
                          </div>
                        )}

                        {/* Desktop List View */}
                        <div className="hidden sm:flex flex-col space-y-1">
                          {dayBookings.slice(0, 3).map(b => {
                            const cfg = getStatusConfig(b.status)
                            return (
                              <div
                                key={b.id}
                                className={`flex items-center gap-1.5 px-1.5 py-0.5 rounded text-[10px] 2xl:text-xs truncate transition-all ${cfg.badge} ${isBlocked ? 'opacity-70' : ''}`}
                              >
                                <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${cfg.dot}`} />
                                <span className="truncate font-medium">{b.customerName.split(' ')[0]}</span>
                              </div>
                            )
                          })}
                          {dayBookings.length > 3 && (
                            <div className="text-[10px] font-medium text-gray-400 pl-1">+{dayBookings.length - 3} autres</div>
                          )}
                        </div>
                      </div>
                    </>
                  )}
                </div>
              )
            })}
          </div>
          
          {/* Legend (Bottom of Calendar) */}
          <div className="px-4 py-3 bg-stone-50 border-t border-gray-100 flex flex-wrap items-center gap-4 text-[10px] sm:text-xs text-gray-500">
            <span className="font-bold uppercase tracking-wider text-gray-400 mr-2">Légende :</span>
            {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
              <div key={key} className="flex items-center gap-1.5">
                <div className={`w-2 h-2 rounded-full ${cfg.dot}`} />
                <span>{cfg.label}</span>
              </div>
            ))}
            <div className="flex items-center gap-1.5 ml-auto">
              <Lock className="w-3 h-3 text-red-400" />
              <span>Bloqué</span>
            </div>
          </div>
        </div>

        {/* Mobile backdrop */}
        <div 
          className={`fixed inset-0 bg-gray-900/40 z-40 transition-opacity duration-300 lg:hidden ${
            selectedDay ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
          }`} 
          onClick={() => setSelectedDay(null)} 
        />

        {/* Side panel (Desktop) & Bottom Drawer (Mobile) */}
        <div className={`
          fixed inset-x-0 bottom-0 z-50 transition-transform duration-300
          lg:static lg:z-auto lg:translate-y-0 lg:w-80 lg:flex lg:flex-col
          ${selectedDay ? 'translate-y-0' : 'translate-y-full lg:hidden'}
        `}>
          <div className="bg-white rounded-t-3xl shadow-2xl lg:shadow-none lg:static lg:rounded-xl lg:border lg:border-gray-100 flex flex-col max-h-[85vh] lg:max-h-none lg:h-fit">
            
            <div className="w-12 h-1.5 bg-gray-200 rounded-full mx-auto mt-3 mb-1 lg:hidden" />

            {selectedDay && (
              <>
                <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                  <div>
                    <h4 className="font-bold text-gray-900 text-lg lg:text-base">
                      {selectedDay} {MONTHS_FR[month]} {year}
                    </h4>
                    {selectedBlock?.reason && (
                      <p className="text-xs text-red-600 font-medium mt-0.5">🔒 {selectedBlock.reason}</p>
                    )}
                  </div>
                  <button onClick={() => setSelectedDay(null)} className="p-1.5 rounded-full hover:bg-stone-100 text-gray-400 transition-colors">
                    <X className="w-5 h-5 lg:w-4 lg:h-4" />
                  </button>
                </div>

                <div className="p-4 border-b border-gray-50 bg-stone-50/50 space-y-2">
                  {!isSelectedDayBlocked && (
                    <input
                      type="text"
                      value={blockReasonInput}
                      onChange={(e) => setBlockReasonInput(e.target.value)}
                      placeholder="Motif (ex: Fermé, Complet, Congés...)"
                      className="w-full px-3 py-2 text-xs rounded-lg border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-pink-300"
                    />
                  )}
                  <button 
                    onClick={handleToggleBlock}
                    disabled={isTogglingBlock}
                    className={`w-full flex justify-center items-center gap-2 py-2.5 px-4 rounded-xl text-sm font-semibold transition-all shadow-sm ${
                      isSelectedDayBlocked 
                        ? "bg-white text-green-600 border border-green-200 hover:bg-green-50" 
                        : "bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700 border border-red-100"
                    }`}
                  >
                    {isTogglingBlock ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : isSelectedDayBlocked ? (
                      <><Unlock className="w-4 h-4" /> Rouvrir les commandes</>
                    ) : (
                      <><Lock className="w-4 h-4" /> Bloquer cette date</>
                    )}
                  </button>
                </div>

                {selectedBookings.length === 0 ? (
                  <div className="px-5 py-10 text-center flex flex-col items-center">
                    <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mb-3">
                      <Lock className="w-5 h-5 text-gray-300" />
                    </div>
                    <p className="text-gray-400 text-sm">Aucune commande ce jour.</p>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-50 overflow-y-auto max-h-[50vh] lg:max-h-[400px]">
                    {selectedBookings.map(b => {
                      const cfg = getStatusConfig(b.status)
                      const total = calculateBookingTotal(b)
                      return (
                        <div key={b.id} className="px-5 py-4 hover:bg-stone-50/30 transition-colors">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <p className="font-bold text-gray-900">{b.customerName}</p>
                              <p className="text-sm text-gray-500 font-medium">{b.prestationName} <span className="text-gray-300 px-1">|</span> × {b.quantity}</p>
                            </div>
                            <span className="font-black text-pink-600 text-base">{total.toFixed(0)} €</span>
                          </div>
                          {b.eventType && (
                            <p className="text-xs text-gray-400 mb-2">{b.eventType}</p>
                          )}
                          {b.allergies && (
                            <p className="text-xs text-red-600 bg-red-50/80 font-medium rounded px-2 py-1 mb-2 inline-block">⚠️ {b.allergies}</p>
                          )}
                          <div className="flex items-center justify-between mt-3">
                            <span className={`inline-block px-2.5 py-1 rounded-md text-[11px] font-bold uppercase tracking-wider ${cfg.badge}`}>
                              {cfg.label}
                            </span>
                            <Link
                              href={`/admin/commandes/${b.id}`}
                              className="flex items-center gap-1 text-sm text-pink-500 hover:text-pink-700 font-bold transition-colors bg-pink-50 px-3 py-1.5 rounded-lg"
                            >
                              Voir <ArrowRight className="w-3.5 h-3.5" />
                            </Link>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Modale pour bloquer une période (vacances / congés) */}
      {showRangeModal && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4" role="dialog" aria-modal="true">
          <div className="absolute inset-0 bg-black/30 backdrop-blur-[1px]" onClick={() => setShowRangeModal(false)} />
          <form onSubmit={handleBlockRange} className="relative bg-white rounded-3xl shadow-2xl w-full max-w-md p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <CalendarRange className="w-5 h-5 text-pink-600" />
                Bloquer une période
              </h3>
              <button type="button" onClick={() => setShowRangeModal(false)} className="p-1.5 rounded-full hover:bg-stone-100 text-gray-400">
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs text-gray-500">
              Toutes les dates comprises dans cette période seront fermées à la commande sur le site.
            </p>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Du *</label>
                <input
                  type="date"
                  value={rangeStart}
                  onChange={(e) => setRangeStart(e.target.value)}
                  required
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-200 bg-stone-50 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-pink-400"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Au (inclus) *</label>
                <input
                  type="date"
                  value={rangeEnd}
                  min={rangeStart || undefined}
                  onChange={(e) => setRangeEnd(e.target.value)}
                  required
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-200 bg-stone-50 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-pink-400"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Motif</label>
              <input
                type="text"
                value={rangeReason}
                onChange={(e) => setRangeReason(e.target.value)}
                placeholder="Ex: Congés d'été, Carnet complet..."
                className="w-full px-3 py-2.5 rounded-xl border border-gray-200 bg-stone-50 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-pink-400"
              />
            </div>

            {rangeError && (
              <p className="text-xs text-red-700 bg-red-50 border border-red-100 rounded-xl px-3 py-2 font-medium">{rangeError}</p>
            )}

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowRangeModal(false)}
                className="px-4 py-2.5 rounded-xl text-sm font-medium text-gray-600 hover:bg-stone-100 transition-colors"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={isBlockingRange}
                className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-pink-600 hover:bg-pink-700 flex items-center gap-2 transition-colors disabled:opacity-60"
              >
                {isBlockingRange ? <Loader2 className="w-4 h-4 animate-spin" /> : <Lock className="w-4 h-4" />}
                Bloquer la période
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}
