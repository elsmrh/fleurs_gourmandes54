import * as React from "react";

interface StatusUpdateEmailProps {
  customerFirstName: string;
  prestationName: string;
  quantity: number;
  eventDate: string;
  total: number;
  status: "CONFIRMED" | "DEVIS_SENT";
}

export function StatusUpdateEmail({
  customerFirstName,
  prestationName,
  quantity,
  eventDate,
  total,
  status,
}: StatusUpdateEmailProps) {
  const isConfirmed = status === "CONFIRMED";

  return (
    <div style={{ fontFamily: "Georgia, serif", maxWidth: "600px", margin: "0 auto", padding: "30px", background: "#FDFBF9" }}>
      <h1 style={{ color: "#1a1a1a", fontSize: "24px", textAlign: "center" }}>
        {isConfirmed
          ? "🌸 Votre commande est confirmée !"
          : "🌸 Votre devis est prêt !"}
      </h1>

      <p style={{ color: "#666", textAlign: "center", fontSize: "16px", lineHeight: "1.8" }}>
        Bonjour {customerFirstName},<br />
        {isConfirmed ? (
          <>
            Nous avons le plaisir de vous informer que votre commande est officiellement confirmée.<br />
            Nous vous contacterons prochainement pour les détails de la livraison ou du retrait.
          </>
        ) : (
          <>
            Suite à votre demande, nous venons de vous envoyer un devis détaillé.<br />
            Merci de bien vouloir consulter votre boîte mail (et vos spams au cas où) pour le retrouver.
          </>
        )}
      </p>

      {isConfirmed && (
        <div style={{ margin: "30px 0", padding: "20px", background: "white", borderRadius: "12px", border: "1px solid #f3e8ff" }}>
          <p style={{ margin: "4px 0" }}><strong>Bouquet :</strong> {prestationName} × {quantity}</p>
          <p style={{ margin: "4px 0" }}><strong>Date :</strong> {eventDate}</p>
          <p style={{ margin: "4px 0" }}><strong>Total :</strong> {total} €</p>
        </div>
      )}

      {!isConfirmed && (
        <p style={{ color: "#666", textAlign: "center", fontSize: "16px", lineHeight: "1.8", marginTop: "20px" }}>
          Dès que vous l&apos;aurez validé, nous pourrons confirmer votre commande et bloquer la date !
        </p>
      )}

      <p style={{ color: "#999", fontSize: "13px", textAlign: "center", marginTop: "30px" }}>
        Fleurs Gourmandes 54 — Nancy &amp; alentours
      </p>
    </div>
  );
}

