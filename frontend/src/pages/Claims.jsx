import { useEffect, useState } from "react";
import Layout from "../components/Layout";
import { getClaims, getMyClaims, submitClaim, reviewClaim, getRemainingCoverage } from "../services/claimService";
import { getPolicies, getMyPolicies } from "../services/policyService";
import { useAuth } from "../context/AuthContext";
import StatusSeal from "../components/StatusSeal";

export default function Claims() {
  const { user } = useAuth();
  const isStaff = user?.role === "admin" || user?.role === "agent";

  const [claims, setClaims] = useState([]);
  const [policies, setPolicies] = useState([]);
  const [form, setForm] = useState({ policy_id: "", claim_amount: "", reason: "" });
  const [coverage, setCoverage] = useState(null);
  const [error, setError] = useState("");

  const loadClaims = () => {
    const fetcher = isStaff ? getClaims() : getMyClaims();
    fetcher.then((res) => setClaims(res.data)).catch(() => {});
  };

  useEffect(() => {
    loadClaims();
    const policyFetcher = isStaff ? getPolicies() : getMyPolicies();
    policyFetcher.then((res) => setPolicies(res.data)).catch(() => {});
  }, []);

  const handleChange = async (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
    setError("");

    if (name === "policy_id" && value) {
      try {
        const res = await getRemainingCoverage(value);
        setCoverage(res.data);
      } catch {
        setCoverage(null);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (coverage && Number(form.claim_amount) > coverage.remaining_coverage) {
      setError(`Claim exceeds remaining coverage of ₹${coverage.remaining_coverage.toLocaleString()}`);
      return;
    }

    try {
      await submitClaim({ ...form, policy_id: Number(form.policy_id), claim_amount: Number(form.claim_amount) });
      setForm({ policy_id: "", claim_amount: "", reason: "" });
      setCoverage(null);
      loadClaims();
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to submit claim");
    }
  };

  const handleReview = async (id, status) => {
    await reviewClaim(id, status);
    loadClaims();
  };

  return (
    <Layout>
      <h1 className="font-display text-3xl mb-6">{isStaff ? "Claims" : "My Claims"}</h1>

      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow mb-8 grid grid-cols-3 gap-3">
        <select name="policy_id" value={form.policy_id} onChange={handleChange} className="border p-2 rounded" required>
          <option value="">Select Policy</option>
          {policies.map((p) => <option key={p.id} value={p.id}>{p.policy_number}</option>)}
        </select>
        <input name="claim_amount" type="number" placeholder="Claim Amount" value={form.claim_amount} onChange={handleChange} className="border p-2 rounded" required />
        <input name="reason" placeholder="Reason" value={form.reason} onChange={handleChange} className="border p-2 rounded" required />

        {coverage && (
          <p className="col-span-3 text-sm text-slate-500">
            Coverage: ₹{coverage.coverage_amount.toLocaleString()} · Already claimed: ₹{coverage.already_claimed.toLocaleString()} ·
            <span className="font-semibold text-ink"> Remaining: ₹{coverage.remaining_coverage.toLocaleString()}</span>
          </p>
        )}
        {error && <p className="col-span-3 text-rust text-sm">{error}</p>}

        <button type="submit" className="col-span-3 bg-ink text-white py-2 rounded hover:bg-ink-light transition-colors">
          Submit Claim
        </button>
      </form>

      <table className="w-full bg-white rounded-lg shadow overflow-hidden">
        <thead>
          <tr className="text-left border-b bg-canvas">
            <th className="p-3">Policy ID</th><th className="p-3">Amount</th><th className="p-3">Reason</th>
            <th className="p-3">Status</th>{isStaff && <th className="p-3">Actions</th>}
          </tr>
        </thead>
        <tbody>
          {claims.map((c) => (
            <tr key={c.id} className="border-b">
              <td className="p-3">{c.policy_id}</td>
              <td className="p-3">₹{c.claim_amount}</td>
              <td className="p-3">{c.reason}</td>
              <td className="p-3"><StatusSeal status={c.status} /></td>
              {isStaff && (
                <td className="p-3 flex gap-2">
                  {c.status === "pending" && (
                    <>
                      <button onClick={() => handleReview(c.id, "approved")} className="text-sage text-sm font-semibold">Approve</button>
                      <button onClick={() => handleReview(c.id, "rejected")} className="text-rust text-sm font-semibold">Reject</button>
                    </>
                  )}
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </Layout>
  );
}