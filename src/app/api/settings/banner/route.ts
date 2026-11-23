import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export const dynamic = "force-dynamic"

export async function GET() {
  try {
    const activeSetting = await prisma.setting.findUnique({ where: { key: "public_banner_active" } })
    const textSetting = await prisma.setting.findUnique({ where: { key: "public_banner_text" } })
    
    return NextResponse.json({
      active: activeSetting?.value === "true",
      text: textSetting?.value || ""
    })
  } catch (error) {
    return NextResponse.json({ active: false, text: "" })
  }
}

