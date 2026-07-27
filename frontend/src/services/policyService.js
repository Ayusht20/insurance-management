import axiosInstance from "../api/axiosInstance";

export const getPolicies = (params = {}) => axiosInstance.get("/policies/", { params });
export const getPolicy = (id) => axiosInstance.get(`/policies/${id}`);
export const createPolicy = (data) => axiosInstance.post("/policies/", data);
export const updatePolicy = (id, data) => axiosInstance.put(`/policies/${id}`, data);
export const renewPolicy = (id, new_end_date) =>
  axiosInstance.post(`/policies/${id}/renew?new_end_date=${new_end_date}`);
export const cancelPolicy = (id) => axiosInstance.post(`/policies/${id}/cancel`);
export const getExpiringPolicies = (days = 30) =>
  axiosInstance.get(`/policies/expiring/soon?days=${days}`);