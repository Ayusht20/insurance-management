import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <nav className="bg-slate-800 text-white px-6 py-3 flex justify-between items-center">
      <div className="flex gap-4 font-medium">
        <Link to="/dashboard">Dashboard</Link>
        <Link to="/customers">Customers</Link>
        <Link to="/policies">Policies</Link>
        <Link to="/claims">Claims</Link>
        <Link to="/premiums">Premiums</Link>
      </div>
      <div className="flex items-center gap-4">
        <span className="text-sm text-slate-300">{user?.role}</span>
        <button onClick={handleLogout} className="bg-red-500 px-3 py-1 rounded text-sm">
          Logout
        </button>
      </div>
    </nav>
  );
}