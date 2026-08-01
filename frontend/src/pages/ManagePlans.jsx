import { useEffect, useState } from "react";
import Layout from "../components/Layout";
import { getAllPlans, createPlan, updatePlan } from "../services/planService";
import StatusSeal from "../components/StatusSeal";

const emptyForm = {
  name: "", plan_type: "health", description: "",
  coverage_amount: "", base_premium: "", duration_months: 12,
};

export default function ManagePlans() {
  const [plans, setPlans] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState("");

  const loadPlans = () => getAllPlans().then((res) => setPlans(res.data)).catch(() => {});

  useEffect(() => { loadPlans(); }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await createPlan({
        ...form,
        coverage_amount: Number(form.coverage_amount),
        base_premium: Number(form.base_premium),
        duration_months: Number(form.duration_months),
      });
      setForm(emptyForm);
      loadPlans();
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to create plan");
    }
  };

  const toggleActive = async (plan) => {
    await updatePlan(plan.id, { is_active: !plan.is_active });
    loadPlans();
  };

  return (
    <Layout>
      <h1 className="font-display text-3xl mb-6">Manage Insurance Plans</h1>

      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow mb-8 grid grid-cols-2 gap-3">
        <input name="name" placeholder="Plan Name" value={form.name} onChange={handleChange} className="border p-2 rounded col-span-2" required />
        <select name="plan_type" value={form.plan_type} onChange={handleChange} className="border p-2 rounded">
          <option value="health">Health</option>
          <option value="life">Life</option>
          <option value="vehicle">Vehicle</option>
        </select>
        <input name="duration_months" type="number" placeholder="Duration (months)" value={form.duration_months} onChange={handleChange} className="border p-2 rounded" />
        <input name="coverage_amount" type="number" placeholder="Coverage Amount (₹)" value={form.coverage_amount} onChange={handleChange} className="border p-2 rounded" required />
        <input name="base_premium" type="number" placeholder="Base Premium (₹/yr)" value={form.base_premium} onChange={handleChange} className="border p-2 rounded" required />
        <textarea name="description" placeholder="Description" value={form.description} onChange={handleChange} className="border p-2 rounded col-span-2" rows="2" />
        <button type="submit" className="col-span-2 bg-ink text-white py-2 rounded hover:bg-ink-light transition-colors">
          Create Plan
        </button>
        {error && <p className="text-rust text-sm col-span-2">{error}</p>}
      </form>

      <div className="grid gap-3">
        {plans.map((plan) => (
          <div key={plan.id} className="bg-white p-4 rounded-lg shadow flex items-center justify-between">
            <div>
              <p className="font-semibold">{plan.name} <span className="text-xs text-slate-400 uppercase ml-2">{plan.plan_type}</span></p>
              <p className="text-sm text-slate-500">{plan.description}</p>
              <p className="text-sm mt-1">Coverage ₹{plan.coverage_amount.toLocaleString()} · Premium ₹{plan.base_premium.toLocaleString()}/yr · {plan.duration_months}mo</p>
            </div>
            <div className="flex items-center gap-3">
              <StatusSeal status={plan.is_active ? "active" : "cancelled"} />
              <button
                onClick={() => toggleActive(plan)}
                className="text-sm border border-ink px-3 py-1 rounded hover:bg-ink hover:text-white transition-colors"
              >
                {plan.is_active ? "Deactivate" : "Activate"}
              </button>
            </div>
          </div>
        ))}
      </div>
    </Layout>
  );
}