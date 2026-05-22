import * as React from "react";

interface WelcomeEmailProps {
  email: string;
}

export function WelcomeEmail({ email }: WelcomeEmailProps) {
  return (
    <div style={{ fontFamily: "Arial, sans-serif", maxWidth: "600px", margin: "0 auto" }}>
      <h1 style={{ color: "#ffffff", backgroundColor: "#E50914", padding: "20px", margin: 0 }}>
        🎬 Weekly recon
      </h1>
      <div style={{ padding: "24px", backgroundColor: "#141414", color: "#ffffff" }}>
        <h2>You're on the list!</h2>
        <p style={{ color: "#a3a3a3" }}>
          Hey {email}, thanks for subscribing. Every Friday you'll get the
          best Netflix picks rated on IMDb — curated just for you.
        </p>
        <div style={{ marginTop: "24px", padding: "16px", backgroundColor: "#1f1f1f", borderRadius: "8px" }}>
          <p style={{ margin: 0, color: "#a3a3a3", fontSize: "14px" }}>
            📅 Expect your first picks this Friday
          </p>
        </div>
        <p style={{ marginTop: "24px", color: "#a3a3a3", fontSize: "12px" }}>
          You're receiving this because you signed up at recon.com.ng.
          <a href="#" style={{ color: "#E50914" }}> Unsubscribe</a>
        </p>
      </div>
    </div>
  );
}