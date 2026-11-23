import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

/**
 * Liste blanche stricte des clés de configuration autorisées à être exposées publiquement.
 * Aucune clé interne (ex: max_orders_per_day, max_revenue_per_day, business_siret) n'est retournée.
 */
const PUBLIC_SETTINGS_WHITELIST = [
  "banner_active",
  "banner_text",
  "public_banner_active",
  "public_banner_text",
  "min_notice_hours",
  "MIN_NOTICE_HOURS",
] as const;

export async function GET() {
  try {
    const settings = await prisma.setting.findMany({
      where: {
        key: { in: [...PUBLIC_SETTINGS_WHITELIST] },
      },
    });

    const rawMap: Record<string, string> = {};
    settings.forEach((s) => {
      rawMap[s.key] = s.value;
    });

    const bannerActive = rawMap.banner_active ?? rawMap.public_banner_active ?? "false";
    const bannerText = rawMap.banner_text ?? rawMap.public_banner_text ?? "";
    const minNoticeHours = rawMap.min_notice_hours ?? rawMap.MIN_NOTICE_HOURS ?? "48";

    return NextResponse.json({
      banner_active: bannerActive,
      banner_text: bannerText,
      min_notice_hours: minNoticeHours,
      MIN_NOTICE_HOURS: minNoticeHours,
    });
  } catch {
    return NextResponse.json({ error: "Failed to fetch settings" }, { status: 500 });
  }
}
