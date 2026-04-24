import { useState, useEffect } from 'react';
import api from '../api/axios';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { AlertTriangle, Package, TrendingDown, Boxes } from 'lucide-react';
import StatCard from '../components/StatCard';

/**
 * Inventory Page
 * Stock levels overview, category breakdown, and low stock management
 */
const CHART_COLORS = [
  '#6366f1', '#818cf8', '#10b981', '#f59e0b',
  '#ef4444', '#3b82f6', '#a855f7', '#ec4899', '#14b8a6',
];

const Inventory = () => {
  const [stats, setStats] = useState(null);
  const [products, setProducts] = useState([]);
  const [categoryStats, setCategoryStats] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [dashRes, prodRes, catRes] = await Promise.all([
        api.get('/dashboard/stats'),
        api.get('/products', { params: { limit: 100, sort: 'quantity' } }),
        api.get('/products/categories/stats'),
      ]);

      setStats(dashRes.data.stats);
      setProducts(prodRes.data.products);
      setCategoryStats(catRes.data.stats);
    } catch (error) {
      console.error('Failed to fetch inventory data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (num) =>
    new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
    }).format(num);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const lowStockProducts = products.filter((p) => p.isLowStock);
  const wellStockedProducts = products.filter((p) => !p.isLowStock);

  const chartData = categoryStats.map((c) => ({
    category: c._id,
    count: c.count,
    value: c.totalValue,
  }));

  return (
    <div className="space-y-5 min-w-0">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Inventory Overview</h1>
        <p className="text-dark-400 text-sm mt-0.5">Monitor stock levels and category distribution</p>
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
          title="Inventory Value"
          value={formatCurrency(stats?.inventoryValue || 0)}
          icon={Boxes}
          color="success"
        />
        <StatCard
          title="Cost Value"
          value={formatCurrency(stats?.inventoryCost || 0)}
          icon={TrendingDown}
          color="info"
        />
      </div>

      {/* Category Value Chart */}
      <div className="bg-dark-900/60 border border-dark-700/50 rounded-2xl p-5">
        <h2 className="text-base font-semibold text-white mb-4">Category Breakdown</h2>
        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={chartData} layout="vertical" margin={{ left: 20, right: 20, bottom: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" horizontal={false} />
              <XAxis type="number" stroke="#64748b" fontSize={11} tickFormatter={(v) => `₹${v.toLocaleString('en-IN')}`} />
              <YAxis
                dataKey="category"
                type="category"
                stroke="#64748b"
                fontSize={11}
                width={120}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1e293b',
                  border: '1px solid rgba(148,163,184,0.1)',
                  borderRadius: '12px',
                  color: '#f1f5f9',
                  fontSize: '12px',
                }}
                formatter={(value) => [formatCurrency(value), 'Total Value']}
              />
              <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                {chartData.map((_, idx) => (
                  <Cell key={idx} fill={CHART_COLORS[idx % CHART_COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex items-center justify-center h-[280px] text-dark-500 text-sm">
            <p>No category data available</p>
          </div>
        )}
      </div>

      {/* Stock Levels */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Low Stock Products */}
        <div className="bg-dark-900/60 border border-dark-700/50 rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle className="w-4 h-4 text-amber-400" />
            <h2 className="text-base font-semibold text-white">
              Low Stock ({lowStockProducts.length})
            </h2>
          </div>
          <div className="space-y-2 max-h-[350px] overflow-y-auto pr-1">
            {lowStockProducts.length > 0 ? (
              lowStockProducts.map((product) => (
                <div
                  key={product._id}
                  className="flex items-center justify-between p-3 rounded-xl bg-amber-500/5 border border-amber-500/10"
                >
                  <div className="flex items-center gap-2.5 flex-1 min-w-0 mr-4">
                    <div className="w-8 h-8 rounded-lg bg-amber-500/15 flex items-center justify-center flex-shrink-0">
                      <Package className="w-4 h-4 text-amber-400" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-white truncate">{product.name}</p>
                      <p className="text-xs text-dark-500 truncate">
                        {product.category} • {product.sku}
                      </p>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0 ml-3">
                    <p className="text-base font-bold text-amber-400">{product.quantity}</p>
                    <div className="w-16 h-1 bg-dark-700 rounded-full mt-1 overflow-hidden">
                      <div
                        className="h-full bg-amber-400 rounded-full"
                        style={{
                          width: `${Math.min(100, (product.quantity / product.lowStockThreshold) * 100)}%`,
                        }}
                      />
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-dark-500 text-center py-6">
                All products are above threshold 🎉
              </p>
            )}
          </div>
        </div>

        {/* Well Stocked Products */}
        <div className="bg-dark-900/60 border border-dark-700/50 rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <Package className="w-4 h-4 text-emerald-400" />
            <h2 className="text-base font-semibold text-white">
              Well Stocked ({wellStockedProducts.length})
            </h2>
          </div>
          <div className="space-y-2 max-h-[350px] overflow-y-auto pr-1">
            {wellStockedProducts.length > 0 ? (
              wellStockedProducts.map((product) => (
                <div
                  key={product._id}
                  className="flex items-center justify-between p-3 rounded-xl bg-dark-800/40"
                >
                  <div className="flex items-center gap-2.5 flex-1 min-w-0 mr-4">
                    <div className="w-8 h-8 rounded-lg bg-emerald-500/15 flex items-center justify-center flex-shrink-0">
                      <Package className="w-4 h-4 text-emerald-400" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-white truncate">{product.name}</p>
                      <p className="text-xs text-dark-500 truncate">
                        {product.category} • {product.sku}
                      </p>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0 ml-3">
                    <p className="text-base font-bold text-emerald-400">{product.quantity}</p>
                    <div className="w-16 h-1 bg-dark-700 rounded-full mt-1 overflow-hidden">
                      <div
                        className="h-full bg-emerald-400 rounded-full"
                        style={{
                          width: `${Math.min(100, (product.quantity / 100) * 100)}%`,
                        }}
                      />
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-dark-500 text-center py-6">No products yet</p>
            )}
          </div>
        </div>
      </div>

      {/* Category Summary Table */}
      <div className="bg-dark-900/60 border border-dark-700/50 rounded-2xl p-5">
        <h2 className="text-base font-semibold text-white mb-3">Category Summary</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-dark-700/50">
                <th className="text-left text-xs font-semibold text-dark-400 uppercase tracking-wider py-2.5 px-3">
                  Category
                </th>
                <th className="text-center text-xs font-semibold text-dark-400 uppercase tracking-wider py-2.5 px-3 w-[80px]">
                  Products
                </th>
                <th className="text-right text-xs font-semibold text-dark-400 uppercase tracking-wider py-2.5 px-3 w-[120px]">
                  Total Value
                </th>
                <th className="text-right text-xs font-semibold text-dark-400 uppercase tracking-wider py-2.5 px-3 w-[100px]">
                  Avg. Price
                </th>
              </tr>
            </thead>
            <tbody>
              {categoryStats.map((cat, i) => (
                <tr key={cat._id} className="border-b border-dark-800/50 hover:bg-dark-800/30 transition-colors">
                  <td className="py-2.5 px-3">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                        style={{ backgroundColor: CHART_COLORS[i % CHART_COLORS.length] }}
                      />
                      <span className="text-sm text-white">{cat._id}</span>
                    </div>
                  </td>
                  <td className="py-2.5 px-3 text-center text-sm text-dark-300">{cat.count}</td>
                  <td className="py-2.5 px-3 text-right text-sm font-medium text-white">
                    {formatCurrency(cat.totalValue)}
                  </td>
                  <td className="py-2.5 px-3 text-right text-sm text-dark-300">
                    {formatCurrency(cat.avgPrice)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Inventory;
