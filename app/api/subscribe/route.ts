import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { resend } from "@/lib/resend";

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

  const { error: emailError } = await resend.emails.send({
    from: "Recon recon <moviereconn@gmail.com>",
    to: email,
    subject: "🎬 You're on the list — first picks land Friday!",
    html: `
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Weekly recon</title>
  </head>
  <body style="margin: 0; padding: 0; background-color: #0a0a0a; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #0a0a0a; padding: 40px 16px;">
      <tr>
        <td align="center">
          <table width="600" cellpadding="0" cellspacing="0" style="max-width: 600px; width: 100%; border-radius: 16px; overflow: hidden; border: 1px solid #1f1f1f;">

            <!-- Header -->
            <tr>
              <td style="background: linear-gradient(135deg, #1a0000 0%, #E50914 100%); padding: 40px 40px 32px;">
                <p style="margin: 0 0 16px; font-size: 13px; font-weight: 600; letter-spacing: 3px; text-transform: uppercase; color: rgba(255,255,255,0.6);">
                  Weekly Newsletter
                </p>
                <h1 style="margin: 0; font-size: 32px; font-weight: 800; color: #ffffff; line-height: 1.2; letter-spacing: -0.5px;">
                  🎬 Your Friday<br/>recon
                </h1>
              </td>
            </tr>

            <!-- Body -->
            <tr>
              <td style="background-color: #141414; padding: 40px;">

                <!-- Greeting -->
                <h2 style="margin: 0 0 12px; font-size: 22px; font-weight: 700; color: #ffffff;">
                  You're officially on the list.
                </h2>
                <p style="margin: 0 0 32px; font-size: 15px; line-height: 1.7; color: #a3a3a3;">
                  Hey <strong style="color: #ffffff;">${email}</strong>, welcome aboard. Every Friday we hand-pick the highest-rated movies on Netflix so you never waste time scrolling again.
                </p>

                <!-- Divider -->
                <hr style="border: none; border-top: 1px solid #2a2a2a; margin: 0 0 32px;" />

                <!-- What to expect -->
                <p style="margin: 0 0 16px; font-size: 11px; font-weight: 700; letter-spacing: 2px; text-transform: uppercase; color: #E50914;">
                  What to expect
                </p>

                <!-- Feature 1 -->
                <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 16px;">
                  <tr>
                    <td width="48" valign="top">
                      <div style="width: 40px; height: 40px; background-color: #1f1f1f; border-radius: 10px; text-align: center; line-height: 40px; font-size: 18px;">
                        ⭐
                      </div>
                    </td>
                    <td style="padding-left: 16px;" valign="top">
                      <p style="margin: 0 0 4px; font-size: 14px; font-weight: 600; color: #ffffff;">Top-rated picks only</p>
                      <p style="margin: 0; font-size: 13px; color: #a3a3a3; line-height: 1.5;">Only movies rated 7.0+ on IMDb make the cut.</p>
                    </td>
                  </tr>
                </table>

                <!-- Feature 2 -->
                <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 16px;">
                  <tr>
                    <td width="48" valign="top">
                      <div style="width: 40px; height: 40px; background-color: #1f1f1f; border-radius: 10px; text-align: center; line-height: 40px; font-size: 18px;">
                        📅
                      </div>
                    </td>
                    <td style="padding-left: 16px;" valign="top">
                      <p style="margin: 0 0 4px; font-size: 14px; font-weight: 600; color: #ffffff;">Every Friday, no spam</p>
                      <p style="margin: 0; font-size: 13px; color: #a3a3a3; line-height: 1.5;">One email a week. That's it. Unsubscribe anytime.</p>
                    </td>
                  </tr>
                </table>

                <!-- Feature 3 -->
                <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 32px;">
                  <tr>
                    <td width="48" valign="top">
                      <div style="width: 40px; height: 40px; background-color: #1f1f1f; border-radius: 10px; text-align: center; line-height: 40px; font-size: 18px;">
                        🎯
                      </div>
                    </td>
                    <td style="padding-left: 16px;" valign="top">
                      <p style="margin: 0 0 4px; font-size: 14px; font-weight: 600; color: #ffffff;">Curated, not algorithmic</p>
                      <p style="margin: 0; font-size: 13px; color: #a3a3a3; line-height: 1.5;">Human-reviewed so every pick is worth your time.</p>
                    </td>
                  </tr>
                </table>

                <!-- CTA Button -->
                <table width="100%" cellpadding="0" cellspacing="0">
                  <tr>
                    <td align="center">
                      <a href="https://recon-ruby.vercel.app"
                        style="display: inline-block; background-color: #E50914; color: #ffffff; text-decoration: none; font-size: 15px; font-weight: 700; padding: 14px 36px; border-radius: 8px; letter-spacing: 0.3px;">
                        Browse This Week's Picks →
                      </a>
                    </td>
                  </tr>
                </table>

              </td>
            </tr>

            <!-- Footer -->
            <tr>
              <td style="background-color: #0f0f0f; padding: 24px 40px; border-top: 1px solid #1f1f1f;">
                <p style="margin: 0 0 8px; font-size: 12px; color: #4a4a4a; text-align: center; line-height: 1.6;">
                  You're receiving this because you subscribed at <strong style="color: #6a6a6a;">recon.com.ng</strong>
                </p>
                <p style="margin: 0; font-size: 12px; text-align: center;">
                  <a href="#" style="color: #4a4a4a; text-decoration: underline;">Unsubscribe</a>
                  <span style="color: #2a2a2a; margin: 0 8px;">|</span>
                  <a href="#" style="color: #4a4a4a; text-decoration: underline;">View in browser</a>
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

  if (emailError) {
    console.error("Resend error:", emailError);
    return NextResponse.json({ success: true, emailSent: false, data });
  }

  return NextResponse.json({ success: true, emailSent: true, data });
}
