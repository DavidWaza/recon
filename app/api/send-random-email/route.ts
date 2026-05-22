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
    from: "recon <onboarding@resend.dev>",
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
      <style>
        @media only screen and (max-width: 600px) {
          .container { width: 100% !important; }
          h1 { font-size: 24px !important; }
          .position-number { font-size: 36px !important; }
        }
      </style>
    </head>
    <body style="margin: 0; padding: 0; background-color: #f5f5f5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 32px 16px;">
        <tr>
          <td align="center">
            <table class="container" width="600" cellpadding="0" cellspacing="0" style="max-width: 600px; width: 100%; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.07); background-color: #ffffff;">

              <!-- Header -->
              <tr>
                <td style="background-color: #1b1f3b; padding: 48px 40px; text-align: center;">
                  <h1 style="margin: 0; font-size: 32px; font-weight: 700; color: #ffffff; letter-spacing: -0.5px;">
                    🎬 You're In!
                  </h1>
                  <p style="margin: 12px 0 0; font-size: 16px; color: rgba(255,255,255,0.8); font-weight: 400;">
                    Welcome to recon
                  </p>
                </td>
              </tr>

              <!-- Body -->
              <tr>
                <td style="background-color: #ffffff; padding: 48px 40px;">
                  <p style="margin: 0 0 24px; font-size: 16px; color: #1a1a1a; line-height: 1.6;">
                    Hi there,
                  </p>
                  <p style="margin: 0 0 28px; font-size: 15px; color: #4a4a4a; line-height: 1.8;">
                    Thanks for joining our waitlist! You've been added to our exclusive community. We're rolling out access to curated movie recommendations, and you're in line to get early access.
                  </p>

                  <!-- Position Badge -->
                  <table width="100%" cellpadding="0" cellspacing="0" style="margin: 40px 0;">
                    <tr>
                      <td align="center" style="background: linear-gradient(135deg, #1b1f3b 0%, #2a2e52 100%); border-radius: 12px; padding: 36px; text-align: center;">
                        <p style="margin: 0 0 8px; font-size: 12px; font-weight: 600; letter-spacing: 1px; text-transform: uppercase; color: rgba(255,255,255,0.7);">
                          Your Waitlist Position
                        </p>
                        <p class="position-number" style="margin: 0; font-size: 48px; font-weight: 800; color: #ffffff; text-shadow: 0 2px 4px rgba(0,0,0,0.2);">
                          #${position}
                        </p>
                      </td>
                    </tr>
                  </table>

                  <p style="margin: 0 0 32px; font-size: 15px; color: #4a4a4a; line-height: 1.8;">
                    We'll notify you as soon as your access is ready. In the meantime, stay tuned for updates about new features and recommendations coming to recon.
                  </p>

                  <!-- CTA Button -->
                  <table width="100%" cellpadding="0" cellspacing="0" style="margin: 36px 0;">
                    <tr>
                      <td align="center">
                        <a href="https://recon.com.ng" style="display: inline-block; background-color: #1b1f3b; color: #ffffff; padding: 14px 36px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 15px; letter-spacing: 0.3px; box-shadow: 0 4px 12px rgba(27,31,59,0.3); transition: all 0.2s ease;">
                          Visit recon
                        </a>
                      </td>
                    </tr>
                  </table>

                  <hr style="border: none; border-top: 1px solid #e5e5e5; margin: 40px 0;" />

                  <p style="margin: 0; font-size: 13px; color: #999999; text-align: center; line-height: 1.6;">
                    Questions? We're here to help. Reply to this email or visit our support page.
                  </p>
                </td>
              </tr>

              <!-- Footer -->
              <tr>
                <td style="background-color: #f8f9fb; padding: 32px 40px; border-top: 1px solid #e5e5e5; text-align: center;">
                  <p style="margin: 0 0 12px; font-size: 12px; color: #999999;">
                    © 2026 recon. All rights reserved.
                  </p>
                  <p style="margin: 0; font-size: 11px; color: #bbb;">
                    You received this because you joined our waitlist at recon.com.ng
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