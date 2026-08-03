import { useEffect, useState } from "react";
// import { verifyPolicyOtp, resendPolicyOtp } from "../services/policyService";
import { verifyPolicyOtp, resendPolicyOtp, cancelPendingApplication } from "../services/policyService";
export default function OtpModal({ policy, onClose, onVerified }) {
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [cooldown, setCooldown] = useState(60);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [cooldown]);

  const handleVerify = async (e) => {
    e.preventDefault();
    setError("");
    setVerifying(true);
    try {
      const res = await verifyPolicyOtp(policy.id, otp);
      onVerified(res.data);
    } catch (err) {
      setError(err.response?.data?.detail || "Verification failed");
    } finally {
      setVerifying(false);
    }
  };
  const handleCancel = async () => {
  try {
    await cancelPendingApplication(policy.id);
  } catch {
   
  }
  onClose();
};

  const handleResend = async () => {
    setError("");
    setMessage("");
    try {
      await resendPolicyOtp(policy.id);
      setMessage("A new OTP has been sent.");
      setCooldown(60);
    } catch (err) {
      setError(err.response?.data?.detail || "Could not resend OTP");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-sm">
        <h2 className="font-display text-2xl mb-1">Verify Your Application</h2>
        <p className="text-sm text-slate-500 mb-5">
          We've sent a 6-digit code to your registered email for policy <b>{policy.policy_number}</b>.
        </p>

        <form onSubmit={handleVerify} className="space-y-3">
          <input
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            maxLength={6}
            placeholder="Enter 6-digit OTP"
            className="w-full border p-3 rounded text-center text-lg tracking-widest"
            required
          />
          {error && <p className="text-rust text-sm">{error}</p>}
          {message && <p className="text-sage text-sm">{message}</p>}

          <button type="submit" disabled={verifying} className="w-full bg-brass text-ink font-semibold py-2 rounded hover:bg-brass-dark hover:text-white disabled:opacity-50">
            {verifying ? "Verifying..." : "Confirm & Activate Policy"}
          </button>
        </form>

        <button
          onClick={handleResend}
          disabled={cooldown > 0}
          className="w-full text-sm text-ink mt-3 disabled:text-slate-400"
        >
          {cooldown > 0 ? `Resend OTP in ${cooldown}s` : "Resend OTP"}
        </button>

        <button onClick={handleCancel} className="w-full text-xs text-slate-400 mt-2">Cancel</button>
      </div>
    </div>
  );
}