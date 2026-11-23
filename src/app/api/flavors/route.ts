import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

// GET /api/flavors — Récupère tous les parfums actifs (public)
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

// POST /api/flavors — Crée un nouveau parfum (admin seulement)
export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { name } = await request.json();
  if (!name?.trim()) return NextResponse.json({ error: "Name required" }, { status: 400 });

  const count = await prisma.flavor.count();
  const flavor = await prisma.flavor.create({
    data: { name: name.trim(), active: true, order: count },
  });
  return NextResponse.json(flavor);
}

