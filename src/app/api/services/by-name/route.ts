import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const name = searchParams.get("name");

  if (!name) {
    return NextResponse.json({ error: "Missing name" }, { status: 400 });
  }

  try {
    const service = await prisma.service.findFirst({
      where: { name }
    });
    
    if (!service) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    
    return NextResponse.json(service);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch service" }, { status: 500 });
  }
}

