import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { sendEmail } from "@/lib/email";
import { welcomeEmailHtml } from "@/lib/emails/welcome";

export async function POST(req: Request) {
  const { email } = await req.json();

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: "Invalid email" }, { status: 400 });
  }

  const { data, error } = await supabaseAdmin
    .from("subscribers")
    .insert([{ email }])
    .select()
    .single();

  if (error) {
    console.error("Supabase error:", error);
    if (error.code === "23505") {
      return NextResponse.json({ error: "Already subscribed" }, { status: 409 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // `unsubscribe_token` exists once the Phase 1.1 schema is applied; fall back
  // to the row id so the unsubscribe link always carries an opaque token.
  const token = (data?.unsubscribe_token as string | undefined) ?? data?.id;

  try {
    await sendEmail(
      email,
      "You're on the list — first picks land Friday",
      welcomeEmailHtml(email, token),
      token,
    );
  } catch (emailError) {
    console.error("Email error:", emailError);
    return NextResponse.json({ success: true, emailSent: false, data });
  }

  return NextResponse.json({ success: true, emailSent: true, data });
}
