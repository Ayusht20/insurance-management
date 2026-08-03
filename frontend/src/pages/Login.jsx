import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { ShieldCheck } from "lucide-react";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(email, password);
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.detail || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Brand panel */}
      <div className="hidden md:flex w-1/2 bg-ink text-white flex-col justify-center px-16 relative overflow-hidden">
        <div className="absolute -top-20 -right-20 w-72 h-72 bg-brass/10 rounded-full" />
        <div className="absolute bottom-0 -left-10 w-64 h-64 bg-brass/5 rounded-full" />
        <ShieldCheck className="w-10 h-10 text-brass-light mb-6" />
        <h1 className="font-display text-4xl mb-4">Welcome back to Insura</h1>
        <p className="text-white/60 max-w-sm">
          Sign in to manage your policies, track claims, and stay covered — all from one dashboard.
        </p>
      </div>

      {/* Form panel */}
      <div className="w-full md:w-1/2 flex items-center justify-center bg-canvas px-8">
        <form onSubmit={handleSubmit} className="w-full max-w-sm">
          <h2 className="font-display text-3xl text-ink mb-1">Sign In</h2>
          <p className="text-sm text-slate-500 mb-6">Enter your credentials to continue</p>

          {error && <p className="text-rust text-sm mb-4 bg-rust/10 px-3 py-2 rounded">{error}</p>}

          <label className="text-sm font-medium text-ink block mb-1">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border p-2.5 rounded mb-4 focus:outline-none focus:ring-2 focus:ring-brass/40"
            required
          />

          <label className="text-sm font-medium text-ink block mb-1">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border p-2.5 rounded mb-6 focus:outline-none focus:ring-2 focus:ring-brass/40"
            required
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-ink text-white py-2.5 rounded font-semibold hover:bg-ink-light transition-colors disabled:opacity-50"
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>

          <p className="text-sm mt-6 text-center text-slate-500">
            No account? <Link to="/register" className="text-brass-dark font-semibold">Register</Link>
          </p>
        </form>
      </div>
    </div>
  );
}