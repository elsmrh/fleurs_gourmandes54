"use server"

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { auth } from "@/auth"

export async function createPromoAction(input: {
  code: string
  type: "PERCENTAGE" | "FIXED"
  value: number
  maxUses?: number | null
  expiresAt?: string | null
}) {
  const session = await auth()
  if (!session) return { success: false, error: "Non autorisé" }

  const cleanCode = input.code.trim().toUpperCase()
  if (!cleanCode) return { success: false, error: "Veuillez saisir un code." }
  if (isNaN(input.value) || input.value <= 0) {
    return { success: false, error: "Veuillez saisir une valeur supérieure à 0." }
  }
  if (input.type === "PERCENTAGE" && input.value > 100) {
    return { success: false, error: "Le pourcentage ne peut pas dépasser 100 %." }
  }

  const existing = await prisma.promoCode.findUnique({ where: { code: cleanCode } })
  if (existing) {
    return { success: false, error: `Le code « ${cleanCode} » existe déjà.` }
  }

  const expiresDate = input.expiresAt ? new Date(`${input.expiresAt}T23:59:59.999Z`) : null

  const promo = await prisma.promoCode.create({
    data: {
      code: cleanCode,
      type: input.type,
      value: input.value,
      active: true,
      maxUses: input.maxUses && input.maxUses > 0 ? input.maxUses : null,
      expiresAt: expiresDate && !isNaN(expiresDate.getTime()) ? expiresDate : null,
    },
  })

  revalidatePath("/admin/promos")
  return {
    success: true,
    promo: {
      ...promo,
      expiresAt: promo.expiresAt ? promo.expiresAt.toISOString() : null,
      createdAt: promo.createdAt.toISOString(),
    },
  }
}

export async function togglePromoActiveAction(id: string, active: boolean) {
  const session = await auth()
  if (!session) return { success: false, error: "Non autorisé" }

  await prisma.promoCode.update({
    where: { id },
    data: { active },
  })

  revalidatePath("/admin/promos")
  return { success: true }
}

export async function deletePromoAction(id: string) {
  const session = await auth()
  if (!session) return { success: false, error: "Non autorisé" }

  await prisma.promoCode.delete({ where: { id } })
  revalidatePath("/admin/promos")
  return { success: true }
}

