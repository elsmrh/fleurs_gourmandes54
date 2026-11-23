"use server"

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { auth } from "@/auth"

export async function updateBookingPrice(id: string, newPrice: number) {
  const session = await auth()
  if (!session) throw new Error("Unauthorized")

  try {
    await prisma.booking.update({
      where: { id },
      data: { prestationPrice: newPrice }
    })
    revalidatePath(`/admin/commandes/${id}`)
    revalidatePath(`/admin/commandes`)
    return { success: true }
  } catch (error) {
    console.error("Error updating price:", error)
    return { success: false, error: "Failed to update price" }
  }
}

