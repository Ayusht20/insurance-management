import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { registerUser } from "../services/authService";

export default function Register() {
  const [form, setForm] = useState({ name: "", email: "", password: "", dob: "", phone: "", address: "" });
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
        <h1 className="text-2xl font-bold mb-2">Create Account</h1>
        <p className="text-sm text-slate-500 mb-6">Register as a customer to browse plans and manage your policies.</p>
        {error && <p className="text-red-500 mb-4 text-sm">{error}</p>}

        <input name="name" placeholder="Full Name" onChange={handleChange} className="w-full border p-2 rounded mb-3" required />
        <input name="email" type="email" placeholder="Email" onChange={handleChange} className="w-full border p-2 rounded mb-3" required />
        <input name="password" type="password" placeholder="Password" onChange={handleChange} className="w-full border p-2 rounded mb-3" required />
        <input name="dob" type="date" onChange={handleChange} className="w-full border p-2 rounded mb-3" required />
        <input name="phone" placeholder="Phone" onChange={handleChange} className="w-full border p-2 rounded mb-3" required />
        <input name="address" placeholder="Address" onChange={handleChange} className="w-full border p-2 rounded mb-4" required />

        <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded">
          Register
        </button>
        <p className="text-sm mt-4 text-center">
          Have an account? <Link to="/login" className="text-blue-600">Login</Link>
        </p>
        <p className="text-xs text-slate-400 mt-2 text-center">
          Are you an employee? Contact your admin for staff access.
        </p>
      </form>
    </div>
  );
}