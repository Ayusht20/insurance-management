import { useEffect, useState } from "react";
import Layout from "../components/Layout";
import { getCustomers, createCustomer } from "../services/customerService";

export default function Customers() {
  const [customers, setCustomers] = useState([]);
  const [search, setSearch] = useState("");
  const [form, setForm] = useState({ name: "", dob: "", phone: "", address: "", email: "" });

  const loadCustomers = () => {
    getCustomers(search).then((res) => setCustomers(res.data)).catch(() => {});
  };

  useEffect(() => { loadCustomers(); }, [search]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    await createCustomer(form);
    setForm({ name: "", dob: "", phone: "", address: "", email: "" });
    loadCustomers();
  };

  return (
    <Layout>
      <h1 className="text-2xl font-bold mb-4">Customers</h1>

      <form onSubmit={handleSubmit} className="bg-white p-4 rounded shadow mb-6 grid grid-cols-5 gap-2">
        <input name="name" placeholder="Name" value={form.name} onChange={handleChange} className="border p-2 rounded" required />
        <input name="dob" type="date" value={form.dob} onChange={handleChange} className="border p-2 rounded" required />
        <input name="phone" placeholder="Phone" value={form.phone} onChange={handleChange} className="border p-2 rounded" required />
        <input name="address" placeholder="Address" value={form.address} onChange={handleChange} className="border p-2 rounded" required />
        <input name="email" type="email" placeholder="Email" value={form.email} onChange={handleChange} className="border p-2 rounded" required />
        <button type="submit" className="col-span-5 bg-blue-600 text-white py-2 rounded">Add Customer</button>
      </form>

      <input
        placeholder="Search customers..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="border p-2 rounded mb-4 w-full"
      />

      <table className="w-full bg-white rounded shadow">
        <thead>
          <tr className="text-left border-b">
            <th className="p-2">Name</th><th className="p-2">Email</th><th className="p-2">Phone</th><th className="p-2">Address</th>
          </tr>
        </thead>
        <tbody>
          {customers.map((c) => (
            <tr key={c.id} className="border-b">
              <td className="p-2">{c.name}</td><td className="p-2">{c.email}</td><td className="p-2">{c.phone}</td><td className="p-2">{c.address}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </Layout>
  );
}