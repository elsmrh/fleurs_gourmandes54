"use server"

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { auth } from "@/auth"

export async function updateSettings(formData: FormData) {
  const session = await auth()
  if (!session) throw new Error("Unauthorized")

  const maxOrders = formData.get("max_orders_per_day") as string
  const maxRevenue = formData.get("max_revenue_per_day") as string
  const bannerActive = formData.get("public_banner_active") === "true" ? "true" : "false"
  const bannerText = formData.get("public_banner_text") as string
  const businessAddress = formData.get("business_address") as string
  const businessSiret = formData.get("business_siret") as string
  const depositPercent = formData.get("default_deposit_percent") as string

  const settingsToUpdate = [
    { key: "max_orders_per_day", value: maxOrders || "" },
    { key: "max_revenue_per_day", value: maxRevenue || "" },
    { key: "public_banner_active", value: bannerActive },
    { key: "public_banner_text", value: bannerText || "" },
    { key: "business_address", value: businessAddress || "" },
    { key: "business_siret", value: businessSiret || "" },
    { key: "default_deposit_percent", value: depositPercent || "" },
  ]

  for (const setting of settingsToUpdate) {
    await prisma.setting.upsert({
      where: { key: setting.key },
      update: { value: setting.value },
      create: { key: setting.key, value: setting.value },
    })
  }

  revalidatePath("/admin", "layout")
  revalidatePath("/admin/settings")
  revalidatePath("/")
  return { success: true }
}

export async function updateSettingAction(key: string, value: string) {
  const session = await auth()
  if (!session) throw new Error("Unauthorized")

  await prisma.setting.upsert({
    where: { key },
    update: { value },
    create: { key, value }
  })
  
  revalidatePath("/admin/calendar")
  revalidatePath("/")
}
