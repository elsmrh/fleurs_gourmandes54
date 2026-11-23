import * as React from "react";

interface OrderConfirmationEmailProps {
  customerFirstName: string;
  prestationName: string;
  quantity: number;
  eventDate: string;
  total: number;
}

export function OrderConfirmationEmail({
  customerFirstName,
  prestationName,
  quantity,
  eventDate,
  total,
}: OrderConfirmationEmailProps) {
  return (
    <div style={{ fontFamily: "Georgia, serif", maxWidth: "600px", margin: "0 auto", padding: "30px", background: "#FDFBF9" }}>
      <h1 style={{ color: "#1a1a1a", fontSize: "24px", textAlign: "center" }}>
        🌸 Merci {customerFirstName} !
      </h1>

      <p style={{ color: "#666", textAlign: "center", fontSize: "16px", lineHeight: "1.8" }}>
        Votre demande pour <strong>{prestationName}</strong> a bien été enregistrée.<br />
        Nous vous enverrons votre devis personnalisé par email <strong>sous 24 à 48 heures</strong>.
      </p>

      <div style={{ margin: "30px 0", padding: "20px", background: "white", borderRadius: "12px", border: "1px solid #f3e8ff" }}>
        <h3 style={{ color: "#ec4899", marginBottom: "12px" }}>Récapitulatif</h3>
        <p style={{ margin: "4px 0", color: "#444" }}><strong>Bouquet :</strong> {prestationName}</p>
        <p style={{ margin: "4px 0", color: "#444" }}><strong>Quantité :</strong> {quantity}</p>
        <p style={{ margin: "4px 0", color: "#444" }}><strong>Date :</strong> {eventDate}</p>
        <p style={{ margin: "4px 0", color: "#444" }}><strong>Prix indicatif :</strong> {total} €</p>
      </div>

      <p style={{ color: "#999", fontSize: "13px", textAlign: "center", lineHeight: "1.6" }}>
        Si vous avez des questions, n&apos;hésitez pas à nous contacter sur{" "}
        <a href="https://www.instagram.com/fleurs_gourmandes54/" style={{ color: "#ec4899" }}>Instagram</a>{" "}
        ou par email.
      </p>

      <p style={{ color: "#ccc", fontSize: "11px", textAlign: "center", marginTop: "30px" }}>
        Fleurs Gourmandes 54 — Nancy &amp; alentours
      </p>
    </div>
  );
}

