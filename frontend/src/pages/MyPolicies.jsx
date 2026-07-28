import { useEffect, useState } from "react";
import Layout from "../components/Layout";
import { getMyPolicies } from "../services/policyService";
import { getMyClaims } from "../services/claimService";
import { getMyPayments } from "../services/premiumService";

export default function MyPolicies() {
  const [policies, setPolicies] = useState([]);
  const [claims, setClaims] = useState([]);
  const [payments, setPayments] = useState([]);

  useEffect(() => {
    getMyPolicies().then((res) => setPolicies(res.data)).catch(() => {});
    getMyClaims().then((res) => setClaims(res.data)).catch(() => {});
    getMyPayments().then((res) => setPayments(res.data)).catch(() => {});
  }, []);

  const statusColor = { active: "bg-green-100 text-green-700", expired: "bg-yellow-100 text-yellow-700", cancelled: "bg-red-100 text-red-700" };

  return (
    <Layout>
      <h1 className="text-2xl font-bold mb-4">My Policies</h1>
      <div className="grid gap-4 mb-8">
        {policies.map((p) => (
          <div key={p.id} className="bg-white p-4 rounded-lg shadow flex justify-between items-center">
            <div>
              <p className="font-semibold">{p.policy_number}</p>
              <p className="text-sm text-slate-500">{p.policy_type} · ₹{p.premium_amount}/yr · ends {p.end_date}</p>
            </div>
            <span className={`px-2 py-1 rounded text-xs ${statusColor[p.status]}`}>{p.status}</span>
          </div>
        ))}
        {policies.length === 0 && <p className="text-slate-400 text-sm">No policies yet — browse Plans to apply.</p>}
      </div>

      <h2 className="text-xl font-bold mb-3">My Claims</h2>
      <div className="grid gap-2 mb-8">
        {claims.map((c) => (
          <div key={c.id} className="bg-white p-3 rounded shadow flex justify-between text-sm">
            <span>{c.reason} — ₹{c.claim_amount}</span>
            <span className="font-semibold">{c.status}</span>
          </div>
        ))}
        {claims.length === 0 && <p className="text-slate-400 text-sm">No claims submitted.</p>}
      </div>

      <h2 className="text-xl font-bold mb-3">My Payments</h2>
      <div className="grid gap-2">
        {payments.map((p) => (
          <div key={p.id} className="bg-white p-3 rounded shadow flex justify-between text-sm">
            <span>{p.payment_date} — ₹{p.amount}</span>
            <span className="font-semibold">{p.payment_status}</span>
          </div>
        ))}
        {payments.length === 0 && <p className="text-slate-400 text-sm">No payments yet.</p>}
      </div>
    </Layout>
  );
}