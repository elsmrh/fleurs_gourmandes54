import { prisma } from "@/lib/prisma"
import SettingsForm from "@/components/admin/SettingsForm"

export const metadata = {
  title: "Paramètres - Fleurs Gourmandes",
}

export default async function SettingsPage() {
  const settings = await prisma.setting.findMany()
  
  const getSetting = (key: string, defaultValue = "") => {
    return settings.find(s => s.key === key)?.value || defaultValue
  }

  const maxOrders = getSetting("max_orders_per_day")
  const maxRevenue = getSetting("max_revenue_per_day")
  const bannerActive = getSetting("public_banner_active", "false") === "true"
  const bannerText = getSetting("public_banner_text", "Carnet de commandes complet jusqu'au 15 Octobre")
  const businessAddress = getSetting("business_address", "Nancy, Meurthe-et-Moselle")
  const businessSiret = getSetting("business_siret", "")
  const depositPercent = getSetting("default_deposit_percent", "30")

  return (
    <div className="space-y-8 max-w-4xl mx-auto pb-12">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Paramètres Généraux</h1>
        <p className="text-gray-500 text-sm mt-1">Configurez le comportement de votre boutique en ligne et de vos documents.</p>
      </div>

      <SettingsForm
        initialMaxOrders={maxOrders}
        initialMaxRevenue={maxRevenue}
        initialBannerActive={bannerActive}
        initialBannerText={bannerText}
        initialBusinessAddress={businessAddress}
        initialBusinessSiret={businessSiret}
        initialDepositPercent={depositPercent}
      />
    </div>
  )
}
