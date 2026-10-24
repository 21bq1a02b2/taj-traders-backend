import React, { useState, useEffect } from 'react';
import {
  X,
  Plus,
  Trash2,
  Edit2,
  RefreshCw,
  Package,
  ShoppingBag,
  Database,
  Loader2,
} from 'lucide-react';
import {
  createProduct,
  updateProduct,
  deleteProduct,
  resetSeedData,
  fetchOrders,
  updateOrderStatus,
} from '../api';

const CATEGORIES = [
  'Hair Care',
  'Hair Color & Treatment',
  'Makeup',
  'Salon Furniture',
  'Skin Care',
  'Waxing',
  'Professional Equipment',
  'Barber Supplies',
];

export default function AdminModal({
  isOpen,
  onClose,
  products,
  onRefreshProducts,
  dbStatus,
}) {
  const [activeTab, setActiveTab] = useState('products');
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');

  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    brand: '',
    category: 'Hair Care',
    subcategory: '',
    price: '',
    mrp: '',
    wholesaleTierPrice: '',
    minWholesaleQty: 3,
    stock: 50,
    rating: 4.8,
    reviewCount: 5,
    volumeOrWeight: 'MOQ: 1 piece',
    image: '',
    description: '',
    isFeatured: false,
    isBestSeller: false,
  });

  useEffect(() => {
    if (isOpen && activeTab === 'orders') {
      loadOrders();
    }
  }, [isOpen, activeTab]);

  const loadOrders = async () => {
    setLoadingOrders(true);
    try {
      const res = await fetchOrders();
      setOrders(res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingOrders(false);
    }
  };

  if (!isOpen) return null;

  const handleResetForm = () => {
    setEditingId(null);
    setFormData({
      name: '',
      brand: '',
      category: 'Hair Care',
      subcategory: '',
      price: '',
      mrp: '',
      wholesaleTierPrice: '',
      minWholesaleQty: 3,
      stock: 50,
      rating: 4.8,
      reviewCount: 5,
      volumeOrWeight: 'MOQ: 1 piece',
      image: '',
      description: '',
      isFeatured: false,
      isBestSeller: false,
    });
  };

  const handleEditClick = (p) => {
    setEditingId(p._id || p.id);
    setFormData({
      name: p.name || '',
      brand: p.brand || '',
      category: p.category || 'Hair Care',
      subcategory: p.subcategory || '',
      price: p.price || '',
      mrp: p.mrp || '',
      wholesaleTierPrice: p.wholesaleTierPrice || '',
      minWholesaleQty: p.minWholesaleQty || 3,
      stock: p.stock || 50,
      rating: p.rating || 4.8,
      reviewCount: p.reviewCount || 5,
      volumeOrWeight: p.volumeOrWeight || 'MOQ: 1 piece',
      image: p.image || '',
      description: p.description || '',
      isFeatured: !!p.isFeatured,
      isBestSeller: !!p.isBestSeller,
    });
    setActiveTab('add');
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    setActionLoading(true);
    try {
      await deleteProduct(id);
      setStatusMessage('Product deleted successfully');
      await onRefreshProducts();
      setTimeout(() => setStatusMessage(''), 3000);
    } catch (err) {
      alert(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleSaveProduct = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      const payload = {
        ...formData,
        price: Number(formData.price),
        mrp: Number(formData.mrp),
        wholesaleTierPrice: formData.wholesaleTierPrice
          ? Number(formData.wholesaleTierPrice)
          : undefined,
        stock: Number(formData.stock),
        rating: Number(formData.rating),
        reviewCount: Number(formData.reviewCount),
      };

      if (editingId) {
        await updateProduct(editingId, payload);
        setStatusMessage('Product updated successfully!');
      } else {
        await createProduct(payload);
        setStatusMessage('New product added to catalog!');
      }

      await onRefreshProducts();
      handleResetForm();
      setActiveTab('products');
      setTimeout(() => setStatusMessage(''), 3000);
    } catch (err) {
      alert(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleReseedCatalog = async () => {
    if (!window.confirm('Reset catalog to the authentic Taj Traders products?')) return;
    setActionLoading(true);
    try {
      await resetSeedData();
      await onRefreshProducts();
      setStatusMessage('Catalog reseeded successfully!');
      setTimeout(() => setStatusMessage(''), 3000);
    } catch (err) {
      alert(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await updateOrderStatus(orderId, newStatus);
      loadOrders();
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6">
      <div className="relative bg-white rounded-3xl max-w-5xl w-full shadow-2xl overflow-hidden border border-slate-200 my-8 flex flex-col max-h-[90vh]">
        {/* Top Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between bg-brand-900 text-white">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-brand-700 flex items-center justify-center font-bold">
              TT
            </div>
            <div>
              <h2 className="font-extrabold text-base sm:text-lg">
                Taj Traders — Product &amp; Order Admin
              </h2>
              <div className="flex items-center gap-2 text-xs text-brand-200">
                <span>Database:</span>
                <span className="inline-flex items-center gap-1 font-mono text-emerald-400 font-bold">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  {dbStatus || 'Connected'}
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-brand-800 hover:bg-brand-700 flex items-center justify-center text-slate-300 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="bg-slate-100 p-2 sm:px-6 flex items-center justify-between border-b border-slate-200 text-xs font-bold">
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab('products')}
              className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all ${
                activeTab === 'products'
                  ? 'bg-white text-brand-700 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Package className="w-3.5 h-3.5" /> Products ({products.length})
            </button>
            <button
              onClick={() => setActiveTab('orders')}
              className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all ${
                activeTab === 'orders'
                  ? 'bg-white text-brand-700 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <ShoppingBag className="w-3.5 h-3.5" /> Customer Orders
            </button>
            <button
              onClick={() => {
                handleResetForm();
                setActiveTab('add');
              }}
              className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all ${
                activeTab === 'add'
                  ? 'bg-brand-700 text-white shadow-sm'
                  : 'bg-white text-slate-700 hover:bg-slate-50'
              }`}
            >
              <Plus className="w-3.5 h-3.5" />
              {editingId ? 'Edit Product' : 'Add New Product'}
            </button>
          </div>

          <button
            onClick={handleReseedCatalog}
            disabled={actionLoading}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-brand-100 hover:bg-brand-200 text-brand-800 rounded-lg transition-colors font-semibold"
            title="Reset catalog with authentic 24 Taj Traders items"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${actionLoading ? 'animate-spin' : ''}`} />
            <span>Reseed Taj Traders Catalog</span>
          </button>
        </div>

        {/* Status banner */}
        {statusMessage && (
          <div className="bg-emerald-50 text-emerald-800 text-xs px-6 py-2 border-b border-emerald-100 font-medium">
            {statusMessage}
          </div>
        )}

        {/* Tab Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          {activeTab === 'products' && (
            <div className="space-y-3">
              <div className="flex justify-between items-center text-xs text-slate-500 pb-2">
                <span>Manage Taj Traders cosmetics, salon equipment &amp; pricing:</span>
                <span className="font-bold text-slate-700">{products.length} Products Found</span>
              </div>

              <div className="divide-y divide-slate-100 border border-slate-200 rounded-2xl overflow-hidden bg-white">
                {products.map((p) => (
                  <div
                    key={p._id || p.id}
                    className="p-3 sm:p-4 flex items-center justify-between gap-3 hover:bg-slate-50/70 transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <img
                        src={p.image}
                        alt={p.name}
                        className="w-12 h-12 rounded-xl object-cover bg-slate-100 shrink-0"
                      />
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-bold text-brand-700 uppercase">
                            {p.brand}
                          </span>
                          <span className="text-[10px] bg-slate-100 px-1.5 py-0.2 rounded text-slate-600">
                            {p.category}
                          </span>
                        </div>
                        <h4 className="text-xs sm:text-sm font-bold text-slate-900 truncate">
                          {p.name}
                        </h4>
                        <div className="flex items-center gap-2 text-xs text-slate-500">
                          <span className="font-bold text-slate-800">₹{p.price}</span>
                          {p.mrp && <span className="line-through text-[11px]">₹{p.mrp}</span>}
                          {p.wholesaleTierPrice && (
                            <span className="text-emerald-700 font-semibold text-[11px]">
                              Wholesale: ₹{p.wholesaleTierPrice}
                            </span>
                          )}
                          <span>&bull; Stock: {p.stock || 50}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => handleEditClick(p)}
                        className="p-2 text-slate-500 hover:text-brand-700 hover:bg-brand-50 rounded-lg transition-colors"
                        title="Edit"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(p._id || p.id)}
                        className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'orders' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center text-xs text-slate-500">
                <span>Customer inquiries &amp; online orders for Taj Traders:</span>
                <button
                  onClick={loadOrders}
                  className="flex items-center gap-1 text-brand-700 font-bold hover:underline"
                >
                  <RefreshCw className="w-3.5 h-3.5" /> Refresh Orders
                </button>
              </div>

              {loadingOrders ? (
                <div className="py-12 flex justify-center text-slate-400">
                  <Loader2 className="w-6 h-6 animate-spin" />
                </div>
              ) : orders.length === 0 ? (
                <div className="text-center py-12 text-slate-400 text-xs">
                  No orders placed yet. Place a test order in the store to see it recorded here!
                </div>
              ) : (
                <div className="space-y-3">
                  {orders.map((ord) => (
                    <div
                      key={ord._id}
                      className="p-4 bg-white border border-slate-200 rounded-2xl space-y-3 shadow-sm"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-2">
                        <div>
                          <span className="font-mono text-xs font-bold text-slate-800">
                            #{ord._id}
                          </span>
                          <span className="text-[11px] text-slate-400 ml-2">
                            {new Date(ord.createdAt).toLocaleString()}
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="text-xs bg-slate-100 px-2 py-0.5 rounded font-bold text-slate-700">
                            {ord.orderType || 'Wholesale'}
                          </span>
                          <select
                            value={ord.status}
                            onChange={(e) => handleStatusChange(ord._id, e.target.value)}
                            className="text-xs font-bold px-2 py-1 bg-brand-50 text-brand-700 border border-brand-200 rounded-lg outline-none"
                          >
                            <option value="Pending">Pending</option>
                            <option value="Confirmed">Confirmed</option>
                            <option value="Processing">Processing</option>
                            <option value="Dispatched">Dispatched</option>
                            <option value="Delivered">Delivered</option>
                            <option value="Cancelled">Cancelled</option>
                          </select>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                        <div>
                          <p className="text-slate-500">Customer:</p>
                          <p className="font-bold text-slate-800">
                            {ord.customerName} ({ord.phone})
                          </p>
                          <p className="text-slate-600">
                            {ord.address}, {ord.city} - {ord.pincode}
                          </p>
                        </div>

                        <div>
                          <p className="text-slate-500">Payment &amp; Total:</p>
                          <p className="font-bold text-slate-800">
                            {ord.paymentMethod} &bull; Total: <span className="text-brand-700 font-extrabold text-sm">₹{ord.totalAmount?.toLocaleString()}</span>
                          </p>
                          <p className="text-slate-500 text-[11px]">
                            Items: {ord.items?.length || 0} products
                          </p>
                        </div>
                      </div>

                      <div className="bg-slate-50 p-2.5 rounded-xl space-y-1 text-xs">
                        {ord.items?.map((it, idx) => (
                          <div key={idx} className="flex justify-between text-slate-700">
                            <span className="truncate max-w-xs">
                              {it.quantity}x {it.name}
                            </span>
                            <span className="font-bold">₹{it.price * it.quantity}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'add' && (
            <form onSubmit={handleSaveProduct} className="space-y-4 max-w-2xl mx-auto">
              <h3 className="text-sm font-bold text-slate-900 border-b pb-2">
                {editingId ? 'Edit Product' : 'Add New Product to Taj Traders'}
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="sm:col-span-2">
                  <label className="block text-slate-700 font-bold mb-1">
                    Product Title *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Professional Barber Continuous Spray Bottle"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-brand-600 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">
                    Brand Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Grandeur Salon Equipment"
                    value={formData.brand}
                    onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-brand-600 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">
                    Category *
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-brand-600 focus:bg-white font-semibold"
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">
                    Selling Price (₹) *
                  </label>
                  <input
                    type="number"
                    required
                    placeholder="850"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-brand-600 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">
                    MRP Price (₹) *
                  </label>
                  <input
                    type="number"
                    required
                    placeholder="1700"
                    value={formData.mrp}
                    onChange={(e) => setFormData({ ...formData, mrp: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-brand-600 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">
                    Wholesale Slab Price (₹)
                  </label>
                  <input
                    type="number"
                    placeholder="720"
                    value={formData.wholesaleTierPrice}
                    onChange={(e) => setFormData({ ...formData, wholesaleTierPrice: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-brand-600 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">
                    Stock Quantity
                  </label>
                  <input
                    type="number"
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-brand-600 focus:bg-white"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-slate-700 font-bold mb-1">
                    Image URL *
                  </label>
                  <input
                    type="url"
                    required
                    placeholder="https://res.cloudinary.com/..."
                    value={formData.image}
                    onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-brand-600 focus:bg-white"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-slate-700 font-bold mb-1">
                    Product Description *
                  </label>
                  <textarea
                    rows={3}
                    required
                    placeholder="Commercial salon grade description..."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-brand-600 focus:bg-white"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    handleResetForm();
                    setActiveTab('products');
                  }}
                  className="px-4 py-2 border border-slate-200 rounded-xl text-xs font-semibold hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-6 py-2 bg-brand-700 hover:bg-brand-800 text-white font-bold rounded-xl text-xs shadow-md transition-all disabled:opacity-50"
                >
                  {actionLoading ? 'Saving...' : editingId ? 'Update Product' : 'Add Product'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
