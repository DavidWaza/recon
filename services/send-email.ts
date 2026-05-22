import axios from "axios";

export async function subscribeUser(email: string) {
  const { data } = await axios.post("/api/send-random-email", { email});
  return data;
}

export async function sendToWaitlist(
  subject: string,
  message: string,
  isWeeklyRecommendation: boolean = false
) {
  const { data } = await axios.post("/api/admin/send-to-waitlist", {
    subject,
    message,
    isWeeklyRecommendation,
  });
  return data;
}