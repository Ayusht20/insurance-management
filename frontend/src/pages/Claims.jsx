import { useEffect, useState } from "react";
import Layout from "../components/Layout";
import {
  getClaims, getMyClaims, submitClaim, reviewClaim,
  getRemainingCoverage, getClaimHistory,
} from "../services/claimService";
import { getPolicies, getMyPolicies } from "../services/policyService";
import { getCustomerDocuments } from "../services/documentService";
import { useAuth } from "../context/AuthContext";
import StatusSeal from "../components/StatusSeal";

export default function Claims() {
  const { user } = useAuth();
  const isStaff = user?.role === "admin" || user?.role === "agent";

  const [claims, setClaims] = useState([]);
  const [policies, setPolicies] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [form, setForm] = useState({ policy_id: "", document_id: "", claim_amount: "", reason: "" });
  const [coverage, setCoverage] = useState(null);
  const [error, setError] = useState("");
  const [historyFor, setHistoryFor] = useState(null);
  const [history, setHistory] = useState([]);

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
        const covRes = await getRemainingCoverage(value);
        setCoverage(covRes.data);

        const policy = policies.find((p) => p.id === Number(value));
        if (policy) {
          const docRes = await getCustomerDocuments(policy.customer_id);
          setDocuments(docRes.data);
        }
      } catch {
        setCoverage(null);
        setDocuments([]);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!form.document_id) {
      setError("A supporting document is required to submit a claim");
      return;
    }
    if (coverage && Number(form.claim_amount) > coverage.remaining_coverage) {
      setError(`Claim exceeds remaining coverage of ₹${coverage.remaining_coverage.toLocaleString()}`);
      return;
    }

    try {
      await submitClaim({
        ...form,
        policy_id: Number(form.policy_id),
        document_id: Number(form.document_id),
        claim_amount: Number(form.claim_amount),
      });
      setForm({ policy_id: "", document_id: "", claim_amount: "", reason: "" });
      setCoverage(null);
      setDocuments([]);
      loadClaims();
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to submit claim");
    }
  };

  const handleReview = async (id, status) => {
    await reviewClaim(id, status);
    loadClaims();
  };

  const viewHistory = async (claimId) => {
    setHistoryFor(claimId);
    const res = await getClaimHistory(claimId);
    setHistory(res.data);
  };

  return (
    <Layout>
      <h1 className="font-display text-3xl mb-6">{isStaff ? "Claims" : "My Claims"}</h1>

      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow mb-8 grid grid-cols-3 gap-3">
        <select name="policy_id" value={form.policy_id} onChange={handleChange} className="border p-2 rounded" required>
          <option value="">Select Policy</option>
          {policies.map((p) => <option key={p.id} value={p.id}>{p.policy_number}</option>)}
        </select>

        <select name="document_id" value={form.document_id} onChange={handleChange} className="border p-2 rounded" required>
          <option value="">Select Supporting Document</option>
          {documents.map((d) => <option key={d.id} value={d.id}>{d.file_name}</option>)}
        </select>

        <input name="claim_amount" type="number" placeholder="Claim Amount" value={form.claim_amount} onChange={handleChange} className="border p-2 rounded" required />
        <input name="reason" placeholder="Reason" value={form.reason} onChange={handleChange} className="border p-2 rounded col-span-2" required />

        {form.policy_id && documents.length === 0 && (
          <p className="col-span-3 text-sm text-amber">No documents found for this policy's customer — upload one under Documents first.</p>
        )}
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
            <th className="p-3">Claim #</th><th className="p-3">Amount</th><th className="p-3">Reason</th>
            <th className="p-3">Status</th><th className="p-3">History</th>{isStaff && <th className="p-3">Actions</th>}
          </tr>
        </thead>
        <tbody>
          {claims.map((c) => (
            <tr key={c.id} className="border-b">
              <td className="p-3">{c.claim_number}</td>
              <td className="p-3">₹{c.claim_amount}</td>
              <td className="p-3">{c.reason}</td>
              <td className="p-3"><StatusSeal status={c.status} /></td>
              <td className="p-3">
                <button onClick={() => viewHistory(c.id)} className="text-sm text-brass-dark font-semibold">View</button>
              </td>
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

      {historyFor && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50" onClick={() => setHistoryFor(null)}>
          <div className="bg-white rounded-lg shadow-lg p-6 w-96" onClick={(e) => e.stopPropagation()}>
            <h2 className="font-display text-xl mb-4">Claim Timeline</h2>
            <div className="space-y-3 max-h-80 overflow-y-auto">
              {history.map((h) => (
                <div key={h.id} className="border-l-2 border-brass pl-3">
                  <p className="text-sm font-semibold capitalize">{h.status}</p>
                  <p className="text-xs text-slate-500">{h.changed_by_name} · {new Date(h.changed_at).toLocaleString()}</p>
                  {h.note && <p className="text-xs text-slate-600 mt-1">{h.note}</p>}
                </div>
              ))}
              {history.length === 0 && <p className="text-sm text-slate-400">No history yet.</p>}
            </div>
            <button onClick={() => setHistoryFor(null)} className="mt-4 w-full border border-ink py-2 rounded text-sm">Close</button>
          </div>
        </div>
      )}
    </Layout>
  );
}