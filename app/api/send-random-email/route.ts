import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { sendEmail } from "@/lib/email";
import { welcomeEmailHtml } from "@/lib/emails/welcome";

export async function POST(req: Request) {
  const { email } = await req.json();

  // Validate
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: "Invalid email" }, { status: 400 });
  }

  // Insert into subscribers
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

  const token = (data?.unsubscribe_token as string | undefined) ?? data?.id;

  // Send confirmation email
  try {
    await sendEmail(
      email,
      "You're on the list — first picks land Friday",
      welcomeEmailHtml(email, token),
      token,
    );
  } catch (emailError) {
    console.error("Email error:", emailError);
  }

  return NextResponse.json({
    success: true,
    emailSent: true,
    data,
  });
}
