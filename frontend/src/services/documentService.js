import axiosInstance from "../api/axiosInstance";

export const uploadDocument = (customerId, file) => {
  const formData = new FormData();
  formData.append("file", file);
  return axiosInstance.post(`/documents/${customerId}`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};
export const getCustomerDocuments = (customerId) =>
  axiosInstance.get(`/documents/customer/${customerId}`);
export const downloadDocumentUrl = (documentId) =>
  `${axiosInstance.defaults.baseURL}/documents/${documentId}/download`;