import { useEffect, useState } from "react";
import { getMyProfile } from "../services/customerService";
import { getCustomerDocuments } from "../services/documentService";
import { applyForPolicy } from "../services/policyService";

export default function ApplyModal({ plan, onClose, onApplied }) {
  const [documents, setDocuments] = useState([]);
  const [form, setForm] = useState({ id_proof_type: "aadhaar", id_proof_number: "", document_id: "", installments: 1 });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const installmentOptions = [1, 2, 4, 12].filter((n) => n <= plan.installments && plan.duration_months % n === 0);

  useEffect(() => {
    getMyProfile().then((res) => {
      getCustomerDocuments(res.data.id).then((docRes) => setDocuments(docRes.data)).catch(() => {});
    }).catch(() => {});
  }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!form.document_id) {
      setError("Select a document to proceed");
      return;
    }
    setSubmitting(true);
    try {
      const res = await applyForPolicy({
        plan_id: plan.id,
        id_proof_type: form.id_proof_type,
        id_proof_number: form.id_proof_number,
        document_id: Number(form.document_id),
        installments: Number(form.installments),
      });
      onApplied(res.data);
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to apply");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md" onClick={(e) => e.stopPropagation()}>
        <h2 className="font-display text-2xl mb-1">Apply — {plan.name}</h2>
        <p className="text-sm text-slate-500 mb-5">₹{plan.base_premium.toLocaleString()}/yr · Coverage ₹{plan.coverage_amount.toLocaleString()}</p>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="text-sm font-medium text-ink block mb-1">ID Proof Type</label>
            <select name="id_proof_type" value={form.id_proof_type} onChange={handleChange} className="w-full border p-2 rounded">
              <option value="aadhaar">Aadhaar Card</option>
              <option value="pan">PAN Card</option>
              <option value="passport">Passport</option>
              <option value="driving_license">Driving License</option>
            </select>
          </div>

          <div>
            <label className="text-sm font-medium text-ink block mb-1">ID Proof Number</label>
            <input
              name="id_proof_number"
              value={form.id_proof_number}
              onChange={handleChange}
              placeholder="e.g. 1234-5678-9012"
              className="w-full border p-2 rounded"
              required
            />
          </div>

          <div>
            <label className="text-sm font-medium text-ink block mb-1">Supporting Document</label>
            <select name="document_id" value={form.document_id} onChange={handleChange} className="w-full border p-2 rounded" required>
              <option value="">Select uploaded document</option>
              {documents.map((d) => <option key={d.id} value={d.id}>{d.file_name}</option>)}
            </select>
            {documents.length === 0 && (
              <p className="text-xs text-amber mt-1">No documents on file — upload one under "My Documents" first.</p>
            )}
          </div>

          <div>
            <label className="text-sm font-medium text-ink block mb-1">Payment Plan</label>
            <select name="installments" value={form.installments} onChange={handleChange} className="w-full border p-2 rounded">
              {installmentOptions.map((n) => (
                <option key={n} value={n}>
                  {n === 1 ? "Lump Sum" : n === 2 ? "Half-Yearly" : n === 4 ? "Quarterly" : "Monthly"} — ₹{Math.round(plan.base_premium / n).toLocaleString()} × {n}
                </option>
              ))}
            </select>
          </div>

          {error && <p className="text-rust text-sm">{error}</p>}

          <div className="flex gap-2 pt-2">
            <button type="button" onClick={onClose} className="flex-1 border border-ink py-2 rounded text-sm">Cancel</button>
            <button type="submit" disabled={submitting} className="flex-1 bg-ink text-white py-2 rounded text-sm hover:bg-ink-light disabled:opacity-50">
              {submitting ? "Submitting..." : "Continue"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}