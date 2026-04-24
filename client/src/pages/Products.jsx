import { useState, useEffect } from 'react';
import api from '../api/axios';
import toast from 'react-hot-toast';
import {
  Plus,
  Search,
  Edit3,
  Trash2,
  X,
  Package,
  Filter,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
} from 'lucide-react';

const CATEGORIES = [
  'Electronics',
  'Clothing',
  'Food & Beverages',
  'Furniture',
  'Office Supplies',
  'Tools & Hardware',
  'Health & Beauty',
  'Sports & Outdoors',
  'Other',
];

const initialFormState = {
  name: '',
  sku: '',
  description: '',
  category: 'Electronics',
  price: '',
  costPrice: '',
  quantity: '',
  lowStockThreshold: '10',
  supplier: '',
};

/**
 * Products Page
 * Full CRUD interface for managing inventory products
 */
const Products = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [form, setForm] = useState(initialFormState);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchProducts();
  }, [currentPage, search, categoryFilter]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const params = { page: currentPage, limit: 10 };
      if (search) params.search = search;
      if (categoryFilter) params.category = categoryFilter;

      const res = await api.get('/products', { params });
      setProducts(res.data.products);
      setTotalPages(res.data.totalPages);
      setTotal(res.data.total);
    } catch (error) {
      toast.error('Failed to fetch products');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editingProduct) {
        await api.put(`/products/${editingProduct._id}`, form);
        toast.success('Product updated');
      } else {
        await api.post('/products', form);
        toast.success('Product created');
      }
      closeModal();
      fetchProducts();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Operation failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    try {
      await api.delete(`/products/${id}`);
      toast.success('Product deleted');
      fetchProducts();
    } catch (error) {
      toast.error('Failed to delete product');
    }
  };

  const openEditModal = (product) => {
    setEditingProduct(product);
    setForm({
      name: product.name,
      sku: product.sku,
      description: product.description || '',
      category: product.category,
      price: product.price,
      costPrice: product.costPrice,
      quantity: product.quantity,
      lowStockThreshold: product.lowStockThreshold,
      supplier: product.supplier || '',
    });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingProduct(null);
    setForm(initialFormState);
  };

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
    setCurrentPage(1);
  };

  return (
    <div className="space-y-6 min-w-0">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-white">Products</h1>
          <p className="text-dark-400 text-sm mt-0.5">{total} products in inventory</p>
        </div>
        <button
          id="add-product-btn"
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-primary-600 to-primary-500 text-white text-sm font-semibold hover:from-primary-500 hover:to-primary-400 transition-all shadow-lg shadow-primary-500/20"
        >
          <Plus className="w-4 h-4" />
          Add Product
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-500" />
          <input
            id="product-search"
            type="text"
            placeholder="Search by name or SKU..."
            value={search}
            onChange={handleSearchChange}
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-dark-900/60 border border-dark-700/50 text-white text-sm placeholder:text-dark-500 focus:outline-none focus:border-primary-500"
          />
        </div>
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-dark-500" />
          <select
            id="category-filter"
            value={categoryFilter}
            onChange={(e) => {
              setCategoryFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="pl-9 pr-4 py-2 rounded-xl bg-dark-900/60 border border-dark-700/50 text-white text-sm focus:outline-none focus:border-primary-500 cursor-pointer"
          >
            <option value="">All Categories</option>
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-dark-900/60 border border-dark-700/50 rounded-2xl overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : products.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-dark-500">
            <Package className="w-10 h-10 mb-2" />
            <p className="text-sm">No products found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px]">
              <thead>
                <tr className="border-b border-dark-700/50 bg-dark-900/40">
                  <th className="text-left text-xs font-semibold text-dark-400 uppercase tracking-wider px-4 py-4">
                    Product
                  </th>
                  <th className="text-left text-xs font-semibold text-dark-400 uppercase tracking-wider px-4 py-4 w-[100px]">
                    SKU
                  </th>
                  <th className="text-left text-xs font-semibold text-dark-400 uppercase tracking-wider px-4 py-4 w-[130px]">
                    Category
                  </th>
                  <th className="text-right text-xs font-semibold text-dark-400 uppercase tracking-wider px-4 py-4 w-[100px]">
                    Price
                  </th>
                  <th className="text-center text-xs font-semibold text-dark-400 uppercase tracking-wider px-4 py-4 w-[80px]">
                    Stock
                  </th>
                  <th className="text-center text-xs font-semibold text-dark-400 uppercase tracking-wider px-4 py-4 w-[80px]">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <tr
                    key={product._id}
                    className="border-b border-dark-800/50 hover:bg-dark-800/30 transition-colors"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-primary-500/10 flex items-center justify-center flex-shrink-0">
                          <Package className="w-4 h-4 text-primary-400" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-white truncate">{product.name}</p>
                          {product.supplier && (
                            <p className="text-xs text-dark-500 truncate">{product.supplier}</p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs text-dark-300 font-mono">{product.sku}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs px-2 py-0.5 rounded-full bg-primary-500/10 text-primary-400">
                        {product.category}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className="text-sm font-medium text-white">₹{product.price.toLocaleString('en-IN')}</span>
                      <span className="text-xs text-dark-500 block">Cost: ₹{product.costPrice.toLocaleString('en-IN')}</span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <span
                          className={`text-sm font-semibold ${
                            product.isLowStock ? 'text-amber-400' : 'text-emerald-400'
                          }`}
                        >
                          {product.quantity}
                        </span>
                        {product.isLowStock && (
                          <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => openEditModal(product)}
                          className="p-1.5 rounded-lg text-dark-400 hover:text-primary-400 hover:bg-primary-500/10 transition-all"
                          title="Edit"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(product._id)}
                          className="p-1.5 rounded-lg text-dark-400 hover:text-red-400 hover:bg-red-500/10 transition-all"
                          title="Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
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

      {/* Modal - Add/Edit Product */}
      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-dark-900 border border-dark-700/50 rounded-2xl w-full max-w-lg mx-4 shadow-2xl max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-5 py-3 border-b border-dark-700/50">
              <h2 className="text-base font-semibold text-white">
                {editingProduct ? 'Edit Product' : 'Add New Product'}
              </h2>
              <button
                onClick={closeModal}
                className="p-1.5 rounded-lg text-dark-400 hover:text-white hover:bg-dark-800 transition-all"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSubmit} className="p-5 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label className="text-xs font-medium text-dark-300 mb-1 block">Product Name *</label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    required
                    className="w-full px-3 py-2 rounded-xl bg-dark-800/60 border border-dark-600/50 text-white text-sm placeholder:text-dark-500 focus:outline-none focus:border-primary-500"
                    placeholder="e.g., MacBook Pro 16"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-dark-300 mb-1 block">SKU *</label>
                  <input
                    type="text"
                    value={form.sku}
                    onChange={(e) => setForm({ ...form, sku: e.target.value })}
                    required
                    className="w-full px-3 py-2 rounded-xl bg-dark-800/60 border border-dark-600/50 text-white text-sm placeholder:text-dark-500 focus:outline-none focus:border-primary-500"
                    placeholder="e.g., ELEC-001"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-dark-300 mb-1 block">Category *</label>
                  <select
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-dark-800/60 border border-dark-600/50 text-white text-sm focus:outline-none focus:border-primary-500 cursor-pointer"
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium text-dark-300 mb-1 block">Selling Price (₹) *</label>
                  <input
                    type="number"
                    value={form.price}
                    onChange={(e) => setForm({ ...form, price: e.target.value })}
                    required
                    min="0"
                    step="0.01"
                    className="w-full px-3 py-2 rounded-xl bg-dark-800/60 border border-dark-600/50 text-white text-sm focus:outline-none focus:border-primary-500"
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-dark-300 mb-1 block">Cost Price (₹) *</label>
                  <input
                    type="number"
                    value={form.costPrice}
                    onChange={(e) => setForm({ ...form, costPrice: e.target.value })}
                    required
                    min="0"
                    step="0.01"
                    className="w-full px-3 py-2 rounded-xl bg-dark-800/60 border border-dark-600/50 text-white text-sm focus:outline-none focus:border-primary-500"
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-dark-300 mb-1 block">Quantity *</label>
                  <input
                    type="number"
                    value={form.quantity}
                    onChange={(e) => setForm({ ...form, quantity: e.target.value })}
                    required
                    min="0"
                    className="w-full px-3 py-2 rounded-xl bg-dark-800/60 border border-dark-600/50 text-white text-sm focus:outline-none focus:border-primary-500"
                    placeholder="0"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-dark-300 mb-1 block">Low Stock Threshold</label>
                  <input
                    type="number"
                    value={form.lowStockThreshold}
                    onChange={(e) => setForm({ ...form, lowStockThreshold: e.target.value })}
                    min="0"
                    className="w-full px-3 py-2 rounded-xl bg-dark-800/60 border border-dark-600/50 text-white text-sm focus:outline-none focus:border-primary-500"
                    placeholder="10"
                  />
                </div>
                <div className="col-span-2">
                  <label className="text-xs font-medium text-dark-300 mb-1 block">Supplier</label>
                  <input
                    type="text"
                    value={form.supplier}
                    onChange={(e) => setForm({ ...form, supplier: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-dark-800/60 border border-dark-600/50 text-white text-sm placeholder:text-dark-500 focus:outline-none focus:border-primary-500"
                    placeholder="e.g., Apple Inc."
                  />
                </div>
                <div className="col-span-2">
                  <label className="text-xs font-medium text-dark-300 mb-1 block">Description</label>
                  <textarea
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    rows={2}
                    className="w-full px-3 py-2 rounded-xl bg-dark-800/60 border border-dark-600/50 text-white text-sm placeholder:text-dark-500 focus:outline-none focus:border-primary-500 resize-none"
                    placeholder="Optional description..."
                  />
                </div>
              </div>

              {/* Modal Footer */}
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-dark-700/50">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 rounded-xl text-dark-400 hover:text-white hover:bg-dark-800 transition-all text-sm font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-primary-600 to-primary-500 text-white text-sm font-semibold hover:from-primary-500 hover:to-primary-400 disabled:opacity-50 transition-all"
                >
                  {submitting ? 'Saving...' : editingProduct ? 'Update Product' : 'Create Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Products;
