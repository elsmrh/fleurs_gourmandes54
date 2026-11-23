"use client"

import { useState, useMemo } from "react"
import Link from "next/link"
import { Search, Mail, Phone, ChevronDown, ChevronUp, ChevronsUpDown, ChevronLeft, ChevronRight, ArrowRight, Download } from "lucide-react"

export interface ClientData {
  email: string
  name: string
  phone: string
  totalSpent: number
  orderCount: number
  lastOrderDate: Date
}

interface ClientsTableProps {
  initialClients: ClientData[]
}

const ITEMS_PER_PAGE = 10

export default function ClientsTable({ initialClients }: ClientsTableProps) {
  const [sortKey, setSortKey] = useState<keyof ClientData>("totalSpent")
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc")
  const [currentPage, setCurrentPage] = useState(1)
  const [searchQuery, setSearchQuery] = useState("")

  // Filtrer par recherche
  const filteredClients = useMemo(() => {
    if (!searchQuery.trim()) return initialClients
    const lowerQuery = searchQuery.toLowerCase()
    return initialClients.filter(
      c => 
        c.name.toLowerCase().includes(lowerQuery) || 
        c.email.toLowerCase().includes(lowerQuery) || 
        c.phone.includes(lowerQuery)
    )
  }, [initialClients, searchQuery])

  // Trier
  const sortedClients = useMemo(() => {
    const sorted = [...filteredClients].sort((a, b) => {
      const aVal = a[sortKey]
      const bVal = b[sortKey]
      
      if (aVal < bVal) return sortDirection === "asc" ? -1 : 1
      if (aVal > bVal) return sortDirection === "asc" ? 1 : -1
      return 0
    })
    return sorted
  }, [filteredClients, sortKey, sortDirection])

  // Paginer
  const totalPages = Math.ceil(sortedClients.length / ITEMS_PER_PAGE)
  const paginatedClients = sortedClients.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  )

  const handleSort = (key: keyof ClientData) => {
    if (sortKey === key) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortKey(key)
      setSortDirection("desc")
    }
    setCurrentPage(1)
  }

  const handleExportCsv = () => {
    const headers = ["Nom", "Email", "Telephone", "Commandes", "Total Depense (EUR)", "Derniere Commande"]
    const escapeCsv = (val: string | number) => `"${String(val).replace(/"/g, '""')}"`
    const rows = sortedClients.map(c => [
      escapeCsv(c.name),
      escapeCsv(c.email),
      escapeCsv(c.phone),
      c.orderCount,
      c.totalSpent.toFixed(2),
      escapeCsv(new Date(c.lastOrderDate).toLocaleDateString("fr-FR")),
    ].join(";"))

    // BOM UTF-8 pour ouverture directe dans Excel avec accents
    const csvContent = "\uFEFF" + [headers.join(";"), ...rows].join("\n")
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `clients-fleurs-gourmandes-${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  const SortIcon = ({ columnKey }: { columnKey: keyof ClientData }) => {
    if (sortKey !== columnKey) return <ChevronsUpDown className="w-3.5 h-3.5 text-gray-300 inline-block ml-1" />
    if (sortDirection === "asc") return <ChevronUp className="w-3.5 h-3.5 text-pink-500 inline-block ml-1" />
    return <ChevronDown className="w-3.5 h-3.5 text-pink-500 inline-block ml-1" />
  }

  return (
    <div className="bg-white rounded-3xl p-5 shadow-[0_2px_20px_-4px_rgba(0,0,0,0.05)] border border-stone-100 overflow-hidden">
      
      {/* Barre de recherche + Export CSV */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex-1 max-w-md relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Rechercher par nom, email ou téléphone..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value)
              setCurrentPage(1)
            }}
            className="block w-full pl-10 pr-3 py-2.5 border border-gray-200 rounded-xl leading-5 bg-stone-50 placeholder-gray-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-pink-500 focus:border-pink-500 sm:text-sm transition-colors"
          />
        </div>
        {sortedClients.length > 0 && (
          <button
            type="button"
            onClick={handleExportCsv}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-stone-50 hover:bg-stone-100 text-gray-700 font-semibold text-xs border border-stone-200 transition-colors"
          >
            <Download className="w-4 h-4 text-pink-500" />
            Exporter CSV ({sortedClients.length})
          </button>
        )}
      </div>

      {sortedClients.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500">Aucun client trouvé.</p>
        </div>
      ) : (
        <>
          {/* Vue Mobile (Cartes) */}
          <div className="md:hidden flex flex-col gap-3">
            {paginatedClients.map((client) => {
              const isVip = initialClients.findIndex(c => c.email === client.email) < 3 && client.totalSpent > 0;
              
              return (
                <div key={client.email} className="bg-white rounded-2xl p-4 border border-stone-100 shadow-[0_1px_3px_rgba(0,0,0,0.02)] relative">
                  <div className="flex justify-between items-start mb-2">
                    <div className="font-bold text-gray-900 flex items-center gap-2">
                      {client.name}
                      {isVip && (
                        <span className="bg-yellow-100 text-yellow-700 text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-widest">VIP</span>
                      )}
                    </div>
                    <Link
                      href={`/admin/clients/${encodeURIComponent(client.email)}`}
                      className="inline-flex items-center gap-1 text-xs font-bold text-pink-600 bg-pink-50 px-3 py-1.5 rounded-lg"
                    >
                      Voir <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                  
                  <div className="flex flex-col gap-1 mb-3 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <Mail className="w-3.5 h-3.5 text-gray-400" />
                      <a href={`mailto:${client.email}`} className="truncate">{client.email}</a>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="w-3.5 h-3.5 text-gray-400" />
                      <a href={`tel:${client.phone}`}>{client.phone}</a>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 border-t border-stone-50 pt-3">
                    <div>
                      <div className="text-[10px] uppercase tracking-wider text-gray-400 font-bold">Commandes</div>
                      <div className="font-semibold text-gray-900 mt-0.5">{client.orderCount}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-[10px] uppercase tracking-wider text-gray-400 font-bold">Total Dépensé</div>
                      <div className="font-black text-emerald-600 mt-0.5">{client.totalSpent.toFixed(2).replace('.00', '')} €</div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Vue Desktop (Tableau) */}
          <div className="hidden md:block overflow-x-auto -mx-5 px-5">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-stone-100 text-left text-gray-400 text-xs uppercase tracking-wider">
                  <th className="pb-4 pr-4 font-semibold cursor-pointer hover:text-gray-700 select-none" onClick={() => handleSort("name")}>
                    Client <SortIcon columnKey="name" />
                  </th>
                  <th className="pb-4 pr-4 font-semibold">Contact</th>
                  <th className="pb-4 pr-4 font-semibold text-center cursor-pointer hover:text-gray-700 select-none" onClick={() => handleSort("orderCount")}>
                    Commandes <SortIcon columnKey="orderCount" />
                  </th>
                  <th className="pb-4 pr-4 font-semibold text-right cursor-pointer hover:text-gray-700 select-none" onClick={() => handleSort("totalSpent")}>
                    Total Dépensé <SortIcon columnKey="totalSpent" />
                  </th>
                  <th className="pb-4 font-semibold text-right cursor-pointer hover:text-gray-700 select-none" onClick={() => handleSort("lastOrderDate")}>
                    Dernière Commande <SortIcon columnKey="lastOrderDate" />
                  </th>
                  <th className="pb-4 font-semibold text-right">Fiche</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-50">
                {paginatedClients.map((client) => {
                  const isVip = initialClients.findIndex(c => c.email === client.email) < 3 && client.totalSpent > 0;

                  return (
                    <tr key={client.email} className="hover:bg-stone-50 transition-colors group">
                      <td className="py-4 pr-4">
                        <div className="font-bold text-gray-900 flex items-center gap-2">
                          {client.name}
                          {isVip && (
                            <span className="bg-yellow-100 text-yellow-700 text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-widest" title="Fait partie de vos 3 meilleurs clients en chiffre d'affaires">VIP</span>
                          )}
                        </div>
                        <div className="text-gray-400 text-xs mt-0.5 truncate max-w-[200px]">{client.email}</div>
                      </td>
                      <td className="py-4 pr-4 text-gray-600">
                        <div className="flex items-center gap-1.5 text-xs">
                          <Mail className="w-3.5 h-3.5 text-gray-400" />
                          <a href={`mailto:${client.email}`} className="hover:text-pink-600 transition-colors">{client.email}</a>
                        </div>
                        <div className="flex items-center gap-1.5 text-xs mt-1">
                          <Phone className="w-3.5 h-3.5 text-gray-400" />
                          <a href={`tel:${client.phone}`} className="hover:text-pink-600 transition-colors">{client.phone}</a>
                        </div>
                      </td>
                      <td className="py-4 pr-4 text-center">
                        <span className="inline-flex items-center justify-center bg-blue-50 text-blue-700 font-bold px-3 py-1 rounded-full text-xs">
                          {client.orderCount}
                        </span>
                      </td>
                      <td className="py-4 pr-4 text-right">
                        <span className="font-black text-emerald-600 text-base">{client.totalSpent.toFixed(2).replace('.00', '')} €</span>
                      </td>
                      <td className="py-4 text-right text-gray-500 text-xs">
                        {new Date(client.lastOrderDate).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </td>
                      <td className="py-4 text-right pl-4">
                        <Link
                          href={`/admin/clients/${encodeURIComponent(client.email)}`}
                          className="inline-flex items-center justify-center p-2 text-gray-400 hover:text-pink-600 hover:bg-pink-50 rounded-lg transition-colors"
                          title="Voir la fiche client"
                        >
                          <ArrowRight className="w-4 h-4" />
                        </Link>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex flex-col sm:flex-row items-center justify-between border-t border-stone-100 pt-5 mt-4 gap-4">
              <p className="text-sm text-gray-500 text-center sm:text-left">
                Affichage de <span className="font-medium">{(currentPage - 1) * ITEMS_PER_PAGE + 1}</span> à <span className="font-medium">{Math.min(currentPage * ITEMS_PER_PAGE, sortedClients.length)}</span> sur <span className="font-medium">{sortedClients.length}</span>
              </p>
              <div className="flex gap-2">
                <button 
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="p-2 rounded-lg border border-gray-200 text-gray-500 hover:bg-stone-50 disabled:opacity-50 disabled:hover:bg-transparent transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="p-2 rounded-lg border border-gray-200 text-gray-500 hover:bg-stone-50 disabled:opacity-50 disabled:hover:bg-transparent transition-colors"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
