import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { resend, FROM_EMAIL } from "@/lib/resend";
import { NewOrderAdminEmail } from "@/emails/NewOrderAdminEmail";
import { OrderConfirmationEmail } from "@/emails/OrderConfirmationEmail";
import { calculateBookingTotal } from "@/lib/orders";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

// Rate-limit : 5 créations de commandes maximum par tranche de 10 minutes par IP
const ORDER_MAX_ATTEMPTS = 5;
const ORDER_WINDOW_MS = 10 * 60 * 1000;

const orderSchema = z.object({
  // Prestation (catalogue dynamique depuis la table Service)
  prestationName: z.string().min(1, "La prestation est requise"),
  quantity: z.number().int().min(1).default(1),
  // Event
  eventDate: z.string().min(1, "La date de l'événement est requise"),
  eventType: z.string().optional(),
  // Personalisation
  flavors: z.string().optional(),
  allergies: z.string().optional(),
  message: z.string().optional(),
  notes: z.string().optional(),
  // Client
  customerName: z.string().min(2, "Le nom est requis"),
  customerEmail: z.string().email("Email invalide"),
  customerPhone: z.string().min(8, "Numéro de téléphone invalide"),
  // Le montant de la remise n'est JAMAIS accepté depuis le client :
  // il est recalculé ici à partir du code promo.
  promoCode: z.string().optional(),
});

/**
 * Vérifie le code promo et calcule la remise côté serveur.
 * Renvoie null si le code est absent ou invalide (la commande passe alors sans remise).
 */
async function resolvePromo(code: string | undefined, rawTotal: number) {
  if (!code) return null;
  const promo = await prisma.promoCode.findUnique({
    where: { code: code.trim().toUpperCase() },
  });
  if (!promo || !promo.active) return null;
  if (promo.maxUses && promo.usesCount >= promo.maxUses) return null;
  if (promo.expiresAt && promo.expiresAt < new Date()) return null;

  const raw =
    promo.type === "PERCENTAGE" ? rawTotal * (promo.value / 100) : promo.value;
  const discountAmount = Math.round(Math.min(Math.max(raw, 0), rawTotal) * 100) / 100;
  return { code: promo.code, discountAmount };
}

