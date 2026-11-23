import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const service = await prisma.service.findUnique({ where: { id } });
    if (!service) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(service);
  } catch {
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}


export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await request.json();

  const service = await prisma.service.update({
    where: { id },
    data: {
      ...(body.name !== undefined ? { name: body.name } : {}),
      ...(body.description !== undefined ? { description: body.description || null } : {}),
      ...(body.price !== undefined ? { price: body.price } : {}),
      ...(body.imageUrl !== undefined ? { imageUrl: body.imageUrl || null } : {}),
      ...(body.badge !== undefined ? { badge: body.badge || null } : {}),
      ...(body.active !== undefined ? { active: body.active } : {}),
    },
  });

  return NextResponse.json(service);
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  await prisma.service.delete({ where: { id } });
  
  return NextResponse.json({ success: true });
}

