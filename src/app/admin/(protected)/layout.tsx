import { auth, signOut } from "@/auth"
import { LogOut, Megaphone, ExternalLink } from "lucide-react"
import Link from "next/link"
import AdminNav from "@/components/admin/AdminNav"
import { prisma } from "@/lib/prisma"

export default async function AdminProtectedLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()

  if (!session) {
    return null
  }

  let bannerActive = false
  try {
    const setting = await prisma.setting.findUnique({ where: { key: "public_banner_active" } })
    bannerActive = setting?.value === "true"
  } catch {}

  return (
    <div className="flex h-screen bg-gray-50 flex-col md:flex-row">
      <AdminNav>
        <form action={async () => {
          "use server"
          await signOut()
        }}>
          <button className="flex w-full items-center px-4 py-3 text-red-600 hover:bg-red-50 rounded-xl transition-colors font-medium">
            <LogOut className="h-5 w-5 mr-3 text-red-500" />
            Déconnexion
          </button>
        </form>
      </AdminNav>

      {/* Main content */}
      <main className="flex-1 overflow-auto pt-16 md:pt-0 flex flex-col">
        <header className="h-16 bg-white border-b items-center justify-between px-6 md:px-8 hidden md:flex sticky top-0 z-30">
          <h1 className="text-xl font-semibold text-gray-800">Espace Administration</h1>
          <div className="flex items-center gap-3">
            {bannerActive && (
              <Link
                href="/admin/settings"
                className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-pink-50 hover:bg-pink-100 border border-pink-200 text-pink-700 text-xs font-bold transition-colors"
                title="La bannière d'annonce est actuellement visible sur le site public"
              >
                <Megaphone className="w-3.5 h-3.5 text-pink-600" />
                Bannière publique active
              </Link>
            )}
            <Link
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-stone-50 hover:bg-stone-100 border border-stone-200 text-gray-700 text-xs font-semibold transition-colors"
            >
              Voir le site <ExternalLink className="w-3.5 h-3.5 text-gray-400" />
            </Link>
          </div>
        </header>
        <div className="p-4 md:p-8 flex-1">
          {children}
        </div>
      </main>
    </div>
  )
}
