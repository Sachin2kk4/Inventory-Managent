import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  BarChart3,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Boxes,
} from 'lucide-react';

/**
 * Sidebar Navigation Component
 * Collapsible sidebar with animated transitions and active state indicators
 * Receives collapsed state from parent Layout for coordinated margin adjustments
 */
const Sidebar = ({ collapsed, setCollapsed }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/products', icon: Package, label: 'Products' },
    { to: '/orders', icon: ShoppingCart, label: 'Orders' },
    { to: '/inventory', icon: BarChart3, label: 'Inventory' },
  ];

  return (
    <aside
      className={`fixed left-0 top-0 h-full bg-dark-900/80 backdrop-blur-xl border-r border-dark-700/50 z-50 flex flex-col transition-all duration-300 ${
        collapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-6 border-b border-dark-700/50">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center flex-shrink-0">
          <Boxes className="w-5 h-5 text-white" />
        </div>
        {!collapsed && (
          <div className="overflow-hidden">
            <h1 className="text-lg font-bold text-white tracking-tight">InvTrack</h1>
            <p className="text-xs text-dark-400">Smart Inventory</p>
          </div>
        )}
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 py-4 px-3 space-y-1">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            title={collapsed ? item.label : undefined}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-all duration-200 group ${
                isActive
                  ? 'bg-primary-500/15 text-primary-400 shadow-lg shadow-primary-500/5'
                  : 'text-dark-400 hover:text-dark-100 hover:bg-dark-800/60'
              }`
            }
          >
            <item.icon className="w-5 h-5 flex-shrink-0" />
            {!collapsed && <span>{item.label}</span>}
          </NavLink>
        ))}
      </nav>

      {/* User Profile & Logout */}
      <div className="border-t border-dark-700/50 px-3 py-4 space-y-2">
        {!collapsed && user && (
          <div className="px-3 py-2">
            <p className="text-sm font-medium text-dark-200 truncate">{user.name}</p>
            <p className="text-xs text-dark-500 truncate">{user.email}</p>
          </div>
        )}
        <button
          onClick={handleLogout}
          title={collapsed ? 'Logout' : undefined}
          className="flex items-center gap-3 w-full px-3 py-3 rounded-xl text-sm font-medium text-dark-400 hover:text-danger hover:bg-danger/10 transition-all duration-200"
        >
          <LogOut className="w-5 h-5 flex-shrink-0" />
          {!collapsed && <span>Logout</span>}
        </button>
      </div>

      {/* Collapse Toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3.5 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-dark-800 border border-dark-600 flex items-center justify-center text-dark-400 hover:text-white hover:border-primary-500 transition-all"
      >
        {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
      </button>
    </aside>
  );
};

export default Sidebar;
