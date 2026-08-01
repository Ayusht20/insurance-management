import { useEffect, useState } from "react";
import Layout from "../components/Layout";
import {
  getDashboardSummary,
  notifyExpiringPolicies,
  notifyOverduePremiums,
} from "../services/reportService";
import { getMyPolicies } from "../services/policyService";
import { getMyClaims } from "../services/claimService";
import PolicyStatusChart from "../components/charts/PolicyStatusChart";
import ClaimStatusChart from "../components/charts/ClaimStatusChart";
import PremiumCollectionChart from "../components/charts/PremiumCollectionChart";
import CustomerGrowthChart from "../components/charts/CustomerGrowthChart";
import { useAuth } from "../context/AuthContext";

export default function Dashboard() {
  const { user } = useAuth();
  const isStaff = user?.role === "admin" || user?.role === "agent";

  const [summary, setSummary] = useState(null);
  const [myData, setMyData] = useState(null);
  const [notifyMsg, setNotifyMsg] = useState("");
  const [notifyLoading, setNotifyLoading] = useState(false);

  useEffect(() => {
    if (isStaff) {
      getDashboardSummary().then((res) => setSummary(res.data)).catch(() => {});
    } else {
      Promise.all([getMyPolicies(), getMyClaims()])
        .then(([policiesRes, claimsRes]) => {
          setMyData({ policies: policiesRes.data, claims: claimsRes.data });
        })
        .catch(() => {});
    }
  }, [isStaff]);

  const handleNotifyExpiring = async () => {
    setNotifyLoading(true);
    setNotifyMsg("");
    try {
      const res = await notifyExpiringPolicies();
      setNotifyMsg(`Notified ${res.data.notified} customers about expiring policies.`);
    } catch (err) {
      setNotifyMsg(err.response?.data?.detail || "Failed to send notifications.");
    } finally {
      setNotifyLoading(false);
    }
  };

  const handleNotifyOverdue = async () => {
    setNotifyLoading(true);
    setNotifyMsg("");
    try {
      const res = await notifyOverduePremiums();
      setNotifyMsg(`Notified ${res.data.notified} customers about overdue premiums.`);
    } catch (err) {
      setNotifyMsg(err.response?.data?.detail || "Failed to send notifications.");
    } finally {
      setNotifyLoading(false);
    }
  };

  // ---------- STAFF VIEW ----------
  if (isStaff) {
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

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {cards.map((c) => (
            <div key={c.label} className="bg-white p-4 rounded-lg shadow">
              <p className="text-sm text-slate-500">{c.label}</p>
              <p className="text-2xl font-bold">{c.value}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <PolicyStatusChart />
          <ClaimStatusChart />
          <PremiumCollectionChart />
          <CustomerGrowthChart />
        </div>

        <div className="mt-6 flex gap-3">
          <button
            onClick={handleNotifyExpiring}
            disabled={notifyLoading}
            className="bg-amber-500 text-white px-4 py-2 rounded text-sm disabled:opacity-50"
          >
            {notifyLoading ? "Sending..." : "Notify Expiring Policies"}
          </button>
          <button
            onClick={handleNotifyOverdue}
            disabled={notifyLoading}
            className="bg-red-500 text-white px-4 py-2 rounded text-sm disabled:opacity-50"
          >
            {notifyLoading ? "Sending..." : "Notify Overdue Premiums"}
          </button>
        </div>
        {notifyMsg && <p className="mt-2 text-sm text-green-700">{notifyMsg}</p>}
      </Layout>
    );
  }

  // ---------- CUSTOMER VIEW ----------
  if (!myData) return <Layout><p>Loading...</p></Layout>;

  const activeCount = myData.policies.filter((p) => p.status === "active").length;
  const pendingClaims = myData.claims.filter((c) => c.status === "pending").length;

  return (
    <Layout>
      <h1 className="text-2xl font-bold mb-6">My Dashboard</h1>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-lg shadow">
          <p className="text-sm text-slate-500">My Policies</p>
          <p className="text-2xl font-bold">{myData.policies.length}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <p className="text-sm text-slate-500">Active Policies</p>
          <p className="text-2xl font-bold">{activeCount}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <p className="text-sm text-slate-500">Pending Claims</p>
          <p className="text-2xl font-bold">{pendingClaims}</p>
        </div>
      </div>
      <p className="mt-6 text-slate-500 text-sm">
        Visit <span className="font-semibold">My Policies</span> for full details, or{" "}
        <span className="font-semibold">Plans</span> to apply for new coverage.
      </p>
    </Layout>
  );
}