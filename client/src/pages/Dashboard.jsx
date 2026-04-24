import { useState, useEffect } from 'react';
import api from '../api/axios';
import StatCard from '../components/StatCard';
import { useAuth } from '../context/AuthContext';
import {
  Package,
  AlertTriangle,
  DollarSign,
  ShoppingCart,
  TrendingUp,
  Boxes,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

/**
 * Dashboard Page
 * Shows key business metrics, charts, recent orders, and low stock warnings
 */
const CHART_COLORS = ['#6366f1', '#818cf8', '#a5b4fc', '#4f46e5', '#3730a3', '#c7d2fe', '#312e81', '#e0e7ff'];

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const res = await api.get('/dashboard/stats');
      setStats(res.data.stats);
    } catch (error) {
      console.error('Dashboard fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (num) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(num);
  };

  const getMonthName = (month) => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return months[month - 1];
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const monthlyData = stats?.monthlyRevenue?.map((m) => ({
    month: getMonthName(m._id.month),
    revenue: m.revenue,
    orders: m.orderCount,
  })) || [];

  const categoryData = stats?.categoryDistribution?.map((c) => ({
    name: c._id,
    value: c.count,
  })) || [];

  const statusColor = {
    pending: 'text-amber-400 bg-amber-500/10',
    processing: 'text-blue-400 bg-blue-500/10',
    shipped: 'text-purple-400 bg-purple-500/10',
    delivered: 'text-emerald-400 bg-emerald-500/10',
    cancelled: 'text-red-400 bg-red-500/10',
  };

  return (
    <div className="space-y-6 min-w-0">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">
          Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 17 ? 'afternoon' : 'evening'},{' '}
          <span className="gradient-text">{user?.name?.split(' ')[0]}</span>
        </h1>
        <p className="text-dark-400 text-sm mt-2">Here's what's happening with your inventory today.</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Products"
          value={stats?.totalProducts || 0}
          icon={Package}
          color="primary"
        />
        <StatCard
          title="Low Stock"
          value={stats?.lowStockProducts || 0}
          icon={AlertTriangle}
          color="warning"
        />
        <StatCard
          title="Revenue"
          value={formatCurrency(stats?.totalRevenue || 0)}
          icon={DollarSign}
          color="success"
        />
        <StatCard
          title="Orders"
          value={stats?.totalOrders || 0}
          icon={ShoppingCart}
          color="info"
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        {/* Revenue Chart — takes 3 columns */}
        <div className="lg:col-span-3 bg-dark-900/60 border border-dark-700/50 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-semibold text-white">Revenue Overview</h2>
              <p className="text-xs text-dark-400">Last 6 months</p>
            </div>
            <TrendingUp className="w-4 h-4 text-primary-400" />
          </div>
          {monthlyData.length > 0 ? (
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="month" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={11} tickFormatter={(v) => `₹${v}`} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1e293b',
                    border: '1px solid rgba(148,163,184,0.1)',
                    borderRadius: '12px',
                    color: '#f1f5f9',
                    fontSize: '12px',
                  }}
                  formatter={(value) => [`₹${value.toLocaleString('en-IN')}`, 'Revenue']}
                />
                <Bar dataKey="revenue" fill="url(#barGradient)" radius={[4, 4, 0, 0]} />
                <defs>
                  <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#6366f1" />
                    <stop offset="100%" stopColor="#4f46e5" />
                  </linearGradient>
                </defs>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[240px] text-dark-500 text-sm">
              <p>No revenue data yet. Create some orders to see trends.</p>
            </div>
          )}
        </div>

        {/* Category Pie Chart — takes 2 columns */}
        <div className="lg:col-span-2 bg-dark-900/60 border border-dark-700/50 rounded-2xl p-5">
          <h2 className="text-base font-semibold text-white mb-4">By Category</h2>
          {categoryData.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={170}>
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={70}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {categoryData.map((_, idx) => (
                      <Cell key={idx} fill={CHART_COLORS[idx % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1e293b',
                      border: '1px solid rgba(148,163,184,0.1)',
                      borderRadius: '12px',
                      color: '#f1f5f9',
                      fontSize: '12px',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-2 mt-4">
                {categoryData.slice(0, 5).map((c, i) => (
                  <div key={c.name} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2 min-w-0">
                      <div
                        className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                        style={{ backgroundColor: CHART_COLORS[i % CHART_COLORS.length] }}
                      />
                      <span className="text-dark-300 truncate">{c.name}</span>
                    </div>
                    <span className="text-dark-400 ml-2 flex-shrink-0">{c.value}</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center h-[170px] text-dark-500 text-sm">
              <p>No products yet</p>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Recent Orders */}
        <div className="bg-dark-900/60 border border-dark-700/50 rounded-2xl p-5">
          <h2 className="text-base font-semibold text-white mb-3">Recent Orders</h2>
          <div className="space-y-2">
            {stats?.recentOrders?.length > 0 ? (
              stats.recentOrders.map((order) => (
                <div
                  key={order._id}
                  className="flex items-center justify-between p-3 rounded-xl bg-dark-800/40 hover:bg-dark-800/60 transition-colors"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-white truncate">{order.customerName}</p>
                    <p className="text-xs text-dark-500">{order.orderNumber}</p>
                  </div>
                  <div className="text-right flex-shrink-0 ml-3">
                    <p className="text-sm font-semibold text-white">{formatCurrency(order.totalAmount)}</p>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${statusColor[order.status]}`}>
                      {order.status}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-dark-500 text-center py-6">No orders yet</p>
            )}
          </div>
        </div>

        {/* Low Stock Alerts */}
        <div className="bg-dark-900/60 border border-dark-700/50 rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="w-4 h-4 text-amber-400" />
            <h2 className="text-base font-semibold text-white">Low Stock Alerts</h2>
          </div>
          <div className="space-y-2">
            {stats?.lowStockList?.length > 0 ? (
              stats.lowStockList.map((product) => (
                <div
                  key={product._id}
                  className="flex items-center justify-between p-3 rounded-xl bg-dark-800/40 hover:bg-dark-800/60 transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center flex-shrink-0">
                      <Boxes className="w-4 h-4 text-amber-400" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-white truncate">{product.name}</p>
                      <p className="text-xs text-dark-500">{product.sku}</p>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0 ml-3">
                    <p className="text-base font-bold text-amber-400">{product.quantity}</p>
                    <p className="text-xs text-dark-500">/ {product.lowStockThreshold}</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-dark-500 text-center py-6">All products are well-stocked 🎉</p>
            )}
          </div>
        </div>
      </div>

      {/* Inventory Value Card */}
      <div className="bg-gradient-to-r from-primary-600/15 to-primary-800/5 border border-primary-500/15 rounded-2xl p-5">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-semibold text-white">Total Inventory Value</h2>
            <p className="text-xs text-dark-400 mt-0.5">Combined value of all products in stock</p>
          </div>
          <div className="text-right">
            <p className="text-3xl font-bold text-white">{formatCurrency(stats?.inventoryValue || 0)}</p>
            <p className="text-xs text-dark-400 mt-0.5">
              Cost basis: {formatCurrency(stats?.inventoryCost || 0)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
