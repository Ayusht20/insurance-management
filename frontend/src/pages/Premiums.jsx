import { useEffect, useState } from "react";
import Layout from "../components/Layout";
import { getPayments, recordPayment } from "../services/premiumService";
import { getPolicies } from "../services/policyService";

export default function Premiums() {
  const [payments, setPayments] = useState([]);
  const [policies, setPolicies] = useState([]);
  const [form, setForm] = useState({ policy_id: "", payment_date: "", amount: "" });

  const loadPayments = () => getPayments().then((res) => setPayments(res.data)).catch(() => {});

  useEffect(() => {
    loadPayments();
    getPolicies().then((res) => setPolicies(res.data)).catch(() => {});
  }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    await recordPayment({ ...form, policy_id: Number(form.policy_id), amount: Number(form.amount) });
    setForm({ policy_id: "", payment_date: "", amount: "" });
    loadPayments();
  };

  const statusColor = { paid: "bg-green-100 text-green-700", pending: "bg-yellow-100 text-yellow-700", overdue: "bg-red-100 text-red-700" };

  return (
    <Layout>
      <h1 className="text-2xl font-bold mb-4">Premium Payments</h1>

      <form onSubmit={handleSubmit} className="bg-white p-4 rounded shadow mb-6 grid grid-cols-3 gap-2">
        <select name="policy_id" value={form.policy_id} onChange={handleChange} className="border p-2 rounded" required>
          <option value="">Select Policy</option>
          {policies.map((p) => <option key={p.id} value={p.id}>{p.policy_number}</option>)}
        </select>
        <input name="payment_date" type="date" value={form.payment_date} onChange={handleChange} className="border p-2 rounded" required />
        <input name="amount" type="number" placeholder="Amount" value={form.amount} onChange={handleChange} className="border p-2 rounded" required />
        <button type="submit" className="col-span-3 bg-blue-600 text-white py-2 rounded">Record Payment</button>
      </form>

      <table className="w-full bg-white rounded shadow">
        <thead>
          <tr className="text-left border-b">
            <th className="p-2">Policy ID</th><th className="p-2">Date</th><th className="p-2">Amount</th><th className="p-2">Status</th>
          </tr>
        </thead>
        <tbody>
          {payments.map((p) => (
            <tr key={p.id} className="border-b">
              <td className="p-2">{p.policy_id}</td>
              <td className="p-2">{p.payment_date}</td>
              <td className="p-2">₹{p.amount}</td>
              <td className="p-2"><span className={`px-2 py-1 rounded text-xs ${statusColor[p.payment_status]}`}>{p.payment_status}</span></td>
            </tr>
          ))}
        </tbody>
      </table>
    </Layout>
  );
}