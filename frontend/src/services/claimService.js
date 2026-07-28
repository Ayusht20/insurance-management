import axiosInstance from "../api/axiosInstance";

export const getClaims = (params = {}) => axiosInstance.get("/claims/", { params });
export const getClaim = (id) => axiosInstance.get(`/claims/${id}`);
export const submitClaim = (data) => axiosInstance.post("/claims/", data);
export const reviewClaim = (id, status) => axiosInstance.put(`/claims/${id}/review`, { status });
export const getMyClaims = () => axiosInstance.get("/claims/my");