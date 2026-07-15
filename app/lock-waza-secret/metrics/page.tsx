import type { Metadata } from "next";
import { getDashboardData } from "@/lib/metrics/data";
import { MetricsDashboard } from "@/components/admin/metrics/MetricsDashboard";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Recon — Metrics",
  robots: { index: false, follow: false },
};

export default async function MetricsPage() {
  const data = await getDashboardData();
  return <MetricsDashboard data={data} />;
}
