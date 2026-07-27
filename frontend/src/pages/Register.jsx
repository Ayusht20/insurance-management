import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { registerUser } from "../services/authService";

export default function Register() {
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "customer" });
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await registerUser(form);
      navigate("/login");
    } catch (err) {
      setError(err.response?.data?.detail || "Registration failed");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100">
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-lg shadow-md w-96">
        <h1 className="text-2xl font-bold mb-6">Register</h1>
        {error && <p className="text-red-500 mb-4 text-sm">{error}</p>}
        <input name="name" placeholder="Name" onChange={handleChange} className="w-full border p-2 rounded mb-3" required />
        <input name="email" type="email" placeholder="Email" onChange={handleChange} className="w-full border p-2 rounded mb-3" required />
        <input name="password" type="password" placeholder="Password" onChange={handleChange} className="w-full border p-2 rounded mb-3" required />
        <select name="role" onChange={handleChange} value={form.role} className="w-full border p-2 rounded mb-4">
          <option value="customer">Customer</option>
          <option value="agent">Agent</option>
          <option value="admin">Admin</option>
        </select>
        <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded">
          Register
        </button>
        <p className="text-sm mt-4 text-center">
          Have an account? <Link to="/login" className="text-blue-600">Login</Link>
        </p>
      </form>
    </div>
  );
}