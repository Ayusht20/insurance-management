import { useEffect, useState } from "react";
import Layout from "../components/Layout";
import { getEmployees, createEmployee, deleteEmployee } from "../services/employeeService";

export default function Employees() {
  const [employees, setEmployees] = useState([]);
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "agent" });
  const [error, setError] = useState("");

  const loadEmployees = () => getEmployees().then((res) => setEmployees(res.data)).catch(() => {});

  useEffect(() => { loadEmployees(); }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await createEmployee(form);
      setForm({ name: "", email: "", password: "", role: "agent" });
      loadEmployees();
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to create employee");
    }
  };

  const handleDelete = async (id) => {
    if (confirm("Remove this employee?")) {
      await deleteEmployee(id);
      loadEmployees();
    }
  };

  return (
    <Layout>
      <h1 className="text-2xl font-bold mb-4">Employee Management</h1>

      <form onSubmit={handleSubmit} className="bg-white p-4 rounded shadow mb-6 grid grid-cols-4 gap-2">
        <input name="name" placeholder="Name" value={form.name} onChange={handleChange} className="border p-2 rounded" required />
        <input name="email" type="email" placeholder="Email" value={form.email} onChange={handleChange} className="border p-2 rounded" required />
        <input name="password" type="password" placeholder="Password" value={form.password} onChange={handleChange} className="border p-2 rounded" required />
        <select name="role" value={form.role} onChange={handleChange} className="border p-2 rounded">
          <option value="agent">Agent</option>
          <option value="admin">Admin</option>
        </select>
        <button type="submit" className="col-span-4 bg-blue-600 text-white py-2 rounded">Add Employee</button>
      </form>
      {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

      <table className="w-full bg-white rounded shadow">
        <thead>
          <tr className="text-left border-b">
            <th className="p-2">Name</th><th className="p-2">Email</th><th className="p-2">Role</th><th className="p-2">Action</th>
          </tr>
        </thead>
        <tbody>
          {employees.map((e) => (
            <tr key={e.id} className="border-b">
              <td className="p-2">{e.name}</td>
              <td className="p-2">{e.email}</td>
              <td className="p-2 capitalize">{e.role}</td>
              <td className="p-2">
                <button onClick={() => handleDelete(e.id)} className="text-red-600 text-sm">Remove</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </Layout>
  );
}