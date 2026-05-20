import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { resend } from "@/lib/resend";

export async function POST(req: Request) {
  const { email } = await req.json();

  // Validate
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: "Invalid email" }, { status: 400 });
  }

  // Insert into waitlist
  const { data, error } = await supabaseAdmin
    .from("waitlist")
    .insert([{ email}])
    .select()
    .single();

  if (error) {
    console.error("Supabase error:", error);
    if (error.code === "23505") {
      return NextResponse.json({ error: "Already on the waitlist" }, { status: 409 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Get their position
  const { count } = await supabaseAdmin
    .from("waitlist")
    .select("*", { count: "exact", head: true })
    .lte("created_at", data.created_at);

  // Send confirmation email
  const { error: emailError } = await resend.emails.send({
    from: "Movie Picks <onboarding@resend.dev>",
    to: email,
    subject: "🎬 You're on the waitlist!",
    html: waitlistEmailTemplate( email, count ?? 1),
  });

  if (emailError) {
    console.error("Resend error:", emailError);
  }

  return NextResponse.json({
    success: true,
    position: count,
    data,
  });
}

function waitlistEmailTemplate(email: string, position: number) {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    </head>
    <body style="margin: 0; padding: 0; background-color: #0a0a0a; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #0a0a0a; padding: 40px 16px;">
        <tr>
          <td align="center">
            <table width="600" cellpadding="0" cellspacing="0" style="max-width: 600px; width: 100%; border-radius: 16px; overflow: hidden; border: 1px solid #1f1f1f;">

              <!-- Header -->
              <tr>
                <td style="background: linear-gradient(135deg, #1a0000 0%, #E50914 100%); padding: 40px;">
                  <h1 style="margin: 0; font-size: 28px; font-weight: 800; color: #ffffff;">
                    🎬 You're on the list!
                  </h1>
                  <p style="margin: 8px 0 0; font-size: 14px; color: rgba(255,255,255,0.7);">
                    We'll let you know when your spot is ready.
                  </p>
                </td>
              </tr>

              <!-- Body -->
              <tr>
                <td style="background-color: #141414; padding: 40px;">
                  <h2 style="margin: 0 0 12px; font-size: 20px; color: #ffffff;">
                    Hey ${email}, welcome aboard 👋
                  </h2>
                  <p style="margin: 0 0 32px; font-size: 15px; color: #a3a3a3; line-height: 1.7;">
                    You've secured your spot on the waitlist. We're rolling out access gradually and you'll be among the first to know when it's your turn.
                  </p>

                  <!-- Position Badge -->
                  <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 32px;">
                    <tr>
                      <td align="center" style="background-color: #1f1f1f; border-radius: 12px; padding: 24px;">
                        <p style="margin: 0 0 4px; font-size: 12px; font-weight: 700; letter-spacing: 2px; text-transform: uppercase; color: #a3a3a3;">
                          Your position
                        </p>
                        <p style="margin: 0; font-size: 48px; font-weight: 800; color: #E50914;">
                          #${position}
                        </p>
                        <p style="margin: 4px 0 0; font-size: 13px; color: #a3a3a3;">
                          in the waitlist
                        </p>
                      </td>
                    </tr>
                  </table>

                  <hr style="border: none; border-top: 1px solid #2a2a2a; margin: 0 0 32px;" />

                  <p style="margin: 0; font-size: 13px; color: #4a4a4a; text-align: center;">
                    You're receiving this because you joined the waitlist at
                    <strong style="color: #6a6a6a;">moviepicks.com</strong>
                  </p>
                </td>
              </tr>

            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;
}