import { useEffect, useState } from "react";
import Layout from "../components/Layout";
import { getCustomers } from "../services/customerService";
import {
  uploadDocument, getCustomerDocuments, downloadDocumentUrl,
} from "../services/documentService";
import { useAuth } from "../context/AuthContext";

export default function Documents() {
  const { user } = useAuth();
  const isStaff = user?.role === "admin" || user?.role === "agent";

  const [customers, setCustomers] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState("");
  const [file, setFile] = useState(null);
  const [docs, setDocs] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (isStaff) {
      getCustomers().then((res) => setCustomers(res.data)).catch(() => {});
    }
  }, [isStaff]);

  const loadDocs = (customerId) => {
    if (!customerId) return;
    getCustomerDocuments(customerId).then((res) => setDocs(res.data)).catch(() => {});
  };

  useEffect(() => {
    if (selectedCustomer) loadDocs(selectedCustomer);
  }, [selectedCustomer]);

  const handleUpload = async (e) => {
    e.preventDefault();
    setError("");
    if (!file || !selectedCustomer) {
      setError("Select a customer and choose a file first");
      return;
    }
    setUploading(true);
    try {
      await uploadDocument(selectedCustomer, file);
      setFile(null);
      loadDocs(selectedCustomer);
    } catch (err) {
      setError(err.response?.data?.detail || "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  return (
    <Layout>
      <h1 className="text-2xl font-bold mb-4">Documents</h1>

      {isStaff && (
        <div className="bg-white p-4 rounded shadow mb-6">
          <label className="text-sm text-slate-500 block mb-1">Select Customer</label>
          <select
            value={selectedCustomer}
            onChange={(e) => setSelectedCustomer(e.target.value)}
            className="border p-2 rounded w-full mb-4"
          >
            <option value="">-- Select --</option>
            {customers.map((c) => <option key={c.id} value={c.id}>{c.name} ({c.email})</option>)}
          </select>

          <form onSubmit={handleUpload} className="flex gap-2">
            <input
              type="file"
              onChange={(e) => setFile(e.target.files[0])}
              className="border p-2 rounded flex-1"
            />
            <button type="submit" disabled={uploading} className="bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50">
              {uploading ? "Uploading..." : "Upload"}
            </button>
          </form>
          {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
        </div>
      )}

      {selectedCustomer && (
        <div className="bg-white rounded shadow">
          <table className="w-full">
            <thead>
              <tr className="text-left border-b">
                <th className="p-3">File Name</th><th className="p-3">Uploaded</th><th className="p-3">Action</th>
              </tr>
            </thead>
            <tbody>
              {docs.map((d) => (
                <tr key={d.id} className="border-b">
                  <td className="p-3">{d.file_name}</td>
                  <td className="p-3 text-sm text-slate-500">{new Date(d.uploaded_at).toLocaleDateString()}</td>
                  <td className="p-3">
                    <a href={downloadDocumentUrl(d.id)} target="_blank" rel="noreferrer" className="text-blue-600 text-sm">
                      Download
                    </a>
                  </td>
                </tr>
              ))}
              {docs.length === 0 && (
                <tr><td colSpan="3" className="p-3 text-slate-400 text-sm">No documents uploaded yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </Layout>
  );
}