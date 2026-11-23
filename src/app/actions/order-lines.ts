"use server"

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { auth } from "@/auth"

export async function updateOrderLines(id: string, prestationName: string, prestationPrice: number, quantity: number, supplements: any[]) {
  const session = await auth()
  if (!session) throw new Error("Unauthorized")

  try {
    await prisma.booking.update({
      where: { id },
      data: { 
        prestationName,
        prestationPrice,
        quantity,
        supplements
      }
    })
    revalidatePath(`/admin/commandes/${id}`)
    revalidatePath(`/admin/commandes`)
    return { success: true }
  } catch (error) {
    console.error("Error updating order lines:", error)
    return { success: false, error: "Failed to update order lines" }
  }
}

