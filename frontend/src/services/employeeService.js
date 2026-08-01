import axiosInstance from "../api/axiosInstance";

export const getEmployees = () => axiosInstance.get("/employees/");
export const createEmployee = (data) => axiosInstance.post("/employees/", data);
export const deleteEmployee = (id) => axiosInstance.delete(`/employees/${id}`);