export async function POST(request: NextRequest) {
  try {
    // 0. Protection Anti-Spam (Rate-Limiting : 5 requêtes / 10 min par IP)
    const ip = getClientIp(request.headers);
    const rate = checkRateLimit(`orders:${ip}`, ORDER_MAX_ATTEMPTS, ORDER_WINDOW_MS);
    if (!rate.allowed) {
      return NextResponse.json(
        {
          success: false,
          error: "Trop de demandes de commande envoyées récemment. Veuillez patienter quelques minutes avant de réessayer.",
        },
        { status: 429 }
      );
    }

    const body = await request.json();
    const data = orderSchema.parse(body);

    // 1. Validation dynamique de la prestation depuis la DB (aucune liste codée en dur)
    const service = await prisma.service.findFirst({
      where: { name: data.prestationName.trim(), active: true },
    });
    if (!service) {
      return NextResponse.json(
        { success: false, error: "Prestation introuvable ou actuellement indisponible." },
        { status: 400 }
      );
    }

    // 2. Normalisation et validation du format de la date ("YYYY-MM-DD")
    const eventDateStr = data.eventDate.split("T")[0];
    if (!/^\d{4}-\d{2}-\d{2}$/.test(eventDateStr)) {
      return NextResponse.json(
        { success: false, error: "Format de date invalide." },
        { status: 400 }
      );
    }

    const parsedLocalDate = new Date(`${eventDateStr}T00:00:00`);
    const dayStartUtc = new Date(`${eventDateStr}T00:00:00.000Z`);
    const dayEndUtc = new Date(`${eventDateStr}T23:59:59.999Z`);

    if (Number.isNaN(parsedLocalDate.getTime())) {
      return NextResponse.json(
        { success: false, error: "Date d'événement invalide." },
        { status: 400 }
      );
    }

    // 3. Récupération des règles métier depuis la table Setting
    const settings = await prisma.setting.findMany({
      where: {
        key: {
          in: [
            "MIN_NOTICE_HOURS",
            "min_notice_hours",
            "max_orders_per_day",
            "max_revenue_per_day",
          ],
        },
      },
    });
    const settingsMap = new Map(settings.map((s) => [s.key, s.value?.trim()]));

    const rawMinNotice =
      settingsMap.get("MIN_NOTICE_HOURS") || settingsMap.get("min_notice_hours");
    const minNoticeHours =
      rawMinNotice && !Number.isNaN(parseInt(rawMinNotice, 10))
        ? parseInt(rawMinNotice, 10)
        : 48;

    const rawMaxOrders = settingsMap.get("max_orders_per_day");
    const maxOrders =
      rawMaxOrders && !Number.isNaN(parseInt(rawMaxOrders, 10)) && parseInt(rawMaxOrders, 10) > 0
        ? parseInt(rawMaxOrders, 10)
        : null;

    const rawMaxRevenue = settingsMap.get("max_revenue_per_day");
    const maxRevenue =
      rawMaxRevenue && !Number.isNaN(parseFloat(rawMaxRevenue)) && parseFloat(rawMaxRevenue) > 0
        ? parseFloat(rawMaxRevenue)
        : null;

    // 4. Vérification du délai minimum de préavis (min_notice_hours)
    const minAllowedDate = new Date();
    minAllowedDate.setHours(minAllowedDate.getHours() + minNoticeHours);
    minAllowedDate.setHours(0, 0, 0, 0);

    if (parsedLocalDate < minAllowedDate) {
      return NextResponse.json(
        {
          success: false,
          error: `La date choisie doit respecter un délai minimum de ${minNoticeHours}h à l'avance.`,
        },
        { status: 400 }
      );
    }

    // 5. Vérification des dates bloquées manuellement (Availability)
    const blockedAvailability = await prisma.availability.findFirst({
      where: {
        isBlocked: true,
        date: {
          gte: dayStartUtc,
          lte: dayEndUtc,
        },
      },
    });

    if (blockedAvailability) {
      return NextResponse.json(
        {
          success: false,
          error: "Cette date est complète ou fermée à la réservation. Merci d'en choisir une autre.",
        },
        { status: 400 }
      );
    }

    // 6. Vérification des plafonds journaliers (max_orders_per_day & max_revenue_per_day)
    if (maxOrders !== null || maxRevenue !== null) {
      const bookingsOnDate = await prisma.booking.findMany({
        where: {
          eventDate: {
            gte: dayStartUtc,
            lte: dayEndUtc,
          },
          status: { not: "CANCELLED" },
        },
      });

      const currentOrdersCount = bookingsOnDate.length;
      const currentDayRevenue = bookingsOnDate.reduce(
        (sum, b) => sum + calculateBookingTotal(b),
        0
      );

      if (maxOrders !== null && currentOrdersCount >= maxOrders) {
        return NextResponse.json(
          {
            success: false,
            error: "Le nombre maximum de commandes pour cette date est atteint. Merci de choisir une autre date.",
          },
          { status: 400 }
        );
      }

      if (maxRevenue !== null && currentDayRevenue >= maxRevenue) {
        return NextResponse.json(
          {
            success: false,
            error: "Notre planning de production est complet pour cette date. Merci de choisir une autre date.",
          },
          { status: 400 }
        );
      }
    }

    // 7. Calcul du prix et de la remise promotionnelle côté serveur
    const prestationPrice = service.price;
    const rawTotal = prestationPrice * data.quantity;

    const promo = await resolvePromo(data.promoCode, rawTotal);
    const discountAmount = promo?.discountAmount ?? 0;

    if (promo) {
      await prisma.promoCode
        .update({
          where: { code: promo.code },
          data: { usesCount: { increment: 1 } },
        })
        .catch(() => {});
    }

    // 8. Enregistrement de la commande en base de données
    let notes = data.notes || "";
    if (promo) {
      notes = `[CODE PROMO UTILISÉ : ${promo.code}]\n${notes}`;
    }

    const booking = await prisma.booking.create({
      data: {
        customerName: data.customerName.trim(),
        customerEmail: data.customerEmail.trim(),
        customerPhone: data.customerPhone.trim(),
        prestationName: service.name,
        prestationPrice: prestationPrice,
        quantity: data.quantity,
        eventDate: dayStartUtc,
        eventType: data.eventType || null,
        flavors: data.flavors || null,
        allergies: data.allergies || null,
        message: data.message || null,
        notes: notes,
        discountAmount,
        status: "PENDING",
      },
    });

    // 9. Envoi des emails de notification (non-bloquant)
    const adminEmail = process.env.ADMIN_EMAIL || "contact@fleurs-gourmandes54.fr";
    const formattedDate = parsedLocalDate.toLocaleDateString("fr-FR", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
    const total = Math.max(0, rawTotal - discountAmount);

    try {
      await resend.emails.send({
        from: FROM_EMAIL,
        to: adminEmail,
        subject: `🌸 Nouvelle commande — ${service.name} (${data.customerName})`,
        react: NewOrderAdminEmail({
          customerName: data.customerName,
          customerEmail: data.customerEmail,
          customerPhone: data.customerPhone,
          prestationName: service.name,
          prestationPrice: prestationPrice,
          quantity: data.quantity,
          total,
          eventDate: formattedDate,
          eventType: data.eventType,
          flavors: data.flavors,
          allergies: data.allergies,
          message: data.message,
          notes: data.notes,
          bookingId: booking.id,
        }),
      });
    } catch (emailErr) {
      console.error("Failed to send admin email:", emailErr);
    }

    try {
      await resend.emails.send({
        from: FROM_EMAIL,
        to: data.customerEmail,
        subject: "Votre demande a bien été reçue — Fleurs Gourmandes 54",
        react: OrderConfirmationEmail({
          customerFirstName: data.customerName.split(" ")[0],
          prestationName: service.name,
          quantity: data.quantity,
          eventDate: formattedDate,
          total,
        }),
      });
    } catch (emailErr) {
      console.error("Failed to send client email:", emailErr);
    }

    return NextResponse.json({ success: true, orderId: booking.id });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: error.errors[0]?.message || "Données de commande invalides.",
          errors: error.errors,
        },
        { status: 400 }
      );
    }
    console.error("Order creation error:", error);
    return NextResponse.json(
      { success: false, error: "Une erreur est survenue lors de l'enregistrement de la commande." },
      { status: 500 }
    );
  }
}
