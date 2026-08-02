import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Documents from "./pages/Documents";
import MyDocuments from "./pages/MyDocuments";
import Employees from "./pages/Employees";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Customers from "./pages/Customers";
import Policies from "./pages/Policies";
import Claims from "./pages/Claims";
import Premiums from "./pages/Premiums";
import Plans from "./pages/Plans";
import MyPolicies from "./pages/MyPolicies";
import ManagePlans from "./pages/ManagePlans";
import Landing from "./pages/Landing";
function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
<Routes>
  <Route path="/" element={<Landing />} />
  <Route path="/login" element={<Login />} />
  <Route path="/register" element={<Register />} />
  <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
  <Route path="/customers" element={<ProtectedRoute allowedRoles={["admin", "agent"]}><Customers /></ProtectedRoute>} />
  <Route path="/policies" element={<ProtectedRoute allowedRoles={["admin", "agent"]}><Policies /></ProtectedRoute>} />
  <Route path="/claims" element={<ProtectedRoute><Claims /></ProtectedRoute>} />
  <Route path="/premiums" element={<ProtectedRoute allowedRoles={["admin", "agent"]}><Premiums /></ProtectedRoute>} />
  <Route path="/documents" element={<ProtectedRoute allowedRoles={["admin", "agent"]}><Documents /></ProtectedRoute>} />
  <Route path="/my-documents" element={<ProtectedRoute allowedRoles={["customer"]}><MyDocuments /></ProtectedRoute>} />
  <Route path="/plans" element={<ProtectedRoute><Plans /></ProtectedRoute>} />
  <Route path="/manage-plans" element={<ProtectedRoute allowedRoles={["admin"]}><ManagePlans /></ProtectedRoute>} />
  <Route path="/my-policies" element={<ProtectedRoute allowedRoles={["customer"]}><MyPolicies /></ProtectedRoute>} />
  <Route path="/employees" element={<ProtectedRoute allowedRoles={["admin"]}><Employees /></ProtectedRoute>} />
  <Route path="*" element={<Navigate to="/" />} />
</Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;