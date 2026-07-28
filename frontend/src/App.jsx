import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Customers from "./pages/Customers";
import Policies from "./pages/Policies";
import Claims from "./pages/Claims";
import Premiums from "./pages/Premiums";
import Plans from "./pages/Plans";
import MyPolicies from "./pages/MyPolicies";

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/customers" element={<ProtectedRoute allowedRoles={["admin", "agent"]}><Customers /></ProtectedRoute>} />
          <Route path="/policies" element={<ProtectedRoute allowedRoles={["admin", "agent"]}><Policies /></ProtectedRoute>} />
          <Route path="/claims" element={<ProtectedRoute><Claims /></ProtectedRoute>} />
          <Route path="/premiums" element={<ProtectedRoute allowedRoles={["admin", "agent"]}><Premiums /></ProtectedRoute>} />
          <Route path="/plans" element={<ProtectedRoute><Plans /></ProtectedRoute>} />
          <Route path="/my-policies" element={<ProtectedRoute allowedRoles={["customer"]}><MyPolicies /></ProtectedRoute>} />
          <Route path="/" element={<Navigate to="/dashboard" />} />
          <Route path="*" element={<Navigate to="/dashboard" />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;