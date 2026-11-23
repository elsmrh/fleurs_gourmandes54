import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    // 1. Récupérer les dates bloquées manuellement
    const availabilities = await prisma.availability.findMany({
      where: { isBlocked: true }
    });
    const manuallyBlockedDates = availabilities.map(a => a.date.toISOString().split('T')[0]);

    // 2. Récupérer les seuils de blocage automatiques
    const maxOrdersSetting = await prisma.setting.findUnique({ where: { key: "max_orders_per_day" } })
    const maxRevenueSetting = await prisma.setting.findUnique({ where: { key: "max_revenue_per_day" } })
    
    const maxOrders = maxOrdersSetting?.value ? parseInt(maxOrdersSetting.value, 10) : null
    const maxRevenue = maxRevenueSetting?.value ? parseFloat(maxRevenueSetting.value) : null

    const autoBlockedDates = new Set<string>()

    // Seulement si un des seuils est actif, on calcule
    if (maxOrders || maxRevenue) {
      const futureBookings = await prisma.booking.findMany({
        where: {
          eventDate: { gte: new Date() },
          status: { not: "CANCELLED" }
        }
      })

      const dailyStats = new Map<string, { count: number, revenue: number }>()

      futureBookings.forEach(b => {
        const dateStr = b.eventDate.toISOString().split('T')[0]
        if (!dailyStats.has(dateStr)) {
          dailyStats.set(dateStr, { count: 0, revenue: 0 })
        }
        const stats = dailyStats.get(dateStr)!
        stats.count += 1
        
        let suppsTotal = 0
        try {
          const supps = typeof b.supplements === 'string' ? JSON.parse(b.supplements) : b.supplements
          if (Array.isArray(supps)) suppsTotal = supps.reduce((acc, s) => acc + (Number(s.price) || 0), 0)
        } catch (e) {}
        
        const total = (b.prestationPrice * b.quantity) + suppsTotal - (b.discountAmount || 0)
        stats.revenue += total
      })

      dailyStats.forEach((stats, dateStr) => {
        if ((maxOrders && stats.count >= maxOrders) || (maxRevenue && stats.revenue >= maxRevenue)) {
          autoBlockedDates.add(dateStr)
        }
      })
    }

    const finalBlockedDates = Array.from(new Set([...manuallyBlockedDates, ...Array.from(autoBlockedDates)]))

    return NextResponse.json(finalBlockedDates);
  } catch (error) {
    console.error("API error availabilities:", error)
    return NextResponse.json({ error: "Failed to fetch availabilities" }, { status: 500 });
  }
}
