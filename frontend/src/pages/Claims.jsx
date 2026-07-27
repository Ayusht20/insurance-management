import { useEffect, useState } from "react";
import Layout from "../components/Layout";
import { getClaims, submitClaim, reviewClaim } from "../services/claimService";
import { getPolicies } from "../services/policyService";
import { useAuth } from "../context/AuthContext";

export default function Claims() {
  const { user } = useAuth();
  const [claims, setClaims] = useState([]);
  const [policies, setPolicies] = useState([]);
  const [form, setForm] = useState({ policy_id: "", claim_amount: "", reason: "" });

  const loadClaims = () => getClaims().then((res) => setClaims(res.data)).catch(() => {});

  useEffect(() => {
    loadClaims();
    getPolicies().then((res) => setPolicies(res.data)).catch(() => {});
  }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    await submitClaim({ ...form, policy_id: Number(form.policy_id), claim_amount: Number(form.claim_amount) });
    setForm({ policy_id: "", claim_amount: "", reason: "" });
    loadClaims();
  };

  const handleReview = async (id, status) => {
    await reviewClaim(id, status);
    loadClaims();
  };

  const statusColor = { pending: "bg-yellow-100 text-yellow-700", approved: "bg-green-100 text-green-700", rejected: "bg-red-100 text-red-700" };
  const canReview = user?.role === "admin" || user?.role === "agent";

  return (
    <Layout>
      <h1 className="text-2xl font-bold mb-4">Claims</h1>

      <form onSubmit={handleSubmit} className="bg-white p-4 rounded shadow mb-6 grid grid-cols-3 gap-2">
        <select name="policy_id" value={form.policy_id} onChange={handleChange} className="border p-2 rounded" required>
          <option value="">Select Policy</option>
          {policies.map((p) => <option key={p.id} value={p.id}>{p.policy_number}</option>)}
        </select>
        <input name="claim_amount" type="number" placeholder="Claim Amount" value={form.claim_amount} onChange={handleChange} className="border p-2 rounded" required />
        <input name="reason" placeholder="Reason" value={form.reason} onChange={handleChange} className="border p-2 rounded" required />
        <button type="submit" className="col-span-3 bg-blue-600 text-white py-2 rounded">Submit Claim</button>
      </form>

      <table className="w-full bg-white rounded shadow">
        <thead>
          <tr className="text-left border-b">
            <th className="p-2">Policy ID</th><th className="p-2">Amount</th><th className="p-2">Reason</th>
            <th className="p-2">Status</th>{canReview && <th className="p-2">Actions</th>}
          </tr>
        </thead>
        <tbody>
          {claims.map((c) => (
            <tr key={c.id} className="border-b">
              <td className="p-2">{c.policy_id}</td>
              <td className="p-2">₹{c.claim_amount}</td>
              <td className="p-2">{c.reason}</td>
              <td className="p-2"><span className={`px-2 py-1 rounded text-xs ${statusColor[c.status]}`}>{c.status}</span></td>
              {canReview && (
                <td className="p-2 flex gap-2">
                  {c.status === "pending" && (
                    <>
                      <button onClick={() => handleReview(c.id, "approved")} className="text-green-600 text-sm">Approve</button>
                      <button onClick={() => handleReview(c.id, "rejected")} className="text-red-600 text-sm">Reject</button>
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