import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

// PATCH /api/flavors/[id] — Activer/désactiver un parfum
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await request.json();

  const flavor = await prisma.flavor.update({
    where: { id },
    data: {
      ...(body.active !== undefined ? { active: body.active } : {}),
      ...(typeof body.name === "string" && body.name.trim() ? { name: body.name.trim() } : {}),
    },
  });
  return NextResponse.json(flavor);
}

// DELETE /api/flavors/[id] — Supprimer un parfum
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  await prisma.flavor.delete({ where: { id } });
  return NextResponse.json({ success: true });
}

