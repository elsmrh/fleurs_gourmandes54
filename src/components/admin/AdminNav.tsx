"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { CalendarDays, ClipboardList, Flower2, LayoutDashboard, Gift, Menu, X, LogOut, Users, Tag, Settings, ExternalLink } from "lucide-react"
import { useNewOrders, NewOrderToasts, NotificationToggle } from "./NewOrderNotifications"

const NAV_LINKS = [
  { href: "/admin", icon: LayoutDashboard, label: "Tableau de bord" },
  { href: "/admin/commandes", icon: ClipboardList, label: "Commandes" },
  { href: "/admin/calendar", icon: CalendarDays, label: "Calendrier" },
  { href: "/admin/clients", icon: Users, label: "Clients" },
  { href: "/admin/services", icon: Gift, label: "Prestations" },
  { href: "/admin/parfums", icon: Flower2, label: "Parfums" },
  { href: "/admin/promos", icon: Tag, label: "Codes Promo" },
  { href: "/admin/settings", icon: Settings, label: "Paramètres" },
]

export default function AdminNav({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false)
  const pathname = usePathname()
  const { pendingCount, toasts, dismissToast, permission, requestPermission } = useNewOrders()

  return (
    <>
      <NewOrderToasts toasts={toasts} onDismiss={dismissToast} />

      {/* Mobile Top Bar */}
      <div className="md:hidden flex items-center justify-between h-16 bg-white border-b px-4 fixed top-0 w-full z-50">
        <div className="flex items-center gap-2 text-pink-600 font-semibold">
          <Flower2 className="w-6 h-6" />
          <span>Fleurs Gourmandes Admin</span>
        </div>
        <div className="flex items-center gap-1">
          <NotificationToggle permission={permission} onRequest={requestPermission} />
          <button onClick={() => setIsOpen(!isOpen)} className="relative p-2 -mr-2 text-gray-600" aria-label="Menu">
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            {!isOpen && pendingCount > 0 && (
              <span className="absolute top-1 right-1 h-2.5 w-2.5 rounded-full bg-pink-500 ring-2 ring-white" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/20 z-40 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar (Desktop + Mobile slide-in) */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-72 bg-white border-r flex flex-col transform transition-transform duration-300 ease-in-out
        md:translate-x-0 md:static md:w-64
        ${isOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full"}
      `}>
        <div className="h-16 flex items-center px-6 border-b md:flex hidden">
          <Flower2 className="h-6 w-6 text-pink-600 mr-2" />
          <span className="font-semibold text-lg">Admin</span>
          <NotificationToggle permission={permission} onRequest={requestPermission} />
        </div>
        <div className="md:hidden h-16 flex items-center px-6 border-b bg-pink-50 text-pink-700 font-medium">
          Menu
        </div>
        
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {NAV_LINKS.map(link => {
            const isActive = link.href === "/admin"
              ? pathname === "/admin"
              : pathname === link.href || pathname.startsWith(`${link.href}/`)
            return (
              <Link 
                key={link.href}
                href={link.href} 
                onClick={() => setIsOpen(false)}
                className={`flex items-center px-4 py-3 rounded-xl transition-colors ${
                  isActive 
                    ? "bg-pink-50 text-pink-700 font-medium" 
                    : "text-gray-600 hover:bg-gray-50"
                }`}
              >
                <link.icon className={`h-5 w-5 mr-3 ${isActive ? "text-pink-500" : "text-gray-400"}`} />
                {link.label}
                {link.href === "/admin/commandes" && pendingCount > 0 && (
                  <span
                    className="ml-auto min-w-6 h-6 px-2 rounded-full bg-pink-500 text-white text-xs font-semibold flex items-center justify-center"
                    aria-label={`${pendingCount} commande${pendingCount > 1 ? "s" : ""} en attente`}
                  >
                    {pendingCount}
                  </span>
                )}
              </Link>
            )
          })}
        </nav>
        
        <div className="p-4 border-t space-y-1">
          <Link
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex w-full items-center px-4 py-3 text-gray-600 hover:bg-stone-50 hover:text-gray-900 rounded-xl transition-colors font-medium text-sm"
          >
            <ExternalLink className="h-5 w-5 mr-3 text-gray-400" />
            Voir le site public
          </Link>
          {children}
        </div>
      </aside>
    </>
  )
}

