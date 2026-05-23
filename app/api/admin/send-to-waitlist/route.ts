import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { getTransporter } from "@/lib/nodemailer";

interface SendToWaitlistRequest {
  subject: string;
  message: string;
  isWeeklyRecommendation?: boolean;
}

export async function POST(req: Request) {
  try {
    const { subject, message, isWeeklyRecommendation } =
      (await req.json()) as SendToWaitlistRequest;

    // Validate inputs
    if (!subject || !subject.trim()) {
      return NextResponse.json(
        { error: "Subject is required" },
        { status: 400 }
      );
    }

    if (!message || !message.trim()) {
      return NextResponse.json(
        { error: "Message is required" },
        { status: 400 }
      );
    }

    // Fetch all subscriber users
    const { data: subscribers, error: subscriberError } = await supabaseAdmin
      .from("subscribers")
      .select("id, email, created_at")
      .order("created_at", { ascending: true });

    if (subscriberError) {
      console.error("Error fetching subscriber users:", subscriberError);
      return NextResponse.json(
        { error: "Failed to fetch subscriber users" },
        { status: 500 }
      );
    }

    if (!subscribers || subscribers.length === 0) {
      return NextResponse.json(
        {
          success: true,
          sent: 0,
          failed: 0,
          total: 0,
          message: "No subscribers found",
        },
        { status: 200 }
      );
    }

    // Send emails in batches
    let sent = 0;
    let failed = 0;
    const batchSize = 10;

    for (let i = 0; i < subscribers.length; i += batchSize) {
      const batch = subscribers.slice(i, i + batchSize);

      const emailPromises = batch.map((user) =>
        getTransporter()
          .sendMail({
            from: "recon <moviereconn@gmail.com>",
            to: user.email,
            subject: subject,
            html: generateEmailHTML(message, isWeeklyRecommendation),
          })
          .then(() => {
            sent++;
          })
          .catch((error) => {
            failed++;
            console.error(`Error sending email to ${user.email}:`, error);
          })
      );

      await Promise.all(emailPromises);

      // Add delay between batches to respect rate limits
      if (i + batchSize < subscribers.length) {
        await new Promise((resolve) => setTimeout(resolve, 500));
      }
    }

    return NextResponse.json(
      {
        success: true,
        sent,
        failed,
        total: subscribers.length,
        message: `Sent to ${sent} users. ${failed > 0 ? `${failed} failed.` : "All successful!"}`,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error sending to subscribers:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}


function generateEmailHTML(
  message: string,
  isWeeklyRecommendation: boolean = false
): string {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <style>
        @media only screen and (max-width: 600px) {
          .container { width: 100% !important; }
          h1 { font-size: 28px !important; }
          .message { font-size: 15px !important; }
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
                    🎬 ${isWeeklyRecommendation ? "This Week's Picks" : "recon updates and news"}
                  </h1>
                  <p style="margin: 12px 0 0; font-size: 16px; color: rgba(255,255,255,0.85); font-weight: 400;">
                    ${isWeeklyRecommendation ? "Your curated weekly selections" : ""}
                  </p>
                </td>
              </tr>

              <!-- Body -->
              <tr>
                <td style="background-color: #ffffff; padding: 48px 40px;">
                  <div class="message" style="margin: 0 0 36px; font-size: 16px; color: #2a2a2a; line-height: 1.8;">
                    ${message.replace(/\n/g, "<br/><br/>")}
                  </div>

                  <!-- CTA Button -->
                  <table width="100%" cellpadding="0" cellspacing="0" style="margin: 40px 0;">
                    <tr>
                      <td align="center">
                        <a href="https://recon.com.ng" style="display: inline-block; background-color: #1b1f3b; color: #ffffff; padding: 14px 36px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 15px; letter-spacing: 0.3px; box-shadow: 0 4px 12px rgba(27,31,59,0.3);">
                          Explore Picks
                        </a>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>

              <!-- Footer -->
              <tr>
                <td style="background-color: #f8f9fb; padding: 32px 40px; border-top: 1px solid #e5e5e5; text-align: center;">
                  <p style="margin: 0; font-size: 12px; color: #999999;">
                    © 2026 recon. All rights reserved.
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
