import { useEffect, useState } from "react";
import Layout from "../components/Layout";
import { getMyPolicies } from "../services/policyService";
import { getMyClaims } from "../services/claimService";
import { getMyPayments, payPremium } from "../services/premiumService";
import StatusSeal from "../components/StatusSeal";

export default function MyPolicies() {
  const [policies, setPolicies] = useState([]);
  const [claims, setClaims] = useState([]);
  const [payments, setPayments] = useState([]);
  const [payingId, setPayingId] = useState(null);
  const [message, setMessage] = useState("");

  const loadPayments = () => getMyPayments().then((res) => setPayments(res.data)).catch(() => {});

  useEffect(() => {
    getMyPolicies().then((res) => setPolicies(res.data)).catch(() => {});
    getMyClaims().then((res) => setClaims(res.data)).catch(() => {});
    loadPayments();
  }, []);

  const handlePay = async (id) => {
    setPayingId(id);
    setMessage("");
    try {
      await payPremium(id);
      setMessage("Payment successful.");
      loadPayments();
    } catch (err) {
      setMessage(err.response?.data?.detail || "Payment failed.");
    } finally {
      setPayingId(null);
    }
  };

  return (
    <Layout>
      <h1 className="font-display text-3xl mb-6">My Policies</h1>

      <div className="grid gap-4 mb-10">
        {policies.map((p) => (
          <div key={p.id} className="bg-white p-4 rounded-lg shadow flex justify-between items-center">
            <div>
              <p className="font-semibold">{p.policy_number}</p>
              <p className="text-sm text-slate-500">{p.policy_type} · ₹{p.premium_amount}/yr · ends {p.end_date}</p>
            </div>
            <StatusSeal status={p.status} />
          </div>
        ))}
        {policies.length === 0 && <p className="text-slate-400 text-sm">No policies yet — browse Plans to apply.</p>}
      </div>

      <h2 className="font-display text-2xl mb-3">Premium Payments</h2>
      {message && <p className="mb-3 text-sm bg-ink/5 text-ink px-3 py-2 rounded">{message}</p>}
      <div className="grid gap-2 mb-10">
        {payments.map((p) => (
          <div key={p.id} className="bg-white p-3 rounded-lg shadow flex justify-between items-center text-sm">
            <span>{p.payment_date} — ₹{p.amount}</span>
            <div className="flex items-center gap-3">
              <StatusSeal status={p.payment_status} />
              {p.payment_status !== "paid" && (
                <button
                  onClick={() => handlePay(p.id)}
                  disabled={payingId === p.id}
                  className="bg-brass text-ink font-semibold px-3 py-1 rounded hover:bg-brass-dark hover:text-white transition-colors disabled:opacity-50"
                >
                  {payingId === p.id ? "Processing..." : "Pay Now"}
                </button>
              )}
            </div>
          </div>
        ))}
        {payments.length === 0 && <p className="text-slate-400 text-sm">No payments due.</p>}
      </div>

      <h2 className="font-display text-2xl mb-3">My Claims</h2>
      <div className="grid gap-2">
        {claims.map((c) => (
          <div key={c.id} className="bg-white p-3 rounded-lg shadow flex justify-between items-center text-sm">
            <span>{c.reason} — ₹{c.claim_amount}</span>
            <StatusSeal status={c.status} />
          </div>
        ))}
        {claims.length === 0 && <p className="text-slate-400 text-sm">No claims submitted.</p>}
      </div>
    </Layout>
  );
}