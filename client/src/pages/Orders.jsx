import { useState, useEffect } from 'react';
import api from '../api/axios';
import toast from 'react-hot-toast';
import {
  Plus,
  X,
  ShoppingCart,
  ChevronLeft,
  ChevronRight,
  Trash2,
  Eye,
  Filter,
} from 'lucide-react';

/**
 * Orders Page
 * Create orders, view order details, manage order status
 */
const statusColors = {
  pending: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
  processing: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
  shipped: 'text-purple-400 bg-purple-500/10 border-purple-500/20',
  delivered: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
  cancelled: 'text-red-400 bg-red-500/10 border-red-500/20',
};

const paymentColors = {
  unpaid: 'text-red-400 bg-red-500/10',
  paid: 'text-emerald-400 bg-emerald-500/10',
  refunded: 'text-amber-400 bg-amber-500/10',
};

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [products, setProducts] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [statusFilter, setStatusFilter] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Create order form state
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [notes, setNotes] = useState('');
  const [orderItems, setOrderItems] = useState([{ product: '', quantity: 1 }]);

  useEffect(() => {
    fetchOrders();
  }, [currentPage, statusFilter]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const params = { page: currentPage, limit: 10 };
      if (statusFilter) params.status = statusFilter;

      const res = await api.get('/orders', { params });
      setOrders(res.data.orders);
      setTotalPages(res.data.totalPages);
      setTotal(res.data.total);
    } catch (error) {
      toast.error('Failed to fetch orders');
    } finally {
      setLoading(false);
    }
  };

  const fetchProducts = async () => {
    try {
      const res = await api.get('/products', { params: { limit: 100 } });
      setProducts(res.data.products);
    } catch (error) {
      toast.error('Failed to fetch products');
    }
  };

  const openCreateModal = () => {
    fetchProducts();
    setCustomerName('');
    setCustomerEmail('');
    setNotes('');
    setOrderItems([{ product: '', quantity: 1 }]);
    setShowCreateModal(true);
  };

  const addItem = () => {
    setOrderItems([...orderItems, { product: '', quantity: 1 }]);
  };

  const removeItem = (index) => {
    if (orderItems.length === 1) return;
    setOrderItems(orderItems.filter((_, i) => i !== index));
  };

  const updateItem = (index, field, value) => {
    const updated = [...orderItems];
    updated[index][field] = value;
    setOrderItems(updated);
  };

  const calculateTotal = () => {
    return orderItems.reduce((sum, item) => {
      const product = products.find((p) => p._id === item.product);
      if (!product) return sum;
      return sum + product.price * item.quantity;
    }, 0);
  };

  const handleCreateOrder = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const items = orderItems
        .filter((item) => item.product)
        .map((item) => ({
          product: item.product,
          quantity: parseInt(item.quantity),
        }));

      if (items.length === 0) {
        toast.error('Add at least one product');
        setSubmitting(false);
        return;
      }

      await api.post('/orders', { items, customerName, customerEmail, notes });
      toast.success('Order created successfully');
      setShowCreateModal(false);
      fetchOrders();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create order');
    } finally {
      setSubmitting(false);
    }
  };

  const updateStatus = async (orderId, status) => {
    try {
      await api.put(`/orders/${orderId}`, { status });
      toast.success('Status updated');
      fetchOrders();
      if (selectedOrder?._id === orderId) {
        setSelectedOrder({ ...selectedOrder, status });
      }
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  const updatePayment = async (orderId, paymentStatus) => {
    try {
      await api.put(`/orders/${orderId}`, { paymentStatus });
      toast.success('Payment status updated');
      fetchOrders();
      if (selectedOrder?._id === orderId) {
        setSelectedOrder({ ...selectedOrder, paymentStatus });
      }
    } catch (error) {
      toast.error('Failed to update payment');
    }
  };

  const viewOrderDetail = async (orderId) => {
    try {
      const res = await api.get(`/orders/${orderId}`);
      setSelectedOrder(res.data.order);
      setShowDetailModal(true);
    } catch (error) {
      toast.error('Failed to load order details');
    }
  };

  const formatCurrency = (num) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 0 }).format(num);

  return (
    <div className="space-y-6 min-w-0">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-white">Orders</h1>
          <p className="text-dark-400 text-sm mt-0.5">{total} total orders</p>
        </div>
        <button
          id="create-order-btn"
          onClick={openCreateModal}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-primary-600 to-primary-500 text-white text-sm font-semibold hover:from-primary-500 hover:to-primary-400 transition-all shadow-lg shadow-primary-500/20"
        >
          <Plus className="w-4 h-4" />
          New Order
        </button>
      </div>

      {/* Status Filter */}
      <div className="flex items-center gap-2">
        <Filter className="w-3.5 h-3.5 text-dark-500" />
        <select
          id="order-status-filter"
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setCurrentPage(1);
          }}
          className="px-3 py-2 rounded-xl bg-dark-900/60 border border-dark-700/50 text-white text-sm focus:outline-none focus:border-primary-500 cursor-pointer"
        >
          <option value="">All Status</option>
          <option value="pending">Pending</option>
          <option value="processing">Processing</option>
          <option value="shipped">Shipped</option>
          <option value="delivered">Delivered</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      {/* Orders Table */}
      <div className="bg-dark-900/60 border border-dark-700/50 rounded-2xl overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : orders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-dark-500">
            <ShoppingCart className="w-10 h-10 mb-2" />
            <p className="text-sm">No orders found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px]">
              <thead>
                <tr className="border-b border-dark-700/50 bg-dark-900/40">
                  <th className="text-left text-xs font-semibold text-dark-400 uppercase tracking-wider px-4 py-4 w-[120px]">
                    Order
                  </th>
                  <th className="text-left text-xs font-semibold text-dark-400 uppercase tracking-wider px-4 py-4">
                    Customer
                  </th>
                  <th className="text-center text-xs font-semibold text-dark-400 uppercase tracking-wider px-4 py-4 w-[70px]">
                    Items
                  </th>
                  <th className="text-right text-xs font-semibold text-dark-400 uppercase tracking-wider px-4 py-4 w-[110px]">
                    Total
                  </th>
                  <th className="text-center text-xs font-semibold text-dark-400 uppercase tracking-wider px-4 py-4 w-[120px]">
                    Status
                  </th>
                  <th className="text-center text-xs font-semibold text-dark-400 uppercase tracking-wider px-4 py-4 w-[100px]">
                    Payment
                  </th>
                  <th className="text-center text-xs font-semibold text-dark-400 uppercase tracking-wider px-4 py-4 w-[50px]">
                    
                  </th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr
                    key={order._id}
                    className="border-b border-dark-800/50 hover:bg-dark-800/30 transition-colors"
                  >
                    <td className="px-4 py-3">
                      <span className="text-sm font-mono text-primary-400">{order.orderNumber}</span>
                      <p className="text-[13px] text-dark-400 mt-1">
                        {new Date(order.createdAt).toLocaleDateString('en-IN')}
                      </p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-sm text-white">{order.customerName}</p>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="text-xs text-dark-300">{order.items.length}</span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className="text-sm font-semibold text-white">
                        {formatCurrency(order.totalAmount)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <select
                        value={order.status}
                        onChange={(e) => updateStatus(order._id, e.target.value)}
                        className={`text-xs px-2 py-1 rounded-full border cursor-pointer ${statusColors[order.status]} focus:outline-none`}
                      >
                        <option value="pending">Pending</option>
                        <option value="processing">Processing</option>
                        <option value="shipped">Shipped</option>
                        <option value="delivered">Delivered</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <select
                        value={order.paymentStatus}
                        onChange={(e) => updatePayment(order._id, e.target.value)}
                        className={`text-xs px-2 py-1 rounded-full cursor-pointer ${paymentColors[order.paymentStatus]} focus:outline-none`}
                      >
                        <option value="unpaid">Unpaid</option>
                        <option value="paid">Paid</option>
                        <option value="refunded">Refunded</option>
                      </select>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => viewOrderDetail(order._id)}
                        className="p-1.5 rounded-lg text-dark-400 hover:text-primary-400 hover:bg-primary-500/10 transition-all"
                        title="View Details"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-4 border-t border-dark-700/50">
            <p className="text-xs text-dark-400">
              Page {currentPage} of {totalPages}
            </p>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-1.5 rounded-lg bg-dark-800/60 text-dark-400 hover:text-white disabled:opacity-30 transition-all"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="p-1.5 rounded-lg bg-dark-800/60 text-dark-400 hover:text-white disabled:opacity-30 transition-all"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Create Order Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-dark-900 border border-dark-700/50 rounded-2xl w-full max-w-lg mx-4 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-5 py-3 border-b border-dark-700/50">
              <h2 className="text-base font-semibold text-white">Create New Order</h2>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-1.5 rounded-lg text-dark-400 hover:text-white hover:bg-dark-800 transition-all"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateOrder} className="p-5 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-dark-300 mb-1 block">Customer Name *</label>
                  <input
                    type="text"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    required
                    className="w-full px-3 py-2 rounded-xl bg-dark-800/60 border border-dark-600/50 text-white text-sm focus:outline-none focus:border-primary-500"
                    placeholder="Customer name"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-dark-300 mb-1 block">Email</label>
                  <input
                    type="email"
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-dark-800/60 border border-dark-600/50 text-white text-sm focus:outline-none focus:border-primary-500"
                    placeholder="email@example.com"
                  />
                </div>
              </div>

              {/* Order Items */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-medium text-dark-300">Order Items *</label>
                  <button
                    type="button"
                    onClick={addItem}
                    className="text-xs text-primary-400 hover:text-primary-300"
                  >
                    + Add Item
                  </button>
                </div>
                <div className="space-y-2">
                  {orderItems.map((item, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <select
                        value={item.product}
                        onChange={(e) => updateItem(index, 'product', e.target.value)}
                        className="flex-1 px-3 py-2 rounded-xl bg-dark-800/60 border border-dark-600/50 text-white text-xs focus:outline-none focus:border-primary-500"
                      >
                        <option value="">Select product</option>
                        {products.map((p) => (
                          <option key={p._id} value={p._id}>
                            {p.name} (₹{p.price.toLocaleString('en-IN')}) — Stock: {p.quantity}
                          </option>
                        ))}
                      </select>
                      <input
                        type="number"
                        value={item.quantity}
                        onChange={(e) => updateItem(index, 'quantity', e.target.value)}
                        min="1"
                        className="w-16 px-2 py-2 rounded-xl bg-dark-800/60 border border-dark-600/50 text-white text-xs text-center focus:outline-none focus:border-primary-500"
                      />
                      <button
                        type="button"
                        onClick={() => removeItem(index)}
                        className="p-1.5 text-dark-500 hover:text-red-400 transition-all"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-dark-300 mb-1 block">Notes</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={2}
                  className="w-full px-3 py-2 rounded-xl bg-dark-800/60 border border-dark-600/50 text-white text-sm focus:outline-none focus:border-primary-500 resize-none"
                  placeholder="Optional notes..."
                />
              </div>

              {/* Order Total */}
              <div className="bg-dark-800/40 rounded-xl p-3 flex items-center justify-between">
                <span className="text-dark-400 text-sm font-medium">Estimated Total</span>
                <span className="text-lg font-bold text-white">{formatCurrency(calculateTotal())}</span>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-dark-700/50">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-xl text-dark-400 hover:text-white hover:bg-dark-800 transition-all text-sm font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-primary-600 to-primary-500 text-white text-sm font-semibold hover:from-primary-500 hover:to-primary-400 disabled:opacity-50 transition-all"
                >
                  {submitting ? 'Creating...' : 'Place Order'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Order Detail Modal */}
      {showDetailModal && selectedOrder && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-dark-900 border border-dark-700/50 rounded-2xl w-full max-w-lg mx-4 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-5 py-3 border-b border-dark-700/50">
              <div>
                <h2 className="text-base font-semibold text-white">Order Details</h2>
                <p className="text-xs text-primary-400 font-mono">{selectedOrder.orderNumber}</p>
              </div>
              <button
                onClick={() => setShowDetailModal(false)}
                className="p-1.5 rounded-lg text-dark-400 hover:text-white hover:bg-dark-800 transition-all"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              {/* Customer Info */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-xs text-dark-500 mb-0.5">Customer</p>
                  <p className="text-sm font-medium text-white">{selectedOrder.customerName}</p>
                </div>
                <div>
                  <p className="text-xs text-dark-500 mb-0.5">Email</p>
                  <p className="text-sm text-dark-300">{selectedOrder.customerEmail || '—'}</p>
                </div>
                <div>
                  <p className="text-xs text-dark-500 mb-0.5">Status</p>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${statusColors[selectedOrder.status]}`}>
                    {selectedOrder.status}
                  </span>
                </div>
                <div>
                  <p className="text-xs text-dark-500 mb-0.5">Payment</p>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${paymentColors[selectedOrder.paymentStatus]}`}>
                    {selectedOrder.paymentStatus}
                  </span>
                </div>
              </div>

              {/* Order Items */}
              <div>
                <p className="text-xs text-dark-500 mb-2 uppercase tracking-wider">Items</p>
                <div className="space-y-1.5">
                  {selectedOrder.items.map((item, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between p-2.5 rounded-xl bg-dark-800/40"
                    >
                      <div>
                        <p className="text-sm font-medium text-white">{item.productName}</p>
                        <p className="text-xs text-dark-500">
                          {item.quantity} × {formatCurrency(item.unitPrice)}
                        </p>
                      </div>
                      <span className="text-sm font-semibold text-white">{formatCurrency(item.total)}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Total */}
              <div className="bg-primary-500/10 border border-primary-500/20 rounded-xl p-3 flex items-center justify-between">
                <span className="text-primary-400 text-sm font-medium">Total Amount</span>
                <span className="text-xl font-bold text-white">
                  {formatCurrency(selectedOrder.totalAmount)}
                </span>
              </div>

              {selectedOrder.notes && (
                <div>
                  <p className="text-xs text-dark-500 mb-0.5">Notes</p>
                  <p className="text-sm text-dark-300">{selectedOrder.notes}</p>
                </div>
              )}

              <p className="text-xs text-dark-500 text-center">
                Created on {new Date(selectedOrder.createdAt).toLocaleString('en-IN')}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Orders;
