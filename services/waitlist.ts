import axios from "axios";

export async function joinWaitlist(email: string, name?: string) {
  const { data } = await axios.post("/api/waitlist", { email});
  return data;
}