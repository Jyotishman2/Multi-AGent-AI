import { Check, Crown, Loader2, X } from "lucide-react";
import { useEffect, useState } from "react";

import {
  createPaymentOrder,
  getCurrentPlan,
  getPlans,
  verifyPayment,
} from "../features/billing.js";

const loadRazorpay = () => {
  if (window.Razorpay) return Promise.resolve(true);

  return new Promise((resolve) => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

function PlanModal({ onClose, onPlanUpdated }) {
  const [plans, setPlans] = useState([]);
  const [currentPlan, setCurrentPlan] = useState("free");
  const [loading, setLoading] = useState(true);
  const [selectedPlan, setSelectedPlan] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    const loadPlans = async () => {
      try {
        const [availablePlans, current] = await Promise.all([
          getPlans(),
          getCurrentPlan(),
        ]);
        setPlans(availablePlans);
        setCurrentPlan(current.plan || "free");
        onPlanUpdated?.(current.plan || "free");
      } catch (requestError) {
        setError(
          requestError.response?.data?.message ||
            "Unable to load plans. Please try again."
        );
      } finally {
        setLoading(false);
      }
    };

    loadPlans();
  }, [onPlanUpdated]);

  const handleUpgrade = async (plan) => {
    if (plan.id === "free" || plan.id === currentPlan || selectedPlan) return;

    try {
      setSelectedPlan(plan.id);
      setError("");
      setSuccess("");

      const razorpayReady = await loadRazorpay();
      if (!razorpayReady) {
        throw new Error("Razorpay Checkout could not be loaded");
      }

      const order = await createPaymentOrder(plan.id);
      const checkout = new window.Razorpay({
        key: order.keyId,
        amount: order.amount,
        currency: order.currency,
        name: "MultiAgentAI",
        description: `${order.plan.name} plan`,
        order_id: order.orderId,
        handler: async (response) => {
          try {
            await verifyPayment({
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
            });
            setCurrentPlan(plan.id);
            onPlanUpdated?.(plan.id);
            setSuccess(`${plan.name} plan activated successfully.`);
          } catch (verificationError) {
            setError(
              verificationError.response?.data?.message ||
                "Payment was received but verification failed."
            );
          } finally {
            setSelectedPlan("");
          }
        },
        modal: {
          ondismiss: () => setSelectedPlan(""),
        },
        theme: { color: "#818cf8" },
      });

      checkout.on("payment.failed", () => {
        setSelectedPlan("");
        setError("Payment failed. Please try again.");
      });
      checkout.open();
    } catch (requestError) {
      setSelectedPlan("");
      setError(
        requestError.response?.data?.message ||
          requestError.message ||
          "Unable to start payment. Please try again."
      );
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/65 p-4 backdrop-blur-sm">
      <div className="w-full max-w-3xl rounded-2xl border border-white/[0.1] bg-[#12151d] shadow-2xl">
        <div className="flex items-center justify-between border-b border-white/[0.07] px-5 py-4 md:px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-500/15 text-indigo-300">
              <Crown size={17} />
            </div>
            <div>
              <h2 className="text-[15px] font-semibold text-slate-100">
                Choose your plan
              </h2>
              <p className="text-xs text-slate-500">
                Current plan: {currentPlan}
              </p>
            </div>
          </div>
          <button
            type="button"
            aria-label="Close plans"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg border-0 bg-transparent text-slate-500 hover:bg-white/[0.06] hover:text-slate-200"
          >
            <X size={17} />
          </button>
        </div>

        <div className="p-5 md:p-6">
          {error && (
            <div className="mb-4 rounded-lg border border-red-400/20 bg-red-400/10 px-3 py-2 text-xs text-red-200">
              {error}
            </div>
          )}
          {success && (
            <div className="mb-4 rounded-lg border border-emerald-400/20 bg-emerald-400/10 px-3 py-2 text-xs text-emerald-200">
              {success}
            </div>
          )}

          {loading ? (
            <div className="flex min-h-40 items-center justify-center text-slate-500">
              <Loader2 size={20} className="animate-spin" />
            </div>
          ) : (
            <div className="grid gap-3 md:grid-cols-3">
              {plans.map((plan) => {
                const isCurrent = plan.id === currentPlan;
                const isFree = plan.id === "free";
                const isBusy = selectedPlan === plan.id;

                return (
                  <div
                    key={plan.id}
                    className={`flex flex-col rounded-xl border p-4 ${
                      isCurrent
                        ? "border-indigo-400/50 bg-indigo-500/[0.1]"
                        : "border-white/[0.08] bg-white/[0.025]"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="text-sm font-semibold text-slate-100">
                          {plan.name}
                        </h3>
                        <p className="mt-1 text-2xl font-semibold text-white">
                          {isFree ? "Free" : `₹${plan.amount}`}
                        </p>
                      </div>
                      {isCurrent && (
                        <span className="rounded-full bg-indigo-400/15 px-2 py-1 text-[10px] font-medium text-indigo-200">
                          Current
                        </span>
                      )}
                    </div>

                    <div className="mt-4 space-y-2 text-xs text-slate-400">
                      <p className="flex items-center gap-2">
                        <Check size={13} className="text-emerald-400" />
                        {plan.credits} AI credits
                      </p>
                      <p className="flex items-center gap-2">
                        <Check size={13} className="text-emerald-400" />
                        Valid for {plan.validity} days
                      </p>
                    </div>

                    <button
                      type="button"
                      disabled={isCurrent || isFree || Boolean(selectedPlan)}
                      onClick={() => handleUpgrade(plan)}
                      className="mt-5 flex min-h-9 items-center justify-center gap-2 rounded-lg border border-indigo-400/30 bg-indigo-500/15 px-3 text-xs font-medium text-indigo-100 hover:bg-indigo-500/25 disabled:cursor-not-allowed disabled:opacity-45"
                    >
                      {isBusy && <Loader2 size={14} className="animate-spin" />}
                      {isCurrent ? "Active plan" : isFree ? "Included" : "Upgrade"}
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default PlanModal;
