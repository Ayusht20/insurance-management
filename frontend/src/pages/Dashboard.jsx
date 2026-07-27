import { useEffect, useState } from "react";
import Layout from "../components/Layout";
import { getDashboardSummary } from "../services/reportService";

export default function Dashboard() {
  const [summary, setSummary] = useState(null);

  useEffect(() => {
    getDashboardSummary().then((res) => setSummary(res.data)).catch(() => {});
  }, []);

  if (!summary) return <Layout><p>Loading...</p></Layout>;

  const cards = [
    { label: "Total Customers", value: summary.total_customers },
    { label: "Active Policies", value: summary.total_active_policies },
    { label: "Expired Policies", value: summary.total_expired_policies },
    { label: "Cancelled Policies", value: summary.total_cancelled_policies },
    { label: "Pending Claims", value: summary.total_pending_claims },
    { label: "Approved Claims", value: summary.total_approved_claims },
    { label: "Rejected Claims", value: summary.total_rejected_claims },
    { label: "Premium Collected", value: `₹${summary.total_premium_collected}` },
  ];

  return (
    <Layout>
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {cards.map((c) => (
          <div key={c.label} className="bg-white p-4 rounded-lg shadow">
            <p className="text-sm text-slate-500">{c.label}</p>
            <p className="text-2xl font-bold">{c.value}</p>
          </div>
        ))}
      </div>
    </Layout>
  );
}