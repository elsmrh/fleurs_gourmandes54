import { Resend } from "resend";

// Le constructeur de Resend lève une erreur si la clé est absente. Pendant `next build`
// (build Docker), les variables d'environnement runtime ne sont pas disponibles :
// on utilise donc une clé factice uniquement pour permettre l'import du module.
// En production, la vraie clé est lue depuis .env au démarrage du conteneur ;
// sans clé valide, l'envoi échoue proprement (les appels sont déjà dans des try/catch).
const apiKey = process.env.RESEND_API_KEY || "re_build_placeholder";

if (!process.env.RESEND_API_KEY && process.env.NODE_ENV === "production" && process.env.NEXT_PHASE !== "phase-production-build") {
  console.warn("[resend] RESEND_API_KEY manquante : aucun email ne pourra être envoyé.");
}

export const resend = new Resend(apiKey);

export const FROM_EMAIL =
  process.env.RESEND_FROM_EMAIL || "Fleurs Gourmandes 54 <onboarding@resend.dev>";
