import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import nodemailer from "nodemailer";

const orderSchema = z.object({
  // Prestation
  prestationName: z.string().min(1),
  prestationPrice: z.number().positive(),
  quantity: z.number().int().min(1).default(1),
  // Event
  eventDate: z.string().min(1), // ISO date string
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
});

// Create email transporter
function createTransporter() {
  if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASSWORD) {
    return null;
  }
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || "465"),
    secure: true,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASSWORD,
    },
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const data = orderSchema.parse(body);

    // Save to database
    const booking = await prisma.booking.create({
      data: {
        customerName: data.customerName,
        customerEmail: data.customerEmail,
        customerPhone: data.customerPhone,
        prestationName: data.prestationName,
        prestationPrice: data.prestationPrice,
        quantity: data.quantity,
        eventDate: new Date(data.eventDate),
        eventType: data.eventType || null,
        flavors: data.flavors || null,
        allergies: data.allergies || null,
        message: data.message || null,
        notes: data.notes || null,
        status: "PENDING",
      },
    });

    // Try to send emails (non-blocking — order is saved even if email fails)
    const transporter = createTransporter();
    if (transporter) {
      const adminEmail = process.env.ADMIN_EMAIL || process.env.SMTP_USER;
      const total = data.prestationPrice * data.quantity;

      // Email to admin
      try {
        await transporter.sendMail({
          from: `"Fleurs Gourmandes 54" <${process.env.SMTP_USER}>`,
          to: adminEmail,
          subject: `🌸 Nouvelle commande — ${data.prestationName} (${data.customerName})`,
          html: `
            <div style="font-family: Georgia, serif; max-width: 600px; margin: 0 auto; padding: 30px; background: #FDFBF9;">
              <h1 style="color: #1a1a1a; font-size: 24px; border-bottom: 2px solid #f9a8d4; padding-bottom: 16px;">
                Nouvelle commande reçue
              </h1>
              
              <h2 style="color: #ec4899; margin-top: 24px;">Prestation</h2>
              <table style="width: 100%; border-collapse: collapse;">
                <tr><td style="padding: 8px 0; color: #666;">Bouquet</td><td style="font-weight: bold;">${data.prestationName}</td></tr>
                <tr><td style="padding: 8px 0; color: #666;">Prix unitaire</td><td>${data.prestationPrice} €</td></tr>
                <tr><td style="padding: 8px 0; color: #666;">Quantité</td><td>${data.quantity}</td></tr>
                <tr><td style="padding: 8px 0; color: #666; font-weight: bold;">Total</td><td style="font-weight: bold; color: #ec4899;">${total} €</td></tr>
              </table>

              <h2 style="color: #ec4899; margin-top: 24px;">Événement</h2>
              <table style="width: 100%; border-collapse: collapse;">
                <tr><td style="padding: 8px 0; color: #666;">Date souhaitée</td><td>${new Date(data.eventDate).toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</td></tr>
                ${data.eventType ? `<tr><td style="padding: 8px 0; color: #666;">Type d'événement</td><td>${data.eventType}</td></tr>` : ''}
              </table>

              <h2 style="color: #ec4899; margin-top: 24px;">Personnalisation</h2>
              <table style="width: 100%; border-collapse: collapse;">
                ${data.flavors ? `<tr><td style="padding: 8px 0; color: #666;">Parfums</td><td>${data.flavors}</td></tr>` : ''}
                ${data.allergies ? `<tr><td style="padding: 8px 0; color: #666;">⚠️ Allergies</td><td style="color: #dc2626; font-weight: bold;">${data.allergies}</td></tr>` : ''}
                ${data.message ? `<tr><td style="padding: 8px 0; color: #666;">Message sur la création</td><td>${data.message}</td></tr>` : ''}
                ${data.notes ? `<tr><td style="padding: 8px 0; color: #666;">Notes</td><td>${data.notes}</td></tr>` : ''}
              </table>

              <h2 style="color: #ec4899; margin-top: 24px;">Client</h2>
              <table style="width: 100%; border-collapse: collapse;">
                <tr><td style="padding: 8px 0; color: #666;">Nom</td><td>${data.customerName}</td></tr>
                <tr><td style="padding: 8px 0; color: #666;">Email</td><td><a href="mailto:${data.customerEmail}">${data.customerEmail}</a></td></tr>
                <tr><td style="padding: 8px 0; color: #666;">Téléphone</td><td><a href="tel:${data.customerPhone}">${data.customerPhone}</a></td></tr>
              </table>

              <p style="margin-top: 30px; padding: 16px; background: #fdf2f8; border-radius: 8px; color: #666; font-size: 14px;">
                Réf. commande : <strong>${booking.id}</strong>
              </p>
            </div>
          `,
        });
      } catch (emailErr) {
        console.error("Failed to send admin email:", emailErr);
      }

      // Email to client
      try {
        await transporter.sendMail({
          from: `"Fleurs Gourmandes 54" <${process.env.SMTP_USER}>`,
          to: data.customerEmail,
          subject: `Votre demande a bien été reçue — Fleurs Gourmandes 54`,
          html: `
            <div style="font-family: Georgia, serif; max-width: 600px; margin: 0 auto; padding: 30px; background: #FDFBF9;">
              <h1 style="color: #1a1a1a; font-size: 24px; text-align: center;">
                🌸 Merci ${data.customerName.split(' ')[0]} !
              </h1>
              
              <p style="color: #666; text-align: center; font-size: 16px; line-height: 1.8;">
                Votre demande pour <strong>${data.prestationName}</strong> a bien été enregistrée.<br/>
                Nous vous enverrons votre devis personnalisé par email <strong>sous 24 à 48 heures</strong>.
              </p>

              <div style="margin: 30px 0; padding: 20px; background: white; border-radius: 12px; border: 1px solid #f3e8ff;">
                <h3 style="color: #ec4899; margin-bottom: 12px;">Récapitulatif</h3>
                <p style="margin: 4px 0; color: #444;"><strong>Bouquet :</strong> ${data.prestationName}</p>
                <p style="margin: 4px 0; color: #444;"><strong>Quantité :</strong> ${data.quantity}</p>
                <p style="margin: 4px 0; color: #444;"><strong>Date :</strong> ${new Date(data.eventDate).toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                <p style="margin: 4px 0; color: #444;"><strong>Prix indicatif :</strong> ${total} €</p>
              </div>

              <p style="color: #999; font-size: 13px; text-align: center; line-height: 1.6;">
                Si vous avez des questions, n'hésitez pas à nous contacter sur 
                <a href="https://www.instagram.com/fleurs_gourmandes54/" style="color: #ec4899;">Instagram</a>
                ou par email.
              </p>

              <p style="color: #ccc; font-size: 11px; text-align: center; margin-top: 30px;">
                Fleurs Gourmandes 54 — Nancy & alentours
              </p>
            </div>
          `,
        });
      } catch (emailErr) {
        console.error("Failed to send client email:", emailErr);
      }
    }

    return NextResponse.json({ success: true, orderId: booking.id });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, errors: error.errors },
        { status: 400 }
      );
    }
    console.error("Order creation error:", error);
    return NextResponse.json(
      { success: false, error: "Une erreur est survenue" },
      { status: 500 }
    );
  }
}

