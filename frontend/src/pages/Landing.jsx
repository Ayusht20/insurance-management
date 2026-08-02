import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { getPlans } from "../services/planService";

export default function Landing() {
  const [plans, setPlans] = useState([]);

  useEffect(() => {
    getPlans().then((res) => setPlans(res.data.slice(0, 3))).catch(() => {});
  }, []);

  return (
    <div className="min-h-screen bg-canvas">
      {/* Top bar */}
      <header className="flex justify-between items-center px-8 py-5 border-b border-ink/10">
        <h1 className="font-display text-2xl text-ink">Insura</h1>
        <div className="flex gap-4 items-center">
          <Link to="/login" className="text-sm font-medium text-ink hover:text-brass-dark transition-colors">
            Login
          </Link>
          <Link to="/register" className="bg-ink text-white text-sm font-medium px-4 py-2 rounded hover:bg-ink-light transition-colors">
            Get Covered
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="px-8 py-24 max-w-4xl mx-auto text-center">
        <p className="text-brass-dark text-sm font-semibold uppercase tracking-widest mb-4">
          Trusted Protection, Simplified
        </p>
        <h2 className="font-display text-5xl md:text-6xl text-ink leading-tight mb-6">
          Insurance that moves<br />as fast as your life does
        </h2>
        <p className="text-slate-500 text-lg max-w-xl mx-auto mb-10">
          Health, life, and vehicle coverage — apply in minutes, track everything in one place,
          and never chase paperwork again.
        </p>
        <div className="flex gap-4 justify-center">
          <Link to="/register" className="bg-brass text-ink font-semibold px-6 py-3 rounded hover:bg-brass-dark hover:text-white transition-colors">
            Explore Plans
          </Link>
          <Link to="/login" className="border border-ink text-ink font-semibold px-6 py-3 rounded hover:bg-ink hover:text-white transition-colors">
            Sign In
          </Link>
        </div>
      </section>

      {/* Trust strip */}
      <section className="border-y border-ink/10 bg-white py-8">
        <div className="max-w-4xl mx-auto grid grid-cols-3 text-center gap-4">
          <div>
            <p className="font-display text-3xl text-ink">10k+</p>
            <p className="text-sm text-slate-500">Policies Managed</p>
          </div>
          <div>
            <p className="font-display text-3xl text-ink">24hr</p>
            <p className="text-sm text-slate-500">Average Claim Review</p>
          </div>
          <div>
            <p className="font-display text-3xl text-ink">98%</p>
            <p className="text-sm text-slate-500">Customer Satisfaction</p>
          </div>
        </div>
      </section>

      {/* Plan teasers */}
      <section className="px-8 py-20 max-w-5xl mx-auto">
        <h3 className="font-display text-3xl text-ink text-center mb-2">Coverage built around you</h3>
        <p className="text-slate-500 text-center mb-12">Pick a plan, apply instantly, manage it all from one dashboard.</p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.map((plan) => (
            <div key={plan.id} className="bg-white p-6 rounded-lg shadow border-t-4 border-brass">
              <p className="text-xs uppercase tracking-widest text-brass-dark font-semibold mb-2">{plan.plan_type}</p>
              <h4 className="font-display text-xl text-ink mb-2">{plan.name}</h4>
              <p className="text-sm text-slate-500 mb-4">{plan.description}</p>
              <p className="text-sm text-ink font-semibold">₹{plan.base_premium.toLocaleString()}/yr</p>
              <p className="text-xs text-slate-400">Coverage up to ₹{plan.coverage_amount.toLocaleString()}</p>
            </div>
          ))}
          {plans.length === 0 && (
            <p className="col-span-3 text-center text-slate-400 text-sm">Plans will appear here once published.</p>
          )}
        </div>

        <div className="text-center mt-10">
          <Link to="/register" className="text-ink font-semibold underline hover:text-brass-dark transition-colors">
            View all plans →
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-ink/10 py-6 text-center text-sm text-slate-400">
        © 2026 Insura Management Platform · Built as an internship project
      </footer>
    </div>
  );
}