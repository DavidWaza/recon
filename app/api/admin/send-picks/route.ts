import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { sendEmail } from "@/lib/email";
import { weeklyPicksEmailHtml } from "@/lib/emails/weekly-picks";

type Subscriber = { id: string; email: string; unsubscribe_token?: string };

export async function POST(req: Request) {
  // Protect the route with a secret key
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.ADMIN_SECRET_KEY}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { picks, mode = "all", testEmail } = await req.json();

  if (!picks || picks.length === 0) {
    return NextResponse.json({ error: "No picks provided" }, { status: 400 });
  }

  // --- Test mode: render and send to one address only. No DB write, no
  // broadcast — lets the admin preview the real email in their own inbox. ---
  if (mode === "test") {
    if (!testEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(testEmail)) {
      return NextResponse.json(
        { error: "A valid test email is required" },
        { status: 400 },
      );
    }

    const { data: existing } = await supabaseAdmin
      .from("subscribers")
      .select("id, unsubscribe_token")
      .eq("email", testEmail)
      .maybeSingle();

    const token =
      (existing?.unsubscribe_token as string | undefined) ?? existing?.id;

    try {
      await sendEmail(
        testEmail,
        "Your movie picks for this Friday",
        weeklyPicksEmailHtml(testEmail, picks, token),
        token,
      );
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
      message: `Test sent to ${testEmail}`,
    });
  }

  // 1. Save picks to Supabase
  const { data: savedPicks, error: picksError } = await supabaseAdmin
    .from("weekly_picks")
    .insert(picks)
    .select();

  if (picksError) {
    console.error("Supabase picks error:", picksError);
    return NextResponse.json({ error: picksError.message }, { status: 500 });
  }

  // 2. Fetch all subscribers. Try to grab the unsubscribe token; fall back to
  // id-only if the Phase 1.1 columns aren't in place yet.
  let subscribers: Subscriber[] | null = null;

  const withToken = await supabaseAdmin
    .from("subscribers")
    .select("id, email, unsubscribe_token")
    .eq("subscribed", true);

  if (withToken.error) {
    const basic = await supabaseAdmin.from("subscribers").select("id, email");
    if (basic.error) {
      console.error("Supabase subscribers error:", basic.error);
      return NextResponse.json({ error: basic.error.message }, { status: 500 });
    }
    subscribers = basic.data as Subscriber[];
  } else {
    subscribers = withToken.data as Subscriber[];
  }

  if (!subscribers || subscribers.length === 0) {
    return NextResponse.json({
      success: true,
      sent: 0,
      message: "No active subscribers",
    });
  }

  // 3. Send emails in batches (nodemailer rate limit)
  const BATCH_SIZE = 50;
  let totalSent = 0;
  let totalFailed = 0;

  for (let i = 0; i < subscribers.length; i += BATCH_SIZE) {
    const batch = subscribers.slice(i, i + BATCH_SIZE);

    const emailPromises = batch.map((sub) => {
      const token = sub.unsubscribe_token ?? sub.id;
      return sendEmail(
        sub.email,
        "Your movie picks for this Friday",
        weeklyPicksEmailHtml(sub.email, picks, token),
        token,
      );
    });

    const results = await Promise.allSettled(emailPromises);
    results.forEach((r) => {
      if (r.status === "fulfilled") totalSent++;
      else {
        totalFailed++;
        console.error("Email failed:", r.reason);
      }
    });
  }

  // 4. Mark picks as sent
  await supabaseAdmin
    .from("weekly_picks")
    .update({ sent_at: new Date().toISOString() })
    .in(
      "id",
      savedPicks.map((p: { id: number }) => p.id),
    );

  return NextResponse.json({
    success: true,
    sent: totalSent,
    failed: totalFailed,
  });
}
