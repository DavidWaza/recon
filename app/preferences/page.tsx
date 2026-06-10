import { PreferencesClient } from "@/components/preferences/PreferencesClient";

export const metadata = {
  title: "Your movie preferences · Recon",
  description: "Tell Recon what you love so your Friday picks get sharper.",
};

export default async function PreferencesPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;
  return <PreferencesClient initialToken={token ?? null} />;
}
