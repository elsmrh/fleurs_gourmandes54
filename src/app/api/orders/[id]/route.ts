import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"
import { resend, FROM_EMAIL } from '@/lib/resend';
import { StatusUpdateEmail } from '@/emails/StatusUpdateEmail';
import { calculateBookingTotal } from "@/lib/orders"

const VALID_STATUSES = ["PENDING", "DEVIS_SENT", "CONFIRMED", "CANCELLED"]



export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { id } = await params
  const body = await request.json()
  // `notify` (par défaut true) : permet de changer le statut sans envoyer d'email au client.
  // Note : l'ancien champ `internalNote` a été retiré car il écrasait les notes laissées par le client.
  const { status, notify = true } = body as { status?: string; notify?: boolean }

  if (!status || !VALID_STATUSES.includes(status)) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 })
  }

  const booking = await prisma.booking.update({
    where: { id },
    data: { status },
  })

  // Gérer l'envoi d'emails selon le statut
  if (notify && (status === 'CONFIRMED' || status === 'DEVIS_SENT')) {
    try {
      const formattedDate = booking.eventDate.toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
      const total = calculateBookingTotal(booking);
      
      await resend.emails.send({
        from: FROM_EMAIL,
        to: booking.customerEmail,
        subject: status === 'CONFIRMED'
          ? '✅ Votre commande est confirmée — Fleurs Gourmandes 54'
          : '📄 Votre devis a été envoyé — Fleurs Gourmandes 54',
        react: StatusUpdateEmail({
          customerFirstName: booking.customerName.split(' ')[0],
          prestationName: booking.prestationName,
          quantity: booking.quantity,
          eventDate: formattedDate,
          total,
          status: status as 'CONFIRMED' | 'DEVIS_SENT',
        }),
      });
    } catch (e) {
      console.error('Email notification failed:', e);
    }
  }

  return NextResponse.json({ success: true, booking })
}

