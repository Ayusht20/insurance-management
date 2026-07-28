import axiosInstance from "../api/axiosInstance";

export const getPayments = (params = {}) => axiosInstance.get("/premiums/", { params });
export const recordPayment = (data) => axiosInstance.post("/premiums/", data);
export const updatePaymentStatus = (id, payment_status) =>
  axiosInstance.put(`/premiums/${id}`, { payment_status });
export const getOverduePayments = () => axiosInstance.get("/premiums/overdue/list");
export const getMyPayments = () => axiosInstance.get("/premiums/my");