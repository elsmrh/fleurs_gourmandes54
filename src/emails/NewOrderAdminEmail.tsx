import * as React from "react";

interface NewOrderAdminEmailProps {
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  prestationName: string;
  prestationPrice: number;
  quantity: number;
  total: number;
  eventDate: string;
  eventType?: string;
  flavors?: string;
  allergies?: string;
  message?: string;
  notes?: string;
  bookingId: string;
}

export function NewOrderAdminEmail({
  customerName,
  customerEmail,
  customerPhone,
  prestationName,
  prestationPrice,
  quantity,
  total,
  eventDate,
  eventType,
  flavors,
  allergies,
  message,
  notes,
  bookingId,
}: NewOrderAdminEmailProps) {
  return (
    <div style={{ fontFamily: "Georgia, serif", maxWidth: "600px", margin: "0 auto", padding: "30px", background: "#FDFBF9" }}>
      <h1 style={{ color: "#1a1a1a", fontSize: "24px", borderBottom: "2px solid #f9a8d4", paddingBottom: "16px" }}>
        Nouvelle commande reçue
      </h1>

      <h2 style={{ color: "#ec4899", marginTop: "24px" }}>Prestation</h2>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <tbody>
          <tr><td style={{ padding: "8px 0", color: "#666" }}>Bouquet</td><td style={{ fontWeight: "bold" }}>{prestationName}</td></tr>
          <tr><td style={{ padding: "8px 0", color: "#666" }}>Prix unitaire</td><td>{prestationPrice} €</td></tr>
          <tr><td style={{ padding: "8px 0", color: "#666" }}>Quantité</td><td>{quantity}</td></tr>
          <tr><td style={{ padding: "8px 0", color: "#666", fontWeight: "bold" }}>Total</td><td style={{ fontWeight: "bold", color: "#ec4899" }}>{total} €</td></tr>
        </tbody>
      </table>

      <h2 style={{ color: "#ec4899", marginTop: "24px" }}>Événement</h2>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <tbody>
          <tr><td style={{ padding: "8px 0", color: "#666" }}>Date souhaitée</td><td>{eventDate}</td></tr>
          {eventType && <tr><td style={{ padding: "8px 0", color: "#666" }}>Type d&apos;événement</td><td>{eventType}</td></tr>}
        </tbody>
      </table>

      <h2 style={{ color: "#ec4899", marginTop: "24px" }}>Personnalisation</h2>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <tbody>
          {flavors && <tr><td style={{ padding: "8px 0", color: "#666" }}>Parfums</td><td>{flavors}</td></tr>}
          {allergies && <tr><td style={{ padding: "8px 0", color: "#666" }}>⚠️ Allergies</td><td style={{ color: "#dc2626", fontWeight: "bold" }}>{allergies}</td></tr>}
          {message && <tr><td style={{ padding: "8px 0", color: "#666" }}>Message sur la création</td><td>{message}</td></tr>}
          {notes && <tr><td style={{ padding: "8px 0", color: "#666" }}>Notes</td><td>{notes}</td></tr>}
        </tbody>
      </table>

      <h2 style={{ color: "#ec4899", marginTop: "24px" }}>Client</h2>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <tbody>
          <tr><td style={{ padding: "8px 0", color: "#666" }}>Nom</td><td>{customerName}</td></tr>
          <tr><td style={{ padding: "8px 0", color: "#666" }}>Email</td><td><a href={`mailto:${customerEmail}`}>{customerEmail}</a></td></tr>
          <tr><td style={{ padding: "8px 0", color: "#666" }}>Téléphone</td><td><a href={`tel:${customerPhone}`}>{customerPhone}</a></td></tr>
        </tbody>
      </table>

      <p style={{ marginTop: "30px", padding: "16px", background: "#fdf2f8", borderRadius: "8px", color: "#666", fontSize: "14px" }}>
        Réf. commande : <strong>{bookingId}</strong>
      </p>
    </div>
  );
}

