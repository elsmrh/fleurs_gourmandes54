"use server";

import { headers } from "next/headers";
import { resend, FROM_EMAIL } from "@/lib/resend";
import { ContactEmail } from "@/emails/ContactEmail";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

// Rate-limit : 3 messages de contact maximum par tranche de 10 minutes par IP
const CONTACT_MAX_ATTEMPTS = 3;
const CONTACT_WINDOW_MS = 10 * 60 * 1000;

export async function submitContact(prevState: unknown, formData: FormData) {
  try {
    // 1. Vérification du champ Honeypot anti-bot (invisible pour les utilisateurs humains)
    const honeypot = (formData.get("website") as string) || "";
    if (honeypot.trim().length > 0) {
      // On renvoie un succès silencieux pour ne pas alerter le robot spammeur, sans envoyer d'email
      return { success: "Votre message a bien été envoyé !" };
    }

    // 2. Rate-Limiting par adresse IP
    const headersList = await headers();
    const ip = getClientIp(headersList);
    const rate = checkRateLimit(`contact:${ip}`, CONTACT_MAX_ATTEMPTS, CONTACT_WINDOW_MS);
    if (!rate.allowed) {
      return {
        error: "Vous avez envoyé trop de messages récemment. Merci de patienter quelques minutes avant de réessayer.",
      };
    }

    const name = (formData.get("name") as string)?.trim();
    const email = (formData.get("email") as string)?.trim();
    const phone = (formData.get("phone") as string)?.trim();
    const subject = (formData.get("subject") as string)?.trim();
    const message = (formData.get("message") as string)?.trim();

    if (!name || !email || !subject || !message) {
      return { error: "Veuillez remplir tous les champs obligatoires." };
    }

    const adminEmail = process.env.ADMIN_EMAIL || "contact@fleurs-gourmandes54.fr";

    await resend.emails.send({
      from: FROM_EMAIL,
      to: adminEmail,
      replyTo: email,
      subject: `Nouveau message de contact : ${subject}`,
      react: ContactEmail({ name, email, phone, subject, message }),
    });

    return { success: "Votre message a bien été envoyé !" };
  } catch (error) {
    console.error("Erreur envoi email contact:", error);
    return { error: "Une erreur est survenue lors de l'envoi de votre message." };
  }
}
