import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import { Toaster } from 'react-hot-toast';

/**
 * Layout Component
 * Provides the main app shell with sidebar and content area
 * Owns the sidebar collapsed state so the main content margin adjusts dynamically
 */
const Layout = () => {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="flex min-h-screen bg-dark-950">
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#1e293b',
            color: '#f1f5f9',
            border: '1px solid rgba(148, 163, 184, 0.1)',
          },
          success: { iconTheme: { primary: '#10b981', secondary: '#f1f5f9' } },
          error: { iconTheme: { primary: '#ef4444', secondary: '#f1f5f9' } },
        }}
      />
      <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />
      <main
        className="flex-1 min-w-0 p-6 overflow-x-hidden overflow-y-auto transition-[margin-left] duration-300"
        style={{ marginLeft: collapsed ? '5rem' : '16rem' }}
      >
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;
