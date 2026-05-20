import { Resend } from "resend";

const resendKey = process.env.RESEND_API_KEY;

if (!resendKey) {
	throw new Error(
		"Missing RESEND_API_KEY. Add RESEND_API_KEY to .env.local before starting the app."
	);
}

export const resend = new Resend(resendKey);