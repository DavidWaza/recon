import axios from "axios";

export type SiteFeedbackPayload = {
  message: string;
  rating?: number | null;
  email?: string;
};

export async function sendSiteFeedback(payload: SiteFeedbackPayload) {
  const { data } = await axios.post("/api/site-feedback", payload);
  return data as { success: true };
}
