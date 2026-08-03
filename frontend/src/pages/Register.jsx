import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { registerUser } from "../services/authService";
import { ShieldCheck } from "lucide-react";

export default function Register() {
  const [form, setForm] = useState({ name: "", email: "", password: "", dob: "", phone: "", address: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await registerUser(form);
      navigate("/login");
    } catch (err) {
      setError(err.response?.data?.detail || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      <div className="hidden md:flex w-1/2 bg-ink text-white flex-col justify-center px-16 relative overflow-hidden">
        <div className="absolute -top-20 -right-20 w-72 h-72 bg-brass/10 rounded-full" />
        <div className="absolute bottom-0 -left-10 w-64 h-64 bg-brass/5 rounded-full" />
        <ShieldCheck className="w-10 h-10 text-brass-light mb-6" />
        <h1 className="font-display text-4xl mb-4">Get covered in minutes</h1>
        <p className="text-white/60 max-w-sm">
          Create your account, browse plans, and apply for coverage — verified by OTP, backed by real documents.
        </p>
      </div>

      <div className="w-full md:w-1/2 flex items-center justify-center bg-canvas px-8 py-12">
        <form onSubmit={handleSubmit} className="w-full max-w-sm">
          <h2 className="font-display text-3xl text-ink mb-1">Create Account</h2>
          <p className="text-sm text-slate-500 mb-6">Register as a customer to get started</p>

          {error && <p className="text-rust text-sm mb-4 bg-rust/10 px-3 py-2 rounded">{error}</p>}

          <div className="space-y-3">
            <input name="name" placeholder="Full Name" onChange={handleChange} className="w-full border p-2.5 rounded focus:outline-none focus:ring-2 focus:ring-brass/40" required />
            <input name="email" type="email" placeholder="Email" onChange={handleChange} className="w-full border p-2.5 rounded focus:outline-none focus:ring-2 focus:ring-brass/40" required />
            <input name="password" type="password" placeholder="Password" onChange={handleChange} className="w-full border p-2.5 rounded focus:outline-none focus:ring-2 focus:ring-brass/40" required />
            <input name="dob" type="date" onChange={handleChange} className="w-full border p-2.5 rounded focus:outline-none focus:ring-2 focus:ring-brass/40" required />
            <input name="phone" placeholder="Phone" onChange={handleChange} className="w-full border p-2.5 rounded focus:outline-none focus:ring-2 focus:ring-brass/40" required />
            <input name="address" placeholder="Address" onChange={handleChange} className="w-full border p-2.5 rounded focus:outline-none focus:ring-2 focus:ring-brass/40" required />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-ink text-white py-2.5 rounded font-semibold hover:bg-ink-light transition-colors mt-6 disabled:opacity-50"
          >
            {loading ? "Creating account..." : "Register"}
          </button>

          <p className="text-sm mt-6 text-center text-slate-500">
            Have an account? <Link to="/login" className="text-brass-dark font-semibold">Login</Link>
          </p>
          <p className="text-xs text-slate-400 mt-2 text-center">
            Are you an employee? Contact your admin for staff access.
          </p>
        </form>
      </div>
    </div>
  );
}