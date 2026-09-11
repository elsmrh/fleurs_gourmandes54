import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/flavors — Récupère tous les parfums actifs
export async function GET() {
  try {
    const flavors = await prisma.flavor.findMany({
      where: { active: true },
      orderBy: { order: "asc" },
      select: { id: true, name: true },
    });
    return NextResponse.json(flavors);
  } catch (error) {
    console.error("Failed to fetch flavors:", error);
    return NextResponse.json([], { status: 500 });
  }
}

