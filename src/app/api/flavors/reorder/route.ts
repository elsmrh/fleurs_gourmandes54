import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

// PUT /api/flavors/reorder — Réorganiser les parfums
export async function PUT(request: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const items: { id: string; order: number }[] = await request.json();

  try {
    await prisma.$transaction(
      items.map((item) =>
        prisma.flavor.update({
          where: { id: item.id },
          data: { order: item.order },
        })
      )
    );
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to reorder flavors", error);
    return NextResponse.json({ error: "Failed to reorder" }, { status: 500 });
  }
}

