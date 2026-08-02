import { useEffect, useState } from "react";
import Layout from "../components/Layout";
import { getPlans } from "../services/planService";
import { useAuth } from "../context/AuthContext";
import ApplyModal from "../components/ApplyModal";
import OtpModal from "../components/OtpModal";
import CardSkeleton from "../components/CardSkeleton";

export default function Plans() {
  const { user } = useAuth();
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [applyingPlan, setApplyingPlan] = useState(null);
  const [pendingPolicy, setPendingPolicy] = useState(null);
  const [successMsg, setSuccessMsg] = useState("");

  useEffect(() => {
    getPlans().then((res) => setPlans(res.data)).finally(() => setLoading(false));
  }, []);

  const typeColor = { health: "border-green-400", life: "border-purple-400", vehicle: "border-blue-400" };

  return (
    <Layout>
      <h1 className="font-display text-3xl mb-4">Insurance Plans</h1>
      {successMsg && <p className="mb-4 text-sm text-sage bg-sage/10 p-3 rounded">{successMsg}</p>}

      {loading ? (
        <CardSkeleton count={3} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {plans.map((plan) => (
            <div key={plan.id} className={`bg-white p-5 rounded-lg shadow border-t-4 ${typeColor[plan.plan_type] || "border-slate-300"}`}>
              <h2 className="font-bold text-lg">{plan.name}</h2>
              <p className="text-sm text-slate-500 mb-3">{plan.description}</p>
              <p className="text-sm">Coverage: <span className="font-semibold">₹{plan.coverage_amount.toLocaleString()}</span></p>
              <p className="text-sm mb-4">Premium: <span className="font-semibold">₹{plan.base_premium.toLocaleString()}/yr</span></p>
              {user?.role === "customer" && (
                <button onClick={() => setApplyingPlan(plan)} className="w-full bg-ink text-white py-2 rounded hover:bg-ink-light transition-colors">
                  Apply Now
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {applyingPlan && (
        <ApplyModal
          plan={applyingPlan}
          onClose={() => setApplyingPlan(null)}
          onApplied={(policy) => {
            setApplyingPlan(null);
            setPendingPolicy(policy);
          }}
        />
      )}

      {pendingPolicy && (
        <OtpModal
          policy={pendingPolicy}
          onClose={() => setPendingPolicy(null)}
          onVerified={() => {
            setPendingPolicy(null);
            setSuccessMsg("Policy activated! Check My Policies for your payment schedule.");
          }}
        />
      )}
    </Layout>
  );
}