import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

// GET /api/services — Récupère toutes les prestations actives (public)
export async function GET() {
  try {
    const services = await prisma.service.findMany({
      where: { active: true },
      orderBy: { order: "asc" },
    });
    return NextResponse.json(services);
  } catch (error) {
    console.error("Failed to fetch services:", error);
    return NextResponse.json([], { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const count = await prisma.service.count();

  const service = await prisma.service.create({
    data: {
      name: body.name,
      description: body.description || null,
      price: body.price || 0,
      imageUrl: body.imageUrl || null,
      badge: body.badge || null,
      active: true,
      order: count,
    },
  });

  return NextResponse.json(service);
}
