import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const staffLinks = [
  { to: "/dashboard", label: "Dashboard" },
  { to: "/customers", label: "Customers" },
  { to: "/policies", label: "Policies" },
  { to: "/claims", label: "Claims" },
  { to: "/premiums", label: "Premiums" },
  { to: "/documents", label: "Documents" },
  { to: "/plans", label: "Plans" },
];
const adminOnlyLinks = [
  { to: "/employees", label: "Employees" },
  { to: "/manage-plans", label: "Manage Plans" },
];

const customerLinks = [
  { to: "/dashboard", label: "Dashboard" },
  { to: "/plans", label: "Plans" },
  { to: "/my-policies", label: "My Policies" },
  { to: "/claims", label: "My Claims" },
  { to: "/my-documents", label: "My Documents" },
];

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const isStaff = user?.role === "admin" || user?.role === "agent";
  const links = isStaff ? staffLinks : customerLinks;

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <aside className="w-64 bg-ink text-white min-h-screen flex flex-col fixed left-0 top-0">
      <div className="px-6 py-6 border-b border-white/10">
        <h1 className="font-display text-2xl tracking-tight">Insura</h1>
        <p className="text-xs text-white/50 mt-1 uppercase tracking-widest">Management Platform</p>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            className={({ isActive }) =>
              `block px-3 py-2 rounded text-sm font-medium transition-colors ${
                isActive ? "bg-brass text-ink" : "text-white/70 hover:bg-white/10 hover:text-white"
              }`
            }
          >
            {link.label}
          </NavLink>
        ))}
        {user?.role === "admin" &&
          adminOnlyLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                `block px-3 py-2 rounded text-sm font-medium transition-colors ${
                  isActive ? "bg-brass text-ink" : "text-white/70 hover:bg-white/10 hover:text-white"
                }`
              }
            >
              {link.label}
            </NavLink>
          ))}
      </nav>

      <div className="px-6 py-4 border-t border-white/10">
        <p className="text-xs text-white/40 uppercase tracking-widest mb-1">Signed in as</p>
        <p className="text-sm font-medium capitalize mb-3">{user?.role}</p>
        <button
          onClick={handleLogout}
          className="w-full bg-white/10 hover:bg-rust text-white text-sm py-2 rounded transition-colors"
        >
          Logout
        </button>
      </div>
    </aside>
  );
}