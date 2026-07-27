import axiosInstance from "../api/axiosInstance";

export const getCustomers = (search = "") =>
  axiosInstance.get(`/customers/${search ? `?search=${search}` : ""}`);
export const getCustomer = (id) => axiosInstance.get(`/customers/${id}`);
export const createCustomer = (data) => axiosInstance.post("/customers/", data);
export const updateCustomer = (id, data) => axiosInstance.put(`/customers/${id}`, data);
export const deleteCustomer = (id) => axiosInstance.delete(`/customers/${id}`);