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

export const downloadDocument = async (documentId, fileName) => {
  const response = await axiosInstance.get(`/documents/${documentId}/download`, {
    responseType: "blob",
  });
  const url = window.URL.createObjectURL(new Blob([response.data]));
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", fileName || "document");
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
};