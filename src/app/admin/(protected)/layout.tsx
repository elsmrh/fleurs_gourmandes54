import { auth, signOut } from "@/auth"
import Link from "next/link"
import { CalendarDays, Flower2, LayoutDashboard, LogOut, Settings } from "lucide-react"

export default async function AdminProtectedLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()

  if (!session) {
    return null
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r flex flex-col">
        <div className="h-16 flex items-center px-6 border-b">
          <Flower2 className="h-6 w-6 text-pink-600 mr-2" />
          <span className="font-semibold text-lg">Admin</span>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          <Link href="/admin" className="flex items-center px-4 py-2 text-gray-700 bg-gray-100 rounded-md">
            <LayoutDashboard className="h-5 w-5 mr-3 text-gray-500" />
            Tableau de bord
          </Link>
          <Link href="/admin/calendar" className="flex items-center px-4 py-2 text-gray-600 hover:bg-gray-50 rounded-md">
            <CalendarDays className="h-5 w-5 mr-3 text-gray-500" />
            Calendrier
          </Link>
          <Link href="/admin/services" className="flex items-center px-4 py-2 text-gray-600 hover:bg-gray-50 rounded-md">
            <Settings className="h-5 w-5 mr-3 text-gray-500" />
            Prestations
          </Link>
        </nav>
        <div className="p-4 border-t">
          <form action={async () => {
            "use server"
            await signOut()
          }}>
            <button className="flex w-full items-center px-4 py-2 text-gray-600 hover:bg-gray-50 rounded-md">
              <LogOut className="h-5 w-5 mr-3 text-gray-500" />
              Déconnexion
            </button>
          </form>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto">
        <header className="h-16 bg-white border-b flex items-center px-8">
          <h1 className="text-xl font-semibold text-gray-800">Espace Administration</h1>
        </header>
        <div className="p-8">
          {children}
        </div>
      </main>
    </div>
  )
}

