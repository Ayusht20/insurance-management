import axiosInstance from "../api/axiosInstance";

export const getDashboardSummary = () => axiosInstance.get("/reports/summary");
export const getPoliciesByStatus = () => axiosInstance.get("/reports/policies/by-status");
export const getClaimsByStatus = () => axiosInstance.get("/reports/claims/by-status");
export const getCustomerGrowth = () => axiosInstance.get("/reports/customers/growth");
export const getMonthlyPremiumCollection = () =>
  axiosInstance.get("/reports/premiums/monthly-collection");

export const notifyExpiringPolicies = (days = 30) =>
  axiosInstance.post(`/reports/notify/expiring-policies?days=${days}`);
export const notifyOverduePremiums = () =>
  axiosInstance.post("/reports/notify/overdue-premiums");