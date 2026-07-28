import { useEffect, useState } from "react";
import Layout from "../components/Layout";
import { getPlans } from "../services/planService";
import { applyForPolicy } from "../services/policyService";
import { useAuth } from "../context/AuthContext";

export default function Plans() {
  const { user } = useAuth();
  const [plans, setPlans] = useState([]);
  const [message, setMessage] = useState("");

  useEffect(() => {
    getPlans().then((res) => setPlans(res.data)).catch(() => {});
  }, []);

  const handleApply = async (planId) => {
    setMessage("");
    try {
      await applyForPolicy(planId);
      setMessage("Policy created successfully! Check 'My Policies'.");
    } catch (err) {
      setMessage(err.response?.data?.detail || "Failed to apply");
    }
  };

  const typeColor = { health: "border-green-400", life: "border-purple-400", vehicle: "border-blue-400" };

  return (
    <Layout>
      <h1 className="text-2xl font-bold mb-4">Insurance Plans</h1>
      {message && <p className="mb-4 text-sm text-blue-700 bg-blue-50 p-2 rounded">{message}</p>}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {plans.map((plan) => (
          <div key={plan.id} className={`bg-white p-5 rounded-lg shadow border-t-4 ${typeColor[plan.plan_type] || "border-slate-300"}`}>
            <h2 className="font-bold text-lg">{plan.name}</h2>
            <p className="text-sm text-slate-500 mb-3">{plan.description}</p>
            <p className="text-sm">Coverage: <span className="font-semibold">₹{plan.coverage_amount.toLocaleString()}</span></p>
            <p className="text-sm mb-4">Premium: <span className="font-semibold">₹{plan.base_premium.toLocaleString()}/yr</span></p>
            {user?.role === "customer" && (
              <button onClick={() => handleApply(plan.id)} className="w-full bg-blue-600 text-white py-2 rounded">
                Apply Now
              </button>
            )}
          </div>
        ))}
      </div>
    </Layout>
  );
}