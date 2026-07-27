import { useEffect, useState } from "react";
import Layout from "../components/Layout";
import { getPolicies, createPolicy, renewPolicy, cancelPolicy } from "../services/policyService";
import { getCustomers } from "../services/customerService";

export default function Policies() {
  const [policies, setPolicies] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [form, setForm] = useState({
    customer_id: "", policy_type: "", policy_number: "",
    premium_amount: "", start_date: "", end_date: "",
  });

  const loadPolicies = () => getPolicies().then((res) => setPolicies(res.data)).catch(() => {});

  useEffect(() => {
    loadPolicies();
    getCustomers().then((res) => setCustomers(res.data)).catch(() => {});
  }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    await createPolicy({ ...form, customer_id: Number(form.customer_id), premium_amount: Number(form.premium_amount) });
    setForm({ customer_id: "", policy_type: "", policy_number: "", premium_amount: "", start_date: "", end_date: "" });
    loadPolicies();
  };

  const handleRenew = async (id) => {
    const newDate = prompt("New end date (YYYY-MM-DD):");
    if (newDate) { await renewPolicy(id, newDate); loadPolicies(); }
  };

  const handleCancel = async (id) => {
    if (confirm("Cancel this policy?")) { await cancelPolicy(id); loadPolicies(); }
  };

  const statusColor = { active: "bg-green-100 text-green-700", expired: "bg-yellow-100 text-yellow-700", cancelled: "bg-red-100 text-red-700" };

  return (
    <Layout>
      <h1 className="text-2xl font-bold mb-4">Policies</h1>

      <form onSubmit={handleSubmit} className="bg-white p-4 rounded shadow mb-6 grid grid-cols-3 gap-2">
        <select name="customer_id" value={form.customer_id} onChange={handleChange} className="border p-2 rounded" required>
          <option value="">Select Customer</option>
          {customers.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <input name="policy_type" placeholder="Policy Type" value={form.policy_type} onChange={handleChange} className="border p-2 rounded" required />
        <input name="policy_number" placeholder="Policy Number" value={form.policy_number} onChange={handleChange} className="border p-2 rounded" required />
        <input name="premium_amount" type="number" placeholder="Premium Amount" value={form.premium_amount} onChange={handleChange} className="border p-2 rounded" required />
        <input name="start_date" type="date" value={form.start_date} onChange={handleChange} className="border p-2 rounded" required />
        <input name="end_date" type="date" value={form.end_date} onChange={handleChange} className="border p-2 rounded" required />
        <button type="submit" className="col-span-3 bg-blue-600 text-white py-2 rounded">Create Policy</button>
      </form>

      <table className="w-full bg-white rounded shadow">
        <thead>
          <tr className="text-left border-b">
            <th className="p-2">Policy #</th><th className="p-2">Type</th><th className="p-2">Premium</th>
            <th className="p-2">End Date</th><th className="p-2">Status</th><th className="p-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {policies.map((p) => (
            <tr key={p.id} className="border-b">
              <td className="p-2">{p.policy_number}</td>
              <td className="p-2">{p.policy_type}</td>
              <td className="p-2">₹{p.premium_amount}</td>
              <td className="p-2">{p.end_date}</td>
              <td className="p-2"><span className={`px-2 py-1 rounded text-xs ${statusColor[p.status]}`}>{p.status}</span></td>
              <td className="p-2 flex gap-2">
                <button onClick={() => handleRenew(p.id)} className="text-blue-600 text-sm">Renew</button>
                <button onClick={() => handleCancel(p.id)} className="text-red-600 text-sm">Cancel</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </Layout>
  );
}