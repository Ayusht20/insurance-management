import axiosInstance from "../api/axiosInstance";

export const getPlans = () => axiosInstance.get("/plans/");
export const getPlan = (id) => axiosInstance.get(`/plans/${id}`);
export const createPlan = (data) => axiosInstance.post("/plans/", data);
export const getAllPlans = () => axiosInstance.get("/plans/all");
export const updatePlan = (id, data) => axiosInstance.put(`/plans/${id}`, data);