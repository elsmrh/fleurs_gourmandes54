import * as React from "react";

interface ContactEmailProps {
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
}

export function ContactEmail({ name, email, phone, subject, message }: ContactEmailProps) {
  return (
    <div style={{ fontFamily: "Georgia, serif", maxWidth: "600px", margin: "0 auto", padding: "30px", background: "#FDFBF9" }}>
      <h1 style={{ color: "#1a1a1a", fontSize: "24px", borderBottom: "2px solid #f9a8d4", paddingBottom: "16px" }}>
        Nouveau message de contact
      </h1>

      <table style={{ width: "100%", borderCollapse: "collapse", marginTop: "20px" }}>
        <tbody>
          <tr><td style={{ padding: "8px 0", color: "#666", verticalAlign: "top", width: "120px" }}>Nom</td><td style={{ fontWeight: "bold" }}>{name}</td></tr>
          <tr><td style={{ padding: "8px 0", color: "#666", verticalAlign: "top" }}>Email</td><td><a href={`mailto:${email}`} style={{ color: "#ec4899" }}>{email}</a></td></tr>
          {phone && <tr><td style={{ padding: "8px 0", color: "#666", verticalAlign: "top" }}>Téléphone</td><td><a href={`tel:${phone}`}>{phone}</a></td></tr>}
          <tr><td style={{ padding: "8px 0", color: "#666", verticalAlign: "top" }}>Sujet</td><td style={{ fontWeight: "bold" }}>{subject}</td></tr>
        </tbody>
      </table>

      <div style={{ marginTop: "24px", padding: "20px", background: "white", borderRadius: "12px", border: "1px solid #f3e8ff" }}>
        <h3 style={{ color: "#ec4899", marginBottom: "12px", fontSize: "14px" }}>Message</h3>
        <p style={{ color: "#444", lineHeight: "1.8", whiteSpace: "pre-wrap" }}>{message}</p>
      </div>

      <p style={{ color: "#999", fontSize: "12px", textAlign: "center", marginTop: "30px" }}>
        Vous pouvez répondre directement à cet email pour contacter {name}.
      </p>
    </div>
  );
}

