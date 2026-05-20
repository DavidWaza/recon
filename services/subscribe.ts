import axios from "axios";

export async function subscribeUser(email: string) {
  const { data } = await axios.post("/api/subscribe", { email});
  return data;
}