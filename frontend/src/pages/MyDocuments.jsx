import { useEffect, useState } from "react";
import Layout from "../components/Layout";
import { getMyPolicies } from "../services/policyService";
import axiosInstance from "../api/axiosInstance";
import { uploadDocument, getCustomerDocuments, downloadDocument } from "../services/documentService";
export default function MyDocuments() {
  const [customerId, setCustomerId] = useState(null);
  const [docs, setDocs] = useState([]);
  const [file, setFile] = useState(null);
  const [error, setError] = useState("");
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    // policies carry customer_id; grab it from any owned policy
    getMyPolicies().then((res) => {
      if (res.data.length > 0) {
        const cid = res.data[0].customer_id;
        setCustomerId(cid);
        getCustomerDocuments(cid).then((r) => setDocs(r.data)).catch(() => {});
      }
    }).catch(() => {});
  }, []);

  const handleUpload = async (e) => {
    e.preventDefault();
    setError("");
    if (!file || !customerId) {
      setError("Choose a file first");
      return;
    }
    setUploading(true);
    try {
      await uploadDocument(customerId, file);
      setFile(null);
      const r = await getCustomerDocuments(customerId);
      setDocs(r.data);
    } catch (err) {
      setError(err.response?.data?.detail || "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  return (
    <Layout>
      <h1 className="text-2xl font-bold mb-4">My Documents</h1>

      <form onSubmit={handleUpload} className="bg-white p-4 rounded shadow mb-6 flex gap-2">
        <input type="file" onChange={(e) => setFile(e.target.files[0])} className="border p-2 rounded flex-1" />
        <button type="submit" disabled={uploading} className="bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50">
          {uploading ? "Uploading..." : "Upload"}
        </button>
      </form>
      {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

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
                  <button onClick={() => downloadDocument(d.id, d.file_name)} className="text-blue-600 text-sm">Download</button>
                </td>
              </tr>
            ))}
            {docs.length === 0 && <tr><td colSpan="3" className="p-3 text-slate-400 text-sm">No documents uploaded yet.</td></tr>}
          </tbody>
        </table>
      </div>
    </Layout>
  );
}