"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";

export async function toggleDateBlockAction(dateIso: string, reason?: string) {
  const session = await auth();
  if (!session) throw new Error("Unauthorized");

  // Extraire YYYY-MM-DD en UTC pour éviter tout décalage de fuseau horaire
  const dateObj = new Date(dateIso);
  const startOfDay = new Date(
    Date.UTC(dateObj.getUTCFullYear(), dateObj.getUTCMonth(), dateObj.getUTCDate())
  );

  const existing = await prisma.availability.findFirst({
    where: {
      date: startOfDay,
      isBlocked: true,
    },
  });

  if (existing) {
    await prisma.availability.delete({
      where: { id: existing.id },
    });
    revalidatePath("/admin/calendar");
    revalidatePath("/commander");
    return { blocked: false };
  } else {
    const created = await prisma.availability.create({
      data: {
        date: startOfDay,
        isBlocked: true,
        reason: reason?.trim() || "Fermé",
      },
    });
    revalidatePath("/admin/calendar");
    revalidatePath("/commander");
    return {
      blocked: true,
      item: {
        id: created.id,
        date: created.date.toISOString(),
        reason: created.reason,
      },
    };
  }
}

/** Bloque toutes les dates entre startYMD et endYMD inclus ("YYYY-MM-DD"). */
export async function blockDateRangeAction(startYMD: string, endYMD: string, reason?: string) {
  const session = await auth();
  if (!session) throw new Error("Unauthorized");

  const start = new Date(`${startYMD}T00:00:00.000Z`);
  const end = new Date(`${endYMD}T00:00:00.000Z`);
  if (isNaN(start.getTime()) || isNaN(end.getTime()) || end < start) {
    return { success: false, error: "Période invalide." };
  }

  const diffDays = Math.round((end.getTime() - start.getTime()) / (24 * 60 * 60 * 1000)) + 1;
  if (diffDays > 90) {
    return { success: false, error: "Vous pouvez bloquer jusqu'à 90 jours d'un coup maximum." };
  }

  const existing = await prisma.availability.findMany({
    where: {
      date: { gte: start, lte: end },
      isBlocked: true,
    },
  });
  const existingKeys = new Set(existing.map((e) => e.date.toISOString().slice(0, 10)));

  const cleanReason = reason?.trim() || "Congés / Fermé";
  const createdItems: { id: string; date: string; reason: string | null }[] = [];

  for (let i = 0; i < diffDays; i++) {
    const d = new Date(start.getTime() + i * 24 * 60 * 60 * 1000);
    const key = d.toISOString().slice(0, 10);
    if (!existingKeys.has(key)) {
      const created = await prisma.availability.create({
        data: {
          date: d,
          isBlocked: true,
          reason: cleanReason,
        },
      });
      createdItems.push({
        id: created.id,
        date: created.date.toISOString(),
        reason: created.reason,
      });
    }
  }

  revalidatePath("/admin/calendar");
  revalidatePath("/commander");
  return { success: true, addedCount: createdItems.length, items: createdItems };
}
