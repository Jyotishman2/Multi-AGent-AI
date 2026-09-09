import api from "../../utils/axios";

export const getPlans = async () => {
  const { data } = await api.get("/api/billing/plans");
  return data.plans;
};

export const getCurrentPlan = async () => {
  const { data } = await api.get("/api/billing/current");
  return data;
};

export const createPaymentOrder = async (plan) => {
  const { data } = await api.post("/api/billing/orders", { plan });
  return data;
};

export const verifyPayment = async (payment) => {
  const { data } = await api.post("/api/billing/verify", payment);
  return data;
};
