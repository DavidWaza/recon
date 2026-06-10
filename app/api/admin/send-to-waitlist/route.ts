import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { sendEmail } from "@/lib/email";
import { newsEmailHtml } from "@/lib/emails/news";

type Subscriber = { id: string; email: string; unsubscribe_token?: string };

interface BroadcastRequest {
  subject: string;
  title?: string;
  body: string;
  images?: string[];
  ctaText?: string;
  ctaUrl?: string;
  /** "test" sends only to `testEmail`; "all" sends to every subscriber. */
  mode?: "test" | "all";
  testEmail?: string;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(req: Request) {
  // Protect the route (same scheme as /api/admin/send-picks).
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.ADMIN_SECRET_KEY}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let payload: BroadcastRequest;
  try {
    payload = (await req.json()) as BroadcastRequest;
  } catch {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  const {
    subject,
    title,
    body,
    images = [],
    ctaText,
    ctaUrl,
    mode = "all",
    testEmail,
  } = payload;

  if (!subject?.trim()) {
    return NextResponse.json({ error: "Subject is required" }, { status: 400 });
  }
  if (!body?.trim()) {
    return NextResponse.json({ error: "Message is required" }, { status: 400 });
  }

  const headline = title?.trim() || subject.trim();

  const renderHtml = (unsubscribeToken?: string) =>
    newsEmailHtml({
      title: headline,
      body,
      images,
      ctaText,
      ctaUrl,
      unsubscribeToken,
    });

  // --- Test mode: send a single email to the address the admin typed ---
  if (mode === "test") {
    if (!testEmail || !EMAIL_RE.test(testEmail)) {
      return NextResponse.json(
        { error: "A valid test email is required" },
        { status: 400 },
      );
    }

    // Use the real token if this address is already a subscriber.
    const { data: existing } = await supabaseAdmin
      .from("subscribers")
      .select("id, unsubscribe_token")
      .eq("email", testEmail)
      .maybeSingle();

    const token =
      (existing?.unsubscribe_token as string | undefined) ?? existing?.id;

    try {
      await sendEmail(testEmail, subject, renderHtml(token), token);
    } catch (error) {
      console.error("Test email failed:", error);
      return NextResponse.json(
        { error: "Failed to send test email" },
        { status: 500 },
      );
    }

    return NextResponse.json({
      success: true,
      sent: 1,
      failed: 0,
      total: 1,
      message: `Test sent to ${testEmail}`,
    });
  }

  // --- Broadcast mode: every active subscriber ---
  let subscribers: Subscriber[] | null = null;

  const withToken = await supabaseAdmin
    .from("subscribers")
    .select("id, email, unsubscribe_token")
    .eq("subscribed", true)
    .order("created_at", { ascending: true });

  if (withToken.error) {
    const basic = await supabaseAdmin
      .from("subscribers")
      .select("id, email")
      .order("created_at", { ascending: true });
    if (basic.error) {
      console.error("Error fetching subscribers:", basic.error);
      return NextResponse.json(
        { error: "Failed to fetch subscribers" },
        { status: 500 },
      );
    }
    subscribers = basic.data as Subscriber[];
  } else {
    subscribers = withToken.data as Subscriber[];
  }

  if (!subscribers || subscribers.length === 0) {
    return NextResponse.json({
      success: true,
      sent: 0,
      failed: 0,
      total: 0,
      message: "No subscribers found",
    });
  }

  let sent = 0;
  let failed = 0;
  const batchSize = 10;

  for (let i = 0; i < subscribers.length; i += batchSize) {
    const batch = subscribers.slice(i, i + batchSize);

    await Promise.all(
      batch.map((sub) => {
        const token = sub.unsubscribe_token ?? sub.id;
        return sendEmail(sub.email, subject, renderHtml(token), token)
          .then(() => {
            sent++;
          })
          .catch((error) => {
            failed++;
            console.error(`Error sending to ${sub.email}:`, error);
          });
      }),
    );

    // Respect Gmail's rate limits between batches (guide Phase 0.3).
    if (i + batchSize < subscribers.length) {
      await new Promise((resolve) => setTimeout(resolve, 500));
    }
  }

  return NextResponse.json({
    success: true,
    sent,
    failed,
    total: subscribers.length,
    message: `Sent to ${sent} subscriber${sent !== 1 ? "s" : ""}.${
      failed > 0 ? ` ${failed} failed.` : ""
    }`,
  });
}
