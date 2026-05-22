import { DashboardClient } from "@/components/dashboard/DashboardClient";

export const metadata = {
  title: "Dashboard · Recon",
  description: "Your weekly curated recon",
};

export default function DashboardPage() {
  return <DashboardClient />;
}
