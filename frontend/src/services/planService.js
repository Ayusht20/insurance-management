import axiosInstance from "../api/axiosInstance";

export const getPlans = () => axiosInstance.get("/plans/");
export const getPlan = (id) => axiosInstance.get(`/plans/${id}`);
export const createPlan = (data) => axiosInstance.post("/plans/", data);