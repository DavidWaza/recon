import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { getTransporter } from "@/lib/nodemailer";

export async function POST(req: Request) {
  const { email } = await req.json();

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: "Invalid email" }, { status: 400 });
  }

  const { data, error } = await supabaseAdmin
    .from("subscribers")
    .insert([{ email }])
    .select();

  if (error) {
    console.error("Supabase error:", error);
    if (error.code === "23505") {
      return NextResponse.json(
        { error: "Already subscribed" },
        { status: 409 },
      );
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  try {
    await getTransporter().sendMail({
      from: "recon <moviereconn@gmail.com>",
      to: email,
      subject: "🎬 You're on the list — first picks land Friday!",
      html: `
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Weekly recon</title>
    <style>
      @media only screen and (max-width: 600px) {
        .container { width: 100% !important; }
        h1 { font-size: 28px !important; }
        .features { width: 100% !important; }
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
                <h1 style="margin: 0; font-size: 32px; font-weight: 700; color: #ffffff; line-height: 1.2; letter-spacing: -0.5px;">
                  🎬 Welcome to recon
                </h1>
                <p style="margin: 12px 0 0; font-size: 16px; color: rgba(255,255,255,0.85); font-weight: 400;">
                  Your Friday movie picks await
                </p>
              </td>
            </tr>

            <!-- Body -->
            <tr>
              <td style="background-color: #ffffff; padding: 48px 40px;">

                <!-- Greeting -->
                <p style="margin: 0 0 24px; font-size: 16px; color: #1a1a1a; line-height: 1.6;">
                  Hi ${email},
                </p>
                <p style="margin: 0 0 32px; font-size: 15px; color: #4a4a4a; line-height: 1.8;">
                  Welcome aboard! You're officially on our list. Every Friday we hand-pick the highest-rated movies on Netflix so you never waste time scrolling again.
                </p>

                <!-- What to expect -->
                <p style="margin: 0 0 24px; font-size: 12px; font-weight: 600; letter-spacing: 1px; text-transform: uppercase; color: #1b1f3b;">
                  What to expect
                </p>

                <!-- Feature 1 -->
                <table width="100%" cellpadding="0" cellspacing="0" class="features" style="margin-bottom: 24px;">
                  <tr>
                    <td width="48" valign="top">
                      <div style="width: 40px; height: 40px; background-color: #f0f2f5; border-radius: 10px; text-align: center; line-height: 40px; font-size: 18px;">
                        ⭐
                      </div>
                    </td>
                    <td style="padding-left: 16px;" valign="top">
                      <p style="margin: 0 0 4px; font-size: 14px; font-weight: 600; color: #1a1a1a;">Top-rated picks only</p>
                      <p style="margin: 0; font-size: 13px; color: #666666; line-height: 1.5;">Only movies rated 7.0+ on IMDb make the cut.</p>
                    </td>
                  </tr>
                </table>

                <!-- Feature 2 -->
                <table width="100%" cellpadding="0" cellspacing="0" class="features" style="margin-bottom: 24px;">
                  <tr>
                    <td width="48" valign="top">
                      <div style="width: 40px; height: 40px; background-color: #f0f2f5; border-radius: 10px; text-align: center; line-height: 40px; font-size: 18px;">
                        📅
                      </div>
                    </td>
                    <td style="padding-left: 16px;" valign="top">
                      <p style="margin: 0 0 4px; font-size: 14px; font-weight: 600; color: #1a1a1a;">Every Friday, no spam</p>
                      <p style="margin: 0; font-size: 13px; color: #666666; line-height: 1.5;">One email a week. That's it. Unsubscribe anytime.</p>
                    </td>
                  </tr>
                </table>

                <!-- Feature 3 -->
                <table width="100%" cellpadding="0" cellspacing="0" class="features" style="margin-bottom: 36px;">
                  <tr>
                    <td width="48" valign="top">
                      <div style="width: 40px; height: 40px; background-color: #f0f2f5; border-radius: 10px; text-align: center; line-height: 40px; font-size: 18px;">
                        🎯
                      </div>
                    </td>
                    <td style="padding-left: 16px;" valign="top">
                      <p style="margin: 0 0 4px; font-size: 14px; font-weight: 600; color: #1a1a1a;">Curated, not algorithmic</p>
                      <p style="margin: 0; font-size: 13px; color: #666666; line-height: 1.5;">Human-reviewed so every pick is worth your time.</p>
                    </td>
                  </tr>
                </table>

                <!-- CTA Button -->
                <table width="100%" cellpadding="0" cellspacing="0" style="margin: 40px 0;">
                  <tr>
                    <td align="center">
                      <a href="https://recon.com.ng" style="display: inline-block; background-color: #1b1f3b; color: #ffffff; padding: 14px 36px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 15px; letter-spacing: 0.3px; box-shadow: 0 4px 12px rgba(27,31,59,0.3);">
                        Browse This Week's Picks
                      </a>
                    </td>
                  </tr>
                </table>

              </td>
            </tr>

            <!-- Footer -->
            <tr>
              <td style="background-color: #f8f9fb; padding: 32px 40px; border-top: 1px solid #e5e5e5; text-align: center;">
                <p style="margin: 0 0 8px; font-size: 12px; color: #999999;">
                  © 2026 recon. All rights reserved.
                </p>
                <p style="margin: 0; font-size: 11px; color: #bbb;">
                  You're receiving this because you subscribed at recon.com.ng
                </p>
              </td>
            </tr>

          </table>
        </td>
      </tr>
    </table>
  </body>
  </html>
`,
    });
  } catch (emailError) {
    console.error("Email error:", emailError);
    return NextResponse.json({ success: true, emailSent: false, data });
  }

  return NextResponse.json({ success: true, emailSent: true, data });
}
