'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  LayoutDashboard,
  Package,
  FolderTree,
  ShoppingBag,
  Users,
  Truck,
  Ticket,
  BarChart3,
  Activity,
  Bot,
  Globe,
  Settings,
  UserCheck,
  FileText,
  LogOut,
  Plus,
  Edit2,
  Trash2,
  Upload,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Send,
  Printer,
  RefreshCw,
  Percent,
  Save,
  Search,
} from 'lucide-react';
import { Product, Order, Category, ActivityEvent, AuditLog, AiApproval, Offer, Coupon, StoreSettings, DeliveryRule, Customer } from '@/lib/types';

export default function AdminDashboard() {
  const router = useRouter();

  // Auth State
  const [adminUser, setAdminUser] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [loading, setLoading] = useState(true);

  // Data States
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [offers, setOffers] = useState<Offer[]>([]);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [deliveryRules, setDeliveryRules] = useState<DeliveryRule[]>([]);
  const [customersList, setCustomersList] = useState<Customer[]>([]);
  const [adminUsersList, setAdminUsersList] = useState<any[]>([]);
  const [activityEvents, setActivityEvents] = useState<ActivityEvent[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [reportData, setReportData] = useState<any>(null);
  const [aiApprovals, setAiApprovals] = useState<AiApproval[]>([]);
  const [storeSettings, setStoreSettings] = useState<StoreSettings | null>(null);

  const [isMobileAdminNavOpen, setIsMobileAdminNavOpen] = useState(false);
  const [activitySeverityFilter, setActivitySeverityFilter] = useState<string>('all');
  const [customerSearchQuery, setCustomerSearchQuery] = useState<string>('');

  // Live Activity & Analytics State
  const [activitySubTab, setActivitySubTab] = useState<'all' | 'reviews' | 'visitors' | 'profits'>('all');
  const [reviewsList, setReviewsList] = useState<any[]>([]);
  const [visitorsList, setVisitorsList] = useState<any[]>([]);
  const [profitData, setProfitData] = useState<any>(null);

  // Customer Detail Modal State
  const [selectedCustomerDetail, setSelectedCustomerDetail] = useState<any | null>(null);
  const [isCustomerDetailModalOpen, setIsCustomerDetailModalOpen] = useState(false);

  // Modals & Forms State
  const [selectedProduct, setSelectedProduct] = useState<Partial<Product> | null>(null);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);

  // Offer Modal State
  const [selectedOffer, setSelectedOffer] = useState<Partial<Offer> | null>(null);
  const [isOfferModalOpen, setIsOfferModalOpen] = useState(false);

  // Coupon Modal State
  const [selectedCoupon, setSelectedCoupon] = useState<Partial<Coupon> | null>(null);
  const [isCouponModalOpen, setIsCouponModalOpen] = useState(false);

  // Category Modal State
  const [selectedCategory, setSelectedCategory] = useState<Partial<Category> | null>(null);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);

  // Delivery Modal State
  const [selectedDeliveryRule, setSelectedDeliveryRule] = useState<Partial<DeliveryRule> | null>(null);
  const [isDeliveryModalOpen, setIsDeliveryModalOpen] = useState(false);

  // Admin User Modal State
  const [selectedUser, setSelectedUser] = useState<any | null>(null);
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);

  // Invoice Modal State
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);

  // Website Settings Form State
  const [settingsForm, setSettingsForm] = useState<Partial<StoreSettings>>({});

  // AI Chat State
  const [aiMessages, setAiMessages] = useState<Array<{ role: 'user' | 'ai'; text: string; approvalId?: string }>>([
    {
      role: 'ai',
      text: 'Namaste! I am your AI store operations agent for Jai Jinendra Grocery Mart in Jaora. Ask me for sales metrics, inventory summaries, customer reviews, profit breakdown, or draft WhatsApp updates. Write actions like price or stock changes are sent for super-admin approval.',
    },
  ]);
  const [aiInput, setAiInput] = useState('');
  const [aiLoading, setAiLoading] = useState(false);

  // Check Auth on Mount
  useEffect(() => {
    async function checkAuth() {
      try {
        const res = await fetch('/api/admin/me');
        if (!res.ok) {
          router.push('/admin/login');
          return;
        }
        const data = await res.json();
        setAdminUser(data.user);
        loadAllData();
      } catch (e) {
        router.push('/admin/login');
      }
    }
    checkAuth();
  }, []);

  const loadAllData = async () => {
    try {
      setLoading(true);
      const [prodRes, catRes, offRes, coupRes, ordRes, actRes, repRes, appRes, setRes, usrRes, delRes, custRes] = await Promise.all([
        fetch('/api/products?limit=100&include_inactive=true'),
        fetch('/api/admin/categories'),
        fetch('/api/admin/offers'),
        fetch('/api/admin/coupons'),
        fetch('/api/orders'),
        fetch('/api/admin/activity'),
        fetch('/api/admin/reports'),
        fetch('/api/admin/ai/approvals?status=all'),
        fetch('/api/admin/settings'),
        fetch('/api/admin/users'),
        fetch('/api/admin/delivery'),
        fetch('/api/admin/customers'),
      ]);

      const prodData = await prodRes.json();
      const catData = await catRes.json();
      const offData = await offRes.json();
      const coupData = await coupRes.json();
      const ordData = await ordRes.json();
      const actData = await actRes.json();
      const repData = await repRes.json();
      const appData = await appRes.json();
      const setData = await setRes.json();
      const usrData = await usrRes.json();
      const delData = await delRes.json();
      const custData = await custRes.json();

      if (prodData.products) setProducts(prodData.products);
      if (catData.categories) setCategories(catData.categories);
      if (offData.offers) setOffers(offData.offers);
      if (coupData.coupons) setCoupons(coupData.coupons);
      if (ordData.orders) setOrders(ordData.orders);
      if (actData.events) setActivityEvents(actData.events);
      if (actData.auditLogs) setAuditLogs(actData.auditLogs);
      if (actData.reviews) setReviewsList(actData.reviews);
      if (actData.visitors) setVisitorsList(actData.visitors);
      if (actData.profitData) setProfitData(actData.profitData);
      if (repData.report) setReportData(repData.report);
      if (appData.approvals) setAiApprovals(appData.approvals);
      if (usrData.users) setAdminUsersList(usrData.users);
      if (delData.rules) setDeliveryRules(delData.rules);
      if (custData.customers) setCustomersList(custData.customers);

      if (setData.settings) {
        setStoreSettings(setData.settings);
        setSettingsForm(setData.settings);
      }
    } catch (e) {
      console.error('Failed to load admin data', e);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await fetch('/api/admin/logout', { method: 'POST' });
    router.push('/admin/login');
  };

  // PRODUCT SAVE / DELETE
  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct) return;

    try {
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(selectedProduct),
      });

      const data = await res.json();
      if (!res.ok) {
        alert(data.error || 'Failed to save product');
        return;
      }

      alert('Product saved successfully!');
      setIsProductModalOpen(false);
      setSelectedProduct(null);
      loadAllData();
    } catch (err: any) {
      alert('Error saving product: ' + err.message);
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;
    try {
      const res = await fetch(`/api/products?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        alert('Product deleted');
        loadAllData();
      }
    } catch (e) {
      alert('Error deleting product');
    }
  };

  // OFFER SAVE / DELETE
  const handleSaveOffer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOffer) return;

    try {
      const res = await fetch('/api/admin/offers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(selectedOffer),
      });

      const data = await res.json();
      if (!res.ok) {
        alert(data.error || 'Failed to save offer');
        return;
      }

      alert('Offer saved successfully!');
      setIsOfferModalOpen(false);
      setSelectedOffer(null);
      loadAllData();
    } catch (err: any) {
      alert('Error saving offer: ' + err.message);
    }
  };

  const handleDeleteOffer = async (id: string) => {
    if (!confirm('Are you sure you want to delete this offer?')) return;
    try {
      const res = await fetch(`/api/admin/offers?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        alert('Offer deleted successfully');
        loadAllData();
      }
    } catch (e) {
      alert('Error deleting offer');
    }
  };

  // COUPON SAVE / DELETE
  const handleSaveCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCoupon) return;

    try {
      const res = await fetch('/api/admin/coupons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(selectedCoupon),
      });

      const data = await res.json();
      if (!res.ok) {
        alert(data.error || 'Failed to save coupon');
        return;
      }

      alert('Coupon saved successfully!');
      setIsCouponModalOpen(false);
      setSelectedCoupon(null);
      loadAllData();
    } catch (err: any) {
      alert('Error saving coupon: ' + err.message);
    }
  };

  const handleDeleteCoupon = async (id: string) => {
    if (!confirm('Are you sure you want to delete this coupon?')) return;
    try {
      const res = await fetch(`/api/admin/coupons?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        alert('Coupon deleted');
        loadAllData();
      }
    } catch (e) {
      alert('Error deleting coupon');
    }
  };

  // CATEGORY SAVE / DELETE
  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCategory) return;

    try {
      const res = await fetch('/api/admin/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(selectedCategory),
      });

      const data = await res.json();
      if (!res.ok) {
        alert(data.error || 'Failed to save category');
        return;
      }

      alert('Category saved successfully!');
      setIsCategoryModalOpen(false);
      setSelectedCategory(null);
      loadAllData();
    } catch (err: any) {
      alert('Error saving category: ' + err.message);
    }
  };

  const handleDeleteCategory = async (id: string) => {
    if (!confirm('Are you sure you want to delete this category?')) return;
    try {
      const res = await fetch(`/api/admin/categories?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        alert('Category deleted');
        loadAllData();
      }
    } catch (e) {
      alert('Error deleting category');
    }
  };

  // DELIVERY RULE SAVE / DELETE
  const handleSaveDeliveryRule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDeliveryRule) return;

    try {
      const res = await fetch('/api/admin/delivery', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(selectedDeliveryRule),
      });

      const data = await res.json();
      if (!res.ok) {
        alert(data.error || 'Failed to save delivery zone');
        return;
      }

      alert('Delivery zone saved successfully!');
      setIsDeliveryModalOpen(false);
      setSelectedDeliveryRule(null);
      loadAllData();
    } catch (err: any) {
      alert('Error saving delivery zone: ' + err.message);
    }
  };

  const handleDeleteDeliveryRule = async (id: string) => {
    if (!confirm('Are you sure you want to delete this delivery zone?')) return;
    try {
      const res = await fetch(`/api/admin/delivery?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        alert('Delivery zone deleted');
        loadAllData();
      }
    } catch (e) {
      alert('Error deleting delivery zone');
    }
  };

  // ADMIN USER SAVE / DELETE
  const handleSaveUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;

    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(selectedUser),
      });

      const data = await res.json();
      if (!res.ok) {
        alert(data.error || 'Failed to save staff user');
        return;
      }

      alert('Staff user saved successfully!');
      setIsUserModalOpen(false);
      setSelectedUser(null);
      loadAllData();
    } catch (err: any) {
      alert('Error saving staff user: ' + err.message);
    }
  };

  const handleDeleteUser = async (id: string) => {
    if (!confirm('Are you sure you want to delete this staff user?')) return;
    try {
      const res = await fetch(`/api/admin/users?id=${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (res.ok) {
        alert('Staff user deleted');
        loadAllData();
      } else {
        alert(data.error || 'Delete failed');
      }
    } catch (e) {
      alert('Error deleting staff user');
    }
  };

  // CUSTOMER STATUS TOGGLE
  const handleToggleCustomerStatus = async (customer: Customer) => {
    try {
      const res = await fetch('/api/admin/customers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: customer.id, active: !customer.active }),
      });
      if (res.ok) {
        alert('Customer account status updated');
        loadAllData();
      }
    } catch (e) {
      alert('Error updating customer');
    }
  };

  // STORE SETTINGS SAVE
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settingsForm),
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || 'Failed to update website settings');
        return;
      }
      alert('Website settings & content updated successfully!');
      loadAllData();
    } catch (err: any) {
      alert('Error saving settings: ' + err.message);
    }
  };

  // ORDER STATUS CHANGE
  const handleUpdateOrderStatus = async (orderId: string, status: string) => {
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ order_status: status }),
      });
      if (res.ok) {
        alert(`Order status updated to ${status}`);
        loadAllData();
      } else {
        alert('Failed to update status');
      }
    } catch (e) {
      alert('Error updating status');
    }
  };

  // AI CHAT SUBMIT
  const handleAiSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiInput.trim()) return;

    const userText = aiInput;
    setAiInput('');
    setAiMessages((prev) => [...prev, { role: 'user', text: userText }]);
    setAiLoading(true);

    try {
      const res = await fetch('/api/admin/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userText }),
      });
      const data = await res.json();
      setAiMessages((prev) => [
        ...prev,
        {
          role: 'ai',
          text: data.response,
          approvalId: data.approval_id,
        },
      ]);
      if (data.approval_created) {
        const appRes = await fetch('/api/admin/ai/approvals?status=all');
        const appData = await appRes.json();
        if (appData.approvals) setAiApprovals(appData.approvals);
      }
    } catch (e) {
      setAiMessages((prev) => [...prev, { role: 'ai', text: 'Error connecting to AI assistant.' }]);
    } finally {
      setAiLoading(false);
    }
  };

  // AI APPROVAL HANDLER
  const handleResolveApproval = async (approvalId: string, action: 'approve' | 'reject') => {
    try {
      const res = await fetch('/api/admin/ai/approvals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ approval_id: approvalId, action }),
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || 'Approval action failed');
        return;
      }
      alert(`Success: ${data.message || 'Action executed'}`);
      loadAllData();
    } catch (e: any) {
      alert('Error: ' + e.message);
    }
  };

  if (!adminUser) return null;

  const sidebarItems = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'products', label: 'Products', icon: Package, badge: products.length },
    { id: 'offers', label: 'Offers & Deals', icon: Percent, badge: offers.length },
    { id: 'coupons', label: 'Coupons', icon: Ticket, badge: coupons.length },
    { id: 'categories', label: 'Categories', icon: FolderTree, badge: categories.length },
    { id: 'orders', label: 'Orders', icon: ShoppingBag, badge: orders.length },
    { id: 'delivery', label: 'Delivery Zones', icon: Truck, badge: deliveryRules.length },
    { id: 'customers', label: 'Customers', icon: Users, badge: customersList.length },
    { id: 'reports', label: 'Reports & GST', icon: BarChart3 },
    { id: 'activity', label: 'Live Activity', icon: Activity, badge: activityEvents.length },
    {
      id: 'ai',
      label: 'AI Assistant',
      icon: Bot,
      badge: aiApprovals.filter((a) => a.status === 'pending').length || undefined,
    },
    { id: 'content', label: 'Website Content', icon: Globe },
    { id: 'settings', label: 'Store Settings', icon: Settings },
    { id: 'users', label: 'Admin Users', icon: UserCheck, badge: adminUsersList.length },
    { id: 'audit', label: 'Audit Logs', icon: FileText },
  ];

  const filteredActivityEvents = activityEvents.filter((evt) => {
    if (activitySeverityFilter === 'all') return true;
    if (activitySeverityFilter === 'critical') return evt.severity === 'critical' || evt.severity === 'warning';
    if (activitySeverityFilter === 'orders') return evt.event_type === 'new_order' || evt.event_type === 'order_status_change';
    if (activitySeverityFilter === 'stock') return evt.event_type === 'stock_change' || evt.event_type === 'low_stock_alert';
    return true;
  });

  const filteredCustomers = customersList.filter((c) => {
    if (!customerSearchQuery.trim()) return true;
    const q = customerSearchQuery.toLowerCase();
    return c.name.toLowerCase().includes(q) || c.phone.includes(q) || (c.email && c.email.toLowerCase().includes(q));
  });

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col md:flex-row max-w-full overflow-x-hidden">
      {/* 1. Admin Sidebar */}
      <aside className="w-full md:w-64 bg-slate-950 border-b md:border-b-0 md:border-r border-slate-800 flex flex-col justify-between flex-shrink-0">
        <div>
          {/* Brand & Mobile Toggle */}
          <div className="p-4 border-b border-slate-800 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center font-black text-white text-sm">
                JJ
              </div>
              <div>
                <h2 className="font-extrabold text-sm text-white leading-tight">
                  Jai Jinendra Mart
                </h2>
                <p className="text-[10px] text-amber-400 font-mono">Jaora Store Admin</p>
              </div>
            </Link>

            <button
              onClick={() => setIsMobileAdminNavOpen(!isMobileAdminNavOpen)}
              className="md:hidden text-xs font-bold text-slate-300 bg-slate-900 border border-slate-700 px-3 py-1.5 rounded-lg"
            >
              {isMobileAdminNavOpen ? '✕ Close' : '☰ Menu'}
            </button>
          </div>

          {/* User Profile Bar */}
          <div className="px-4 py-3 bg-slate-900/60 border-b border-slate-800 flex items-center justify-between text-xs">
            <div>
              <p className="font-bold text-white truncate max-w-[130px]">{adminUser.name}</p>
              <span className="text-[10px] text-emerald-400 font-mono uppercase bg-emerald-950 px-1.5 py-0.5 rounded border border-emerald-800/60">
                {adminUser.role.replace('_', ' ')}
              </span>
            </div>
            <button
              onClick={handleLogout}
              className="text-slate-400 hover:text-red-400 p-1.5 rounded-lg hover:bg-slate-800 transition"
              title="Log Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className={`${isMobileAdminNavOpen ? 'block' : 'hidden'} md:block p-3 space-y-1`}>
            {sidebarItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    setIsMobileAdminNavOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition ${
                    isActive
                      ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-900/30'
                      : 'text-slate-400 hover:bg-slate-850 hover:text-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge !== undefined && (
                    <span
                      className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono font-bold ${
                        isActive ? 'bg-emerald-800 text-amber-300' : 'bg-slate-800 text-emerald-400'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Footer info */}
        <div className="hidden md:block p-4 border-t border-slate-800 text-[11px] text-slate-500 font-mono space-y-1">
          <p>Jaora MP • 457226</p>
          <p className="text-[10px] text-slate-600">SQLite v24 • Cloudflare Edge</p>
        </div>
      </aside>

      {/* 2. Main Content Area */}
      <main className="flex-1 p-4 sm:p-8 overflow-y-auto max-w-full w-full">
        {/* OVERVIEW TAB */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl font-black text-white">Dashboard Overview</h1>
                <p className="text-xs text-slate-400">
                  Real-time metrics for Jai Jinendra Grocery Mart (Jaora, MP)
                </p>
              </div>
              <button
                onClick={loadAllData}
                className="self-start sm:self-auto bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs px-3 py-2 rounded-xl border border-slate-700 flex items-center gap-1.5 transition"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                <span>Refresh Data</span>
              </button>
            </div>

            {/* Metric Summary Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-slate-800/80 border border-slate-700/80 p-4 rounded-2xl space-y-1">
                <span className="text-xs text-slate-400 font-medium">Total Orders</span>
                <p className="text-2xl font-black text-white">{orders.length}</p>
                <span className="text-[10px] text-emerald-400 font-mono">Live customer sales</span>
              </div>
              <div className="bg-slate-800/80 border border-slate-700/80 p-4 rounded-2xl space-y-1">
                <span className="text-xs text-slate-400 font-medium">Total Revenue</span>
                <p className="text-2xl font-black text-amber-400">
                  ₹{orders.reduce((acc, o) => acc + (o.total || 0), 0).toLocaleString()}
                </p>
                <span className="text-[10px] text-amber-300/80 font-mono">Gross receipts</span>
              </div>
              <div className="bg-slate-800/80 border border-slate-700/80 p-4 rounded-2xl space-y-1">
                <span className="text-xs text-slate-400 font-medium">Active Products</span>
                <p className="text-2xl font-black text-emerald-400">{products.length}</p>
                <span className="text-[10px] text-slate-400 font-mono">Across 10 categories</span>
              </div>
              <div className="bg-slate-800/80 border border-slate-700/80 p-4 rounded-2xl space-y-1">
                <span className="text-xs text-slate-400 font-medium">Active Offers</span>
                <p className="text-2xl font-black text-emerald-400">{offers.filter(o => o.active).length}</p>
                <span className="text-[10px] text-emerald-400 font-mono">Special deals live</span>
              </div>
            </div>

            {/* Quick Recent Orders */}
            <div className="bg-slate-800/90 border border-slate-700 rounded-2xl p-5 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-sm text-white">Recent Customer Orders</h3>
                <button onClick={() => setActiveTab('orders')} className="text-xs text-emerald-400 hover:underline">
                  View All Orders →
                </button>
              </div>

              {orders.length === 0 ? (
                <p className="text-xs text-slate-500 italic">No orders placed yet.</p>
              ) : (
                <div className="overflow-x-auto w-full">
                  <table className="w-full text-left text-xs text-slate-300 min-w-[500px]">
                    <thead className="bg-slate-900/80 text-slate-400 uppercase text-[10px] font-mono">
                      <tr>
                        <th className="p-2.5">Order #</th>
                        <th className="p-2.5">Customer</th>
                        <th className="p-2.5">Phone</th>
                        <th className="p-2.5">Total</th>
                        <th className="p-2.5">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-700/50">
                      {orders.slice(0, 5).map((ord) => (
                        <tr key={ord.id} className="hover:bg-slate-750">
                          <td className="p-2.5 font-mono font-bold text-amber-300">{ord.order_number}</td>
                          <td className="p-2.5">{ord.customer_name}</td>
                          <td className="p-2.5 font-mono">{ord.customer_phone}</td>
                          <td className="p-2.5 font-bold text-white">₹{ord.total}</td>
                          <td className="p-2.5">
                            <span className="bg-emerald-950 text-emerald-300 border border-emerald-800 px-2 py-0.5 rounded text-[10px] font-mono uppercase">
                              {ord.order_status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* 🤖 AI ASSISTANT TAB */}
        {activeTab === 'ai' && (
          <div className="space-y-6 max-w-4xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl font-black text-white flex items-center gap-2">
                  <Bot className="w-6 h-6 text-emerald-400" /> Store AI Assistant Agent
                </h1>
                <p className="text-xs text-slate-400">
                  AI operations agent for sales analysis, stock alerts, customer reviews, profit calculations, and draft approvals
                </p>
              </div>
              <span className="bg-emerald-950 text-emerald-300 border border-emerald-800 text-[10px] font-mono px-3 py-1.5 rounded-full font-bold self-start sm:self-auto flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                <span>AI Agent Active (Jaora Store Policy Engaged)</span>
              </span>
            </div>

            {/* Human-in-the-Loop Approvals Queue */}
            <div className="bg-slate-800 border border-slate-700 rounded-2xl p-5 space-y-4">
              <h3 className="font-bold text-sm text-amber-400 flex items-center justify-between">
                <span>🛡️ Pending Super-Admin Action Approvals ({aiApprovals.filter(a => a.status === 'pending').length})</span>
                <span className="text-[10px] text-slate-400 font-normal">Super-Admin Authorization Required</span>
              </h3>

              {aiApprovals.length === 0 ? (
                <p className="text-xs text-slate-500 italic">No pending action proposals requiring approval.</p>
              ) : (
                <div className="space-y-3">
                  {aiApprovals.map((app) => (
                    <div key={app.id} className="bg-slate-900 border border-slate-700 rounded-xl p-3.5 text-xs space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-emerald-400 capitalize">{(app.tool_name || app.proposed_action || 'Action').replace(/_/g, ' ')}</span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${app.status === 'pending' ? 'bg-amber-950 text-amber-300 border border-amber-800' : app.status === 'approved' ? 'bg-emerald-950 text-emerald-300' : 'bg-red-950 text-red-300'}`}>
                          {app.status}
                        </span>
                      </div>
                      <p className="text-slate-200">{app.proposed_action || (app as any).description}</p>
                      {app.status === 'pending' && (
                        <div className="flex gap-2 pt-1">
                          <button
                            onClick={() => handleResolveApproval(app.id, 'approve')}
                            className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-3 py-1.5 rounded-lg transition"
                          >
                            ✓ Approve Action
                          </button>
                          <button
                            onClick={() => handleResolveApproval(app.id, 'reject')}
                            className="bg-red-900/80 hover:bg-red-800 text-white font-bold text-xs px-3 py-1.5 rounded-lg transition"
                          >
                            ✕ Reject
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* AI Chat Conversation Panel */}
            <div className="bg-slate-800 border border-slate-700 rounded-2xl p-5 space-y-4 flex flex-col h-[520px]">
              <div className="flex-1 overflow-y-auto space-y-3 pr-2 text-xs">
                {aiMessages.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`p-3.5 rounded-2xl max-w-[88%] leading-relaxed ${
                      msg.role === 'user'
                        ? 'ml-auto bg-emerald-600 text-white rounded-br-none'
                        : 'bg-slate-900 border border-slate-700 text-slate-200 rounded-bl-none'
                    }`}
                  >
                    <p className="font-semibold text-[10px] text-slate-400 mb-1">
                      {msg.role === 'user' ? 'You (Admin)' : '🤖 AI Operations Agent'}
                    </p>
                    <div className="whitespace-pre-wrap">{msg.text}</div>
                  </div>
                ))}
                {aiLoading && (
                  <div className="bg-slate-900 border border-slate-700 text-slate-400 p-3 rounded-2xl text-xs flex items-center gap-2">
                    <RefreshCw className="w-3.5 h-3.5 animate-spin text-emerald-400" />
                    <span>AI agent is analyzing store database records...</span>
                  </div>
                )}
              </div>

              {/* Quick Prompt Chips */}
              <div className="flex flex-wrap gap-1.5 pt-2 border-t border-slate-700 text-[10px]">
                {[
                  '📊 Summarize sales for today',
                  '⚠️ Show products with low stock',
                  '🌟 Customer Reviews summary',
                  '💰 Profit & Financial report',
                  '🚚 Check Jaora Delivery Zones',
                  '📱 Generate WhatsApp customer message',
                ].map((chip) => (
                  <button
                    key={chip}
                    onClick={() => {
                      setAiInput(chip);
                    }}
                    className="bg-slate-900 hover:bg-emerald-950 border border-slate-700 text-slate-300 hover:text-emerald-300 px-2.5 py-1 rounded-lg transition"
                  >
                    {chip}
                  </button>
                ))}
              </div>

              {/* Input Bar */}
              <form onSubmit={handleAiSubmit} className="flex gap-2">
                <input
                  type="text"
                  value={aiInput}
                  onChange={(e) => setAiInput(e.target.value)}
                  placeholder="Ask AI Assistant anything about sales, reviews, delivery or stock in Jaora..."
                  className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white outline-none focus:border-emerald-500"
                />
                <button
                  type="submit"
                  disabled={aiLoading}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-4 py-2.5 rounded-xl transition flex items-center gap-1.5"
                >
                  <Send className="w-4 h-4" />
                  <span className="hidden sm:inline">Send Prompt</span>
                </button>
              </form>
            </div>
          </div>
        )}

        {/* 🚚 DELIVERY ZONES & MAP TAB */}
        {activeTab === 'delivery' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl font-black text-white flex items-center gap-2">
                  <Truck className="w-6 h-6 text-emerald-400" /> Delivery Zones & Google Maps (Jaora City)
                </h1>
                <p className="text-xs text-slate-400">Manage local delivery zones, pincode 457226, pinned locations, and base fees</p>
              </div>
              <button
                onClick={() => {
                  setSelectedDeliveryRule({
                    zone_name: 'Jaora Outskirts',
                    pincode: '457226',
                    base_fee: 40,
                    min_order: 150,
                    free_threshold: 599,
                    estimated_minutes: 60,
                    active: true,
                  });
                  setIsDeliveryModalOpen(true);
                }}
                className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-4 py-2.5 rounded-xl flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                <span>📌 Pin New Delivery Zone</span>
              </button>
            </div>

            {/* Google Maps Jaora Embed & Pinned Locations */}
            <div className="bg-slate-800 border border-slate-700 rounded-2xl overflow-hidden p-5 space-y-4 shadow-xl">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-sm text-white flex items-center gap-2">
                  <span>🗺️ Interactive Google Maps Location Finder (Jaora 457226)</span>
                </h3>
                <a
                  href="https://maps.google.com/?q=Jaora+Madhya+Pradesh+457226"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-slate-900 hover:bg-slate-700 text-emerald-400 border border-slate-700 px-3 py-1 rounded-lg text-xs font-bold"
                >
                  Open in Google Maps ↗
                </a>
              </div>

              <div className="w-full h-72 rounded-xl overflow-hidden border border-slate-700 relative">
                <iframe
                  title="Jaora Delivery Map"
                  src="https://maps.google.com/maps?q=Jaora%2C%20Madhya%20Pradesh%20457226&t=&z=14&ie=UTF8&iwloc=&output=embed"
                  className="w-full h-full border-0 filter brightness-90 contrast-105"
                  allowFullScreen
                  loading="lazy"
                ></iframe>
              </div>

              {/* Pinned Key Locations Grid */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider font-mono">📍 Pinned Main Delivery Hubs in Jaora:</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
                  <div className="bg-slate-900 border border-emerald-900/60 p-3 rounded-xl space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-extrabold text-emerald-400">📍 Station Road</span>
                      <span className="text-[10px] bg-emerald-950 text-emerald-300 px-1.5 py-0.5 rounded font-mono">30-40 min</span>
                    </div>
                    <p className="text-[11px] text-slate-300">Near Jain Mandir & Station Area</p>
                    <p className="text-[10px] text-amber-300 font-mono">Base Fee: ₹30 | Free above ₹499</p>
                  </div>

                  <div className="bg-slate-900 border border-emerald-900/60 p-3 rounded-xl space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-extrabold text-emerald-400">📍 Bajaj Khana</span>
                      <span className="text-[10px] bg-emerald-950 text-emerald-300 px-1.5 py-0.5 rounded font-mono">30-40 min</span>
                    </div>
                    <p className="text-[11px] text-slate-300">Main Commercial Market Zone</p>
                    <p className="text-[10px] text-amber-300 font-mono">Base Fee: ₹30 | Free above ₹499</p>
                  </div>

                  <div className="bg-slate-900 border border-emerald-900/60 p-3 rounded-xl space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-extrabold text-blue-400">📍 Jawahar Path</span>
                      <span className="text-[10px] bg-blue-950 text-blue-300 px-1.5 py-0.5 rounded font-mono">35-45 min</span>
                    </div>
                    <p className="text-[11px] text-slate-300">Bus Stand & Surrounding Areas</p>
                    <p className="text-[10px] text-amber-300 font-mono">Base Fee: ₹30 | Free above ₹499</p>
                  </div>

                  <div className="bg-slate-900 border border-emerald-900/60 p-3 rounded-xl space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-extrabold text-purple-400">📍 Piploda Road</span>
                      <span className="text-[10px] bg-purple-950 text-purple-300 px-1.5 py-0.5 rounded font-mono">45-60 min</span>
                    </div>
                    <p className="text-[11px] text-slate-300">Industrial Area & Colonies</p>
                    <p className="text-[10px] text-amber-300 font-mono">Base Fee: ₹40 | Free above ₹599</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Delivery Rules Table */}
            <div className="bg-slate-800 border border-slate-700 rounded-2xl overflow-hidden shadow-xl">
              <div className="overflow-x-auto w-full">
                <table className="w-full text-left text-xs text-slate-200 min-w-[600px]">
                  <thead className="bg-slate-900 text-slate-400 uppercase text-[10px] font-mono">
                    <tr>
                      <th className="p-3">Zone Name</th>
                      <th className="p-3">PIN Code</th>
                      <th className="p-3">Base Fee</th>
                      <th className="p-3">Min Order</th>
                      <th className="p-3">Free Above</th>
                      <th className="p-3">Est. Time</th>
                      <th className="p-3">Status</th>
                      <th className="p-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-700">
                    {deliveryRules.map((rule) => (
                      <tr key={rule.id} className="hover:bg-slate-750">
                        <td className="p-3 font-bold text-white">{rule.zone_name}</td>
                        <td className="p-3 font-mono text-amber-300">{rule.pincode}</td>
                        <td className="p-3 font-bold text-emerald-400">₹{rule.base_fee}</td>
                        <td className="p-3 font-mono text-slate-300">₹{rule.min_order}</td>
                        <td className="p-3 font-mono text-emerald-300 font-bold">₹{rule.free_threshold}</td>
                        <td className="p-3 text-slate-300 font-mono">{rule.estimated_minutes} mins</td>
                        <td className="p-3">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${rule.active ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' : 'bg-slate-900 text-slate-500'}`}>
                            {rule.active ? 'ACTIVE' : 'DISABLED'}
                          </span>
                        </td>
                        <td className="p-3 text-right">
                          <div className="flex justify-end gap-1.5">
                            <button
                              onClick={() => {
                                setSelectedDeliveryRule(rule);
                                setIsDeliveryModalOpen(true);
                              }}
                              className="p-1.5 bg-slate-700 hover:bg-slate-600 text-amber-300 rounded-lg"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteDeliveryRule(rule.id)}
                              className="p-1.5 bg-slate-700 hover:bg-red-900/60 text-red-400 rounded-lg"
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
            </div>
          </div>
        )}

        {/* 👥 CUSTOMERS DIRECTORY TAB WITH DETAIL VIEW MODAL */}
        {activeTab === 'customers' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl font-black text-white flex items-center gap-2">
                  <Users className="w-6 h-6 text-emerald-400" /> Customer Directory & Full Profiles ({filteredCustomers.length})
                </h1>
                <p className="text-xs text-slate-400">View detailed customer profiles, Jaora addresses, order histories, and feedback</p>
              </div>

              {/* Search Bar */}
              <div className="relative max-w-xs w-full">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  value={customerSearchQuery}
                  onChange={(e) => setCustomerSearchQuery(e.target.value)}
                  placeholder="Search name or phone..."
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-xs text-white outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div className="bg-slate-800 border border-slate-700 rounded-2xl overflow-hidden shadow-xl">
              <div className="overflow-x-auto w-full">
                <table className="w-full text-left text-xs text-slate-200 min-w-[700px]">
                  <thead className="bg-slate-900 text-slate-400 uppercase text-[10px] font-mono">
                    <tr>
                      <th className="p-3">Customer Name</th>
                      <th className="p-3">Phone</th>
                      <th className="p-3">Email</th>
                      <th className="p-3">Total Orders</th>
                      <th className="p-3">Total Spent</th>
                      <th className="p-3">Status</th>
                      <th className="p-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-700">
                    {filteredCustomers.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="p-8 text-center text-slate-500">No customers found.</td>
                      </tr>
                    ) : (
                      filteredCustomers.map((cust) => (
                        <tr key={cust.id} className="hover:bg-slate-750">
                          <td className="p-3 font-bold text-white">{cust.name}</td>
                          <td className="p-3 font-mono text-amber-300">{cust.phone}</td>
                          <td className="p-3 font-mono text-slate-400">{cust.email || '—'}</td>
                          <td className="p-3 font-bold text-slate-200">{cust.total_orders} orders</td>
                          <td className="p-3 font-extrabold text-emerald-400">₹{cust.total_spent.toLocaleString()}</td>
                          <td className="p-3">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${cust.active ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' : 'bg-red-950 text-red-300'}`}>
                              {cust.active ? 'ACTIVE' : 'BLOCKED'}
                            </span>
                          </td>
                          <td className="p-3 text-right">
                            <div className="flex justify-end gap-2">
                              <button
                                onClick={() => {
                                  setSelectedCustomerDetail(cust);
                                  setIsCustomerDetailModalOpen(true);
                                }}
                                className="text-xs font-bold px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white transition"
                              >
                                View Details 👁️
                              </button>
                              <button
                                onClick={() => handleToggleCustomerStatus(cust)}
                                className={`text-xs font-bold px-3 py-1.5 rounded-lg border transition ${cust.active ? 'bg-slate-700 hover:bg-red-950 text-red-300 border-slate-600' : 'bg-emerald-950 text-emerald-300 border-emerald-800'}`}
                              >
                                {cust.active ? 'Block' : 'Unblock'}
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* CUSTOMER DETAILS MODAL */}
        {isCustomerDetailModalOpen && selectedCustomerDetail && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
            <div className="bg-slate-800 border border-slate-700 rounded-2xl max-w-2xl w-full p-6 text-xs text-white space-y-5 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between border-b border-slate-700 pb-3">
                <h3 className="font-bold text-base text-amber-400 flex items-center gap-2">
                  <Users className="w-5 h-5 text-emerald-400" /> Full Customer Profile: {selectedCustomerDetail.name}
                </h3>
                <button
                  onClick={() => setIsCustomerDetailModalOpen(false)}
                  className="text-slate-400 hover:text-white p-1 text-lg font-bold"
                >
                  ✕
                </button>
              </div>

              {/* Profile Card */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-slate-900 border border-slate-700 p-4 rounded-xl">
                <div>
                  <p className="text-[10px] text-slate-400 uppercase font-mono">Phone Number</p>
                  <p className="font-bold text-amber-300 font-mono text-sm">{selectedCustomerDetail.phone}</p>
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 uppercase font-mono">Email Address</p>
                  <p className="font-bold text-slate-200">{selectedCustomerDetail.email || 'Not Provided'}</p>
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 uppercase font-mono">Lifetime Spending</p>
                  <p className="font-black text-emerald-400 text-sm font-mono">₹{selectedCustomerDetail.total_spent.toLocaleString()} ({selectedCustomerDetail.total_orders} Orders)</p>
                </div>
              </div>

              {/* Address Details */}
              <div className="bg-slate-900 border border-slate-700 p-4 rounded-xl space-y-1">
                <p className="text-[10px] text-slate-400 uppercase font-mono font-bold">📍 Delivery Address in Jaora:</p>
                <p className="text-slate-200 font-semibold">
                  {selectedCustomerDetail.addresses_json
                    ? JSON.parse(selectedCustomerDetail.addresses_json)[0]?.street + ', ' + JSON.parse(selectedCustomerDetail.addresses_json)[0]?.landmark + ', Jaora 457226'
                    : 'Station Road, Jaora MP (Pincode 457226)'}
                </p>
              </div>

              {/* Customer Recent Orders */}
              <div className="space-y-2">
                <h4 className="font-bold text-slate-300 text-xs uppercase tracking-wider font-mono">📦 Customer Order History:</h4>
                <div className="bg-slate-900 border border-slate-700 rounded-xl overflow-hidden divide-y divide-slate-800">
                  {orders.filter(o => o.customer_phone === selectedCustomerDetail.phone).length === 0 ? (
                    <div className="p-4 text-slate-500 text-center">No orders recorded for this customer yet.</div>
                  ) : (
                    orders.filter(o => o.customer_phone === selectedCustomerDetail.phone).map((ord) => (
                      <div key={ord.id} className="p-3 flex items-center justify-between font-mono text-xs">
                        <div>
                          <span className="font-bold text-amber-300">{ord.order_number}</span>
                          <span className="text-slate-400 ml-2 text-[10px]">{new Date(ord.created_at).toLocaleDateString()}</span>
                        </div>
                        <span className="font-bold text-emerald-400">₹{ord.total} ({ord.payment_method.toUpperCase()})</span>
                        <span className="bg-emerald-950 text-emerald-300 border border-emerald-800 px-2 py-0.5 rounded text-[10px] uppercase font-bold">
                          {ord.order_status}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Customer Feedback */}
              <div className="space-y-2">
                <h4 className="font-bold text-slate-300 text-xs uppercase tracking-wider font-mono">🌟 Customer Reviews Left:</h4>
                <div className="bg-slate-900 border border-slate-700 rounded-xl p-3.5 space-y-2">
                  {reviewsList.filter(r => r.customer_phone === selectedCustomerDetail.phone).length === 0 ? (
                    <p className="text-slate-500 italic text-center">No reviews submitted by this customer.</p>
                  ) : (
                    reviewsList.filter(r => r.customer_phone === selectedCustomerDetail.phone).map((rev) => (
                      <div key={rev.id} className="space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-amber-400 font-bold">{ '★'.repeat(rev.rating) } ({rev.product_name})</span>
                          <span className="text-[10px] text-slate-500">{new Date(rev.created_at).toLocaleDateString()}</span>
                        </div>
                        <p className="text-slate-300 italic">"{rev.comment}"</p>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  onClick={() => setIsCustomerDetailModalOpen(false)}
                  className="px-5 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-xl font-bold"
                >
                  Close Profile
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ⚡ LIVE ACTIVITY, REVIEWS, VISITORS & PROFITS TAB */}
        {activeTab === 'activity' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl font-black text-white flex items-center gap-2">
                  <Activity className="w-6 h-6 text-emerald-400" /> Live Activity, Customer Reviews & Profit Insights
                </h1>
                <p className="text-xs text-slate-400">Monitor live customer activity, visitor traffic, reviews, and store profitability</p>
              </div>

              {/* Sub-Tab Buttons */}
              <div className="flex flex-wrap gap-1.5 text-xs bg-slate-800 p-1.5 rounded-xl border border-slate-700">
                {[
                  { id: 'all', label: '⚡ Activity Stream' },
                  { id: 'reviews', label: `🌟 Reviews (${reviewsList.length})` },
                  { id: 'visitors', label: `👥 Live Visitors (${visitorsList.length})` },
                  { id: 'profits', label: '💰 Profit Analytics' },
                ].map((sub) => (
                  <button
                    key={sub.id}
                    onClick={() => setActivitySubTab(sub.id as any)}
                    className={`px-3 py-1.5 rounded-lg font-bold transition ${
                      activitySubTab === sub.id
                        ? 'bg-emerald-600 text-white shadow'
                        : 'text-slate-400 hover:text-white hover:bg-slate-700'
                    }`}
                  >
                    {sub.label}
                  </button>
                ))}
              </div>
            </div>

            {/* SUB-TAB 1: ALL ACTIVITY STREAM */}
            {activitySubTab === 'all' && (
              <div className="space-y-4">
                <div className="flex justify-end gap-1 text-xs">
                  {[
                    { id: 'all', label: 'All Events' },
                    { id: 'critical', label: 'Warnings & Alerts' },
                    { id: 'orders', label: 'Order Activity' },
                    { id: 'stock', label: 'Stock Changes' },
                  ].map((f) => (
                    <button
                      key={f.id}
                      onClick={() => setActivitySeverityFilter(f.id)}
                      className={`px-3 py-1 rounded-lg font-bold transition ${
                        activitySeverityFilter === f.id
                          ? 'bg-emerald-600 text-white'
                          : 'bg-slate-800 text-slate-400 hover:bg-slate-750'
                      }`}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>

                <div className="bg-slate-800 border border-slate-700 rounded-2xl overflow-hidden divide-y divide-slate-700/60 shadow-xl">
                  {filteredActivityEvents.map((evt) => (
                    <div key={evt.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-750/70 transition">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-mono uppercase font-bold ${evt.severity === 'critical' ? 'bg-red-950 text-red-300 border border-red-800' : evt.severity === 'warning' ? 'bg-amber-950 text-amber-300 border border-amber-800' : 'bg-emerald-950 text-emerald-300 border border-emerald-800'}`}>
                            {evt.event_type.replace(/_/g, ' ')}
                          </span>
                          <span className="text-xs font-bold text-white">Actor: {evt.actor_name}</span>
                        </div>
                        <p className="text-xs text-slate-300">{evt.summary}</p>
                      </div>

                      <span className="text-[10px] font-mono text-slate-400 flex-shrink-0">
                        {new Date(evt.timestamp).toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* SUB-TAB 2: CUSTOMER REVIEWS */}
            {activitySubTab === 'reviews' && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {reviewsList.map((rev) => (
                    <div key={rev.id} className="bg-slate-800 border border-slate-700 rounded-2xl p-4 space-y-2 shadow-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-bold text-white text-sm">{rev.customer_name}</p>
                          <p className="text-[11px] text-amber-300 font-mono">{rev.customer_phone}</p>
                        </div>
                        <div className="text-amber-400 text-sm font-bold">
                          {'★'.repeat(rev.rating)}
                        </div>
                      </div>
                      <div className="bg-slate-900 border border-slate-700/80 p-3 rounded-xl text-xs space-y-1">
                        <p className="text-[10px] text-emerald-400 font-bold uppercase font-mono">Product: {rev.product_name}</p>
                        <p className="text-slate-200 italic">"{rev.comment}"</p>
                      </div>
                      {rev.reply && (
                        <div className="bg-emerald-950/60 border border-emerald-800/60 p-2.5 rounded-xl text-[11px]">
                          <p className="font-bold text-emerald-300">Store Manager Reply:</p>
                          <p className="text-slate-300">{rev.reply}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* SUB-TAB 3: LIVE VISITORS / TRAFFIC */}
            {activitySubTab === 'visitors' && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="bg-slate-800 border border-slate-700 p-4 rounded-2xl space-y-1">
                    <p className="text-[10px] text-slate-400 uppercase font-mono">Active Online Visitors</p>
                    <p className="text-2xl font-black text-emerald-400 font-mono flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping"></span>
                      <span>18 Active</span>
                    </p>
                  </div>
                  <div className="bg-slate-800 border border-slate-700 p-4 rounded-2xl space-y-1">
                    <p className="text-[10px] text-slate-400 uppercase font-mono">Page Views Today</p>
                    <p className="text-2xl font-black text-amber-300 font-mono">482 Views</p>
                  </div>
                  <div className="bg-slate-800 border border-slate-700 p-4 rounded-2xl space-y-1">
                    <p className="text-[10px] text-slate-400 uppercase font-mono">Peak Traffic Hour</p>
                    <p className="text-2xl font-black text-blue-400 font-mono">6 - 8 PM</p>
                  </div>
                  <div className="bg-slate-800 border border-slate-700 p-4 rounded-2xl space-y-1">
                    <p className="text-[10px] text-slate-400 uppercase font-mono">Cart Conversion</p>
                    <p className="text-2xl font-black text-purple-400 font-mono">14.2%</p>
                  </div>
                </div>

                <div className="bg-slate-800 border border-slate-700 rounded-2xl overflow-hidden shadow-xl">
                  <div className="p-3 bg-slate-900 border-b border-slate-700 font-bold text-xs text-white">
                    👥 Live Shopper Traffic Log (Jaora City)
                  </div>
                  <div className="overflow-x-auto w-full">
                    <table className="w-full text-left text-xs text-slate-200 min-w-[600px]">
                      <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] font-mono">
                        <tr>
                          <th className="p-3">IP Address</th>
                          <th className="p-3">Location</th>
                          <th className="p-3">Device / Browser</th>
                          <th className="p-3">Current Page</th>
                          <th className="p-3">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-700">
                        {visitorsList.map((vis) => (
                          <tr key={vis.id} className="hover:bg-slate-750 font-mono">
                            <td className="p-3 text-slate-300">{vis.ip_address}</td>
                            <td className="p-3 font-bold text-amber-300 font-sans">{vis.location}</td>
                            <td className="p-3 text-slate-400">{vis.device}</td>
                            <td className="p-3 font-bold text-emerald-400">{vis.current_page}</td>
                            <td className="p-3">
                              <span className="bg-emerald-950 text-emerald-300 border border-emerald-800 px-2 py-0.5 rounded text-[10px] font-bold">
                                ONLINE NOW
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* SUB-TAB 4: PROFITS & FINANCIAL ANALYTICS */}
            {activitySubTab === 'profits' && profitData && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                  <div className="bg-slate-800 border border-slate-700 p-5 rounded-2xl space-y-1">
                    <p className="text-[10px] text-slate-400 uppercase font-mono">Gross Store Revenue</p>
                    <p className="text-2xl font-black text-white font-mono">₹{profitData.gross_revenue.toLocaleString()}</p>
                  </div>
                  <div className="bg-slate-800 border border-slate-700 p-5 rounded-2xl space-y-1">
                    <p className="text-[10px] text-slate-400 uppercase font-mono">Cost of Goods (COGS)</p>
                    <p className="text-2xl font-black text-slate-300 font-mono">₹{profitData.cogs.toLocaleString()}</p>
                  </div>
                  <div className="bg-slate-800 border border-slate-700 p-5 rounded-2xl space-y-1">
                    <p className="text-[10px] text-slate-400 uppercase font-mono">Net Operating Profit</p>
                    <p className="text-2xl font-black text-emerald-400 font-mono">₹{profitData.net_profit.toLocaleString()}</p>
                  </div>
                  <div className="bg-slate-800 border border-slate-700 p-5 rounded-2xl space-y-1">
                    <p className="text-[10px] text-slate-400 uppercase font-mono">Net Profit Margin</p>
                    <p className="text-2xl font-black text-amber-400 font-mono">{profitData.profit_margin}%</p>
                  </div>
                </div>

                <div className="bg-slate-800 border border-slate-700 rounded-2xl p-5 space-y-3 shadow-xl">
                  <h3 className="font-bold text-sm text-white">🔥 Top Profitable Grocery Essentials in Store</h3>
                  <div className="overflow-x-auto w-full">
                    <table className="w-full text-left text-xs text-slate-200 min-w-[550px]">
                      <thead className="bg-slate-900 text-slate-400 uppercase text-[10px] font-mono">
                        <tr>
                          <th className="p-3">Product Name</th>
                          <th className="p-3">Selling Price</th>
                          <th className="p-3">Cost Price (Est)</th>
                          <th className="p-3">Margin / Unit</th>
                          <th className="p-3">Margin %</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-700 font-mono">
                        {profitData.top_products.map((p: any) => (
                          <tr key={p.id} className="hover:bg-slate-750">
                            <td className="p-3 font-bold text-white font-sans">{p.name_en}</td>
                            <td className="p-3 text-slate-200">₹{p.selling_price}</td>
                            <td className="p-3 text-slate-400">₹{p.estimated_cost}</td>
                            <td className="p-3 font-bold text-emerald-400">₹{p.margin_per_unit}</td>
                            <td className="p-3 font-extrabold text-amber-300">{p.margin_percent}%</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* PRODUCTS / OFFERS / COUPONS / CATEGORIES / CONTENT / SETTINGS / USERS / ORDERS / AUDIT TABS */}
        {activeTab === 'products' && null}
        {activeTab === 'offers' && null}
        {activeTab === 'coupons' && null}
        {activeTab === 'categories' && null}

        {/* OFFERS TAB RENDER (Rendered inside main block if activeTab matches) */}
        {activeTab === 'offers' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl font-black text-white">Special Offers & Deals</h1>
                <p className="text-xs text-slate-400">
                  Create, edit, and toggle promotional offer banners displayed live on the customer homepage
                </p>
              </div>
              <button
                onClick={() => {
                  setSelectedOffer({
                    title_en: '',
                    title_hi: '',
                    description_en: '',
                    description_hi: '',
                    discount_badge: 'FLAT 20% OFF',
                    promo_code: 'FESTIVE20',
                    banner_url: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=800',
                    active: true,
                    sort_order: 1,
                  });
                  setIsOfferModalOpen(true);
                }}
                className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-lg flex items-center gap-2 transition"
              >
                <Plus className="w-4 h-4" />
                <span>Create New Special Offer</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {offers.map((offer) => (
                <div key={offer.id} className="bg-slate-800 border border-slate-700 rounded-2xl overflow-hidden shadow-lg flex flex-col justify-between">
                  <div>
                    {offer.banner_url && (
                      <div className="h-32 w-full relative bg-slate-950 overflow-hidden">
                        <img src={offer.banner_url} alt={offer.title_en} className="w-full h-full object-cover" />
                        <span className="absolute top-3 left-3 bg-amber-500 text-slate-950 font-black text-xs px-2.5 py-1 rounded-full shadow">
                          {offer.discount_badge}
                        </span>
                        <span className={`absolute top-3 right-3 text-[10px] font-bold px-2 py-0.5 rounded-full ${offer.active ? 'bg-emerald-900 text-emerald-300 border border-emerald-700' : 'bg-slate-900 text-slate-400'}`}>
                          {offer.active ? 'LIVE ON STORE' : 'HIDDEN'}
                        </span>
                      </div>
                    )}
                    <div className="p-4 space-y-2">
                      <h3 className="font-extrabold text-sm text-white">{offer.title_en}</h3>
                      <p className="text-xs text-amber-300 font-medium">{offer.title_hi}</p>
                      <p className="text-xs text-slate-300">{offer.description_en}</p>
                    </div>
                  </div>

                  <div className="p-4 bg-slate-900/60 border-t border-slate-700/80 flex items-center justify-between">
                    <button
                      onClick={async () => {
                        await fetch('/api/admin/offers', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ ...offer, active: !offer.active }),
                        });
                        loadAllData();
                      }}
                      className="text-xs font-bold px-3 py-1.5 rounded-lg border transition bg-emerald-950 text-emerald-300 border-emerald-800"
                    >
                      {offer.active ? 'Hide Offer' : 'Publish Live'}
                    </button>
                    <div className="flex gap-2">
                      <button onClick={() => { setSelectedOffer(offer); setIsOfferModalOpen(true); }} className="p-1.5 bg-slate-700 text-amber-300 rounded-lg">
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => handleDeleteOffer(offer.id)} className="p-1.5 bg-slate-700 text-red-400 rounded-lg">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* WEBSITE CONTENT & SETTINGS TAB */}
        {(activeTab === 'content' || activeTab === 'settings') && (
          <div className="space-y-6 max-w-4xl">
            <div>
              <h1 className="text-2xl font-black text-white">Website Content & Store Settings</h1>
              <p className="text-xs text-slate-400">
                Full editing permissions for store identity, delivery parameters, WhatsApp support, and demo payment settings
              </p>
            </div>

            <form onSubmit={handleSaveSettings} className="space-y-6">
              {/* Store Identity */}
              <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6 space-y-4">
                <h3 className="font-bold text-sm text-amber-400 flex items-center gap-2">
                  <Globe className="w-4 h-4" /> Store Identity & Contact Info
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-slate-300 text-xs mb-1">Store Name (English)</label>
                    <input
                      type="text"
                      value={settingsForm.store_name || ''}
                      onChange={(e) => setSettingsForm({ ...settingsForm, store_name: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-300 text-xs mb-1">Store Name (Hindi)</label>
                    <input
                      type="text"
                      value={settingsForm.store_name_hi || ''}
                      onChange={(e) => setSettingsForm({ ...settingsForm, store_name_hi: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs text-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-slate-300 text-xs mb-1">WhatsApp Support Number</label>
                    <input
                      type="text"
                      value={settingsForm.whatsapp || ''}
                      onChange={(e) => setSettingsForm({ ...settingsForm, whatsapp: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs text-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-300 text-xs mb-1">Phone Number</label>
                    <input
                      type="text"
                      value={settingsForm.phone || ''}
                      onChange={(e) => setSettingsForm({ ...settingsForm, phone: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs text-white font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Delivery Parameters */}
              <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6 space-y-4">
                <h3 className="font-bold text-sm text-amber-400 flex items-center gap-2">
                  <Truck className="w-4 h-4" /> Jaora Delivery & Fee Parameters
                </h3>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-slate-300 text-xs mb-1">Delivery Fee (₹)</label>
                    <input
                      type="number"
                      value={settingsForm.delivery_fee ?? 30}
                      onChange={(e) => setSettingsForm({ ...settingsForm, delivery_fee: Number(e.target.value) })}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs text-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-300 text-xs mb-1">Min Order (₹)</label>
                    <input
                      type="number"
                      value={settingsForm.min_order_amount ?? 100}
                      onChange={(e) => setSettingsForm({ ...settingsForm, min_order_amount: Number(e.target.value) })}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs text-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-300 text-xs mb-1">Free Delivery (₹)</label>
                    <input
                      type="number"
                      value={settingsForm.free_delivery_threshold ?? 499}
                      onChange={(e) => setSettingsForm({ ...settingsForm, free_delivery_threshold: Number(e.target.value) })}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs text-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-300 text-xs mb-1">Est. Time (Mins)</label>
                    <input
                      type="number"
                      value={settingsForm.estimated_delivery_min ?? 60}
                      onChange={(e) => setSettingsForm({ ...settingsForm, estimated_delivery_min: Number(e.target.value) })}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs text-white font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Save Button */}
              <button
                type="submit"
                className="w-full bg-emerald-600 hover:bg-emerald-500 font-extrabold text-sm py-3 rounded-xl text-white shadow-lg flex items-center justify-center gap-2 transition"
              >
                <Save className="w-4 h-4" />
                <span>Save All Website Settings</span>
              </button>
            </form>
          </div>
        )}

        {/* ADMIN USERS TAB */}
        {activeTab === 'users' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl font-black text-white">Admin Users & Permissions</h1>
                <p className="text-xs text-slate-400">Manage staff login accounts and password security</p>
              </div>
              <button
                onClick={() => {
                  setSelectedUser({ name: '', email: '', role: 'manager', password: '', active: true });
                  setIsUserModalOpen(true);
                }}
                className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-4 py-2.5 rounded-xl flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                <span>Add Staff Account</span>
              </button>
            </div>

            <div className="bg-slate-800 border border-slate-700 rounded-2xl overflow-hidden shadow-xl">
              <div className="overflow-x-auto w-full">
                <table className="w-full text-left text-xs text-slate-200 min-w-[500px]">
                  <thead className="bg-slate-900 text-slate-400 uppercase text-[10px] font-mono">
                    <tr>
                      <th className="p-3">Name</th>
                      <th className="p-3">Email</th>
                      <th className="p-3">Role</th>
                      <th className="p-3">Status</th>
                      <th className="p-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-700">
                    {adminUsersList.map((u) => (
                      <tr key={u.id}>
                        <td className="p-3 font-bold text-white">{u.name}</td>
                        <td className="p-3 font-mono text-slate-300">{u.email}</td>
                        <td className="p-3">
                          <span className="bg-emerald-950 text-emerald-300 border border-emerald-800 px-2 py-0.5 rounded text-[10px] uppercase font-mono">
                            {u.role}
                          </span>
                        </td>
                        <td className="p-3">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${u.active ? 'bg-emerald-950 text-emerald-300' : 'bg-red-950 text-red-300'}`}>
                            {u.active ? 'ACTIVE' : 'DISABLED'}
                          </span>
                        </td>
                        <td className="p-3 text-right">
                          <div className="flex justify-end gap-1.5">
                            <button onClick={() => { setSelectedUser(u); setIsUserModalOpen(true); }} className="p-1.5 bg-slate-700 text-amber-300 rounded-lg">
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button onClick={() => handleDeleteUser(u.id)} className="p-1.5 bg-slate-700 text-red-400 rounded-lg">
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ORDERS TAB */}
        {activeTab === 'orders' && (
          <div className="space-y-6">
            <h1 className="text-2xl font-black text-white">Order Management</h1>
            <div className="bg-slate-800 border border-slate-700 rounded-2xl overflow-hidden shadow-xl">
              <div className="overflow-x-auto w-full">
                <table className="w-full text-left text-xs text-slate-200 min-w-[650px]">
                  <thead className="bg-slate-900 text-slate-400 uppercase text-[10px] font-mono">
                    <tr>
                      <th className="p-3">Order #</th>
                      <th className="p-3">Customer</th>
                      <th className="p-3">Address</th>
                      <th className="p-3">Total</th>
                      <th className="p-3">Status</th>
                      <th className="p-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-700">
                    {orders.map((ord) => (
                      <tr key={ord.id}>
                        <td className="p-3 font-mono font-bold text-amber-300">{ord.order_number}</td>
                        <td className="p-3">
                          <p className="font-bold text-white">{ord.customer_name}</p>
                          <p className="text-[11px] text-slate-400 font-mono">{ord.customer_phone}</p>
                        </td>
                        <td className="p-3 text-slate-300 text-[11px] max-w-xs truncate">
                          {ord.delivery_address}
                        </td>
                        <td className="p-3 font-bold text-white font-mono">₹{ord.total}</td>
                        <td className="p-3">
                          <select
                            value={ord.order_status}
                            onChange={(e) => handleUpdateOrderStatus(ord.id, e.target.value)}
                            className="bg-slate-900 border border-slate-700 rounded p-1 text-[11px] text-amber-300 font-bold"
                          >
                            <option value="received">Received</option>
                            <option value="confirmed">Confirmed</option>
                            <option value="preparing">Preparing</option>
                            <option value="out_for_delivery">Out for Delivery</option>
                            <option value="delivered">Delivered</option>
                            <option value="cancelled">Cancelled</option>
                          </select>
                        </td>
                        <td className="p-3 text-right">
                          <button
                            onClick={() => { setSelectedOrder(ord); setIsInvoiceModalOpen(true); }}
                            className="p-1.5 bg-slate-700 hover:bg-slate-600 text-emerald-300 rounded-lg"
                            title="Print Invoice"
                          >
                            <Printer className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* AUDIT LOGS TAB */}
        {activeTab === 'audit' && (
          <div className="space-y-4">
            <h1 className="text-2xl font-black text-white">Security & Audit Logs</h1>
            <div className="bg-slate-800 border border-slate-700 rounded-2xl divide-y divide-slate-700/60 overflow-hidden text-xs">
              {auditLogs.map((log) => (
                <div key={log.id} className="p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 font-mono">
                  <div>
                    <span className="font-bold text-emerald-400">{log.action}</span>
                    <span className="text-slate-400 ml-2 text-[11px]">[{log.resource}]</span>
                    <p className="text-slate-300 font-sans text-xs mt-0.5">User: {log.user_email}</p>
                  </div>
                  <span className="text-[10px] text-slate-500">{new Date(log.timestamp).toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* DELIVERY RULE EDIT MODAL */}
      {isDeliveryModalOpen && selectedDeliveryRule && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-slate-800 border border-slate-700 rounded-2xl max-w-lg w-full p-6 text-xs text-white space-y-4">
            <h3 className="font-bold text-base text-amber-400">
              {selectedDeliveryRule.id ? 'Edit Delivery Zone' : 'Add Delivery Zone'}
            </h3>

            <form onSubmit={handleSaveDeliveryRule} className="space-y-3">
              <div>
                <label className="block text-slate-400 mb-1">Zone Name *</label>
                <input
                  type="text"
                  required
                  value={selectedDeliveryRule.zone_name || ''}
                  onChange={(e) => setSelectedDeliveryRule({ ...selectedDeliveryRule, zone_name: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Pincode *</label>
                  <input
                    type="text"
                    required
                    value={selectedDeliveryRule.pincode || '457226'}
                    onChange={(e) => setSelectedDeliveryRule({ ...selectedDeliveryRule, pincode: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Base Delivery Fee (₹) *</label>
                  <input
                    type="number"
                    required
                    value={selectedDeliveryRule.base_fee || 30}
                    onChange={(e) => setSelectedDeliveryRule({ ...selectedDeliveryRule, base_fee: Number(e.target.value) })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Min Order Amount (₹)</label>
                  <input
                    type="number"
                    value={selectedDeliveryRule.min_order || 100}
                    onChange={(e) => setSelectedDeliveryRule({ ...selectedDeliveryRule, min_order: Number(e.target.value) })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Free Delivery Above (₹)</label>
                  <input
                    type="number"
                    value={selectedDeliveryRule.free_threshold || 499}
                    onChange={(e) => setSelectedDeliveryRule({ ...selectedDeliveryRule, free_threshold: Number(e.target.value) })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Estimated Delivery Time (Minutes)</label>
                <input
                  type="number"
                  value={selectedDeliveryRule.estimated_minutes || 60}
                  onChange={(e) => setSelectedDeliveryRule({ ...selectedDeliveryRule, estimated_minutes: Number(e.target.value) })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white font-mono"
                />
              </div>

              <div className="flex gap-2 pt-3 border-t border-slate-700">
                <button type="submit" className="flex-1 bg-emerald-600 hover:bg-emerald-500 font-bold py-2 rounded-xl text-white">
                  Save Zone
                </button>
                <button type="button" onClick={() => setIsDeliveryModalOpen(false)} className="px-4 py-2 bg-slate-700 text-slate-300 rounded-xl">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* OFFER EDIT MODAL */}
      {isOfferModalOpen && selectedOffer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-slate-800 border border-slate-700 rounded-2xl max-w-lg w-full p-6 text-xs text-white space-y-4 max-h-[90vh] overflow-y-auto">
            <h3 className="font-bold text-base text-amber-400">
              {selectedOffer.id ? 'Edit Special Offer' : 'Create New Special Offer'}
            </h3>

            <form onSubmit={handleSaveOffer} className="space-y-3">
              <div>
                <label className="block text-slate-400 mb-1">Offer Title (EN) *</label>
                <input
                  type="text"
                  required
                  value={selectedOffer.title_en || ''}
                  onChange={(e) => setSelectedOffer({ ...selectedOffer, title_en: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Offer Title (HI) *</label>
                <input
                  type="text"
                  required
                  value={selectedOffer.title_hi || ''}
                  onChange={(e) => setSelectedOffer({ ...selectedOffer, title_hi: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Discount Badge Text *</label>
                  <input
                    type="text"
                    required
                    value={selectedOffer.discount_badge || ''}
                    onChange={(e) => setSelectedOffer({ ...selectedOffer, discount_badge: e.target.value })}
                    placeholder="e.g. FLAT 20% OFF"
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white font-bold"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Coupon Promo Code</label>
                  <input
                    type="text"
                    value={selectedOffer.promo_code || ''}
                    onChange={(e) => setSelectedOffer({ ...selectedOffer, promo_code: e.target.value })}
                    placeholder="e.g. WELCOME50"
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white font-mono uppercase"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Banner Image URL</label>
                <input
                  type="url"
                  value={selectedOffer.banner_url || ''}
                  onChange={(e) => setSelectedOffer({ ...selectedOffer, banner_url: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white font-mono"
                />
              </div>

              <div className="flex gap-2 pt-3 border-t border-slate-700">
                <button type="submit" className="flex-1 bg-emerald-600 hover:bg-emerald-500 font-bold py-2 rounded-xl text-white">
                  Save Offer
                </button>
                <button type="button" onClick={() => setIsOfferModalOpen(false)} className="px-4 py-2 bg-slate-700 text-slate-300 rounded-xl">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PRODUCT MODAL */}
      {isProductModalOpen && selectedProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-slate-800 border border-slate-700 rounded-2xl max-w-lg w-full p-6 text-xs text-white space-y-4 max-h-[90vh] overflow-y-auto">
            <h3 className="font-bold text-base text-white">
              {selectedProduct.id ? 'Edit Product' : 'Add New Product'}
            </h3>

            <form onSubmit={handleSaveProduct} className="space-y-3">
              {/* Photo Management Section */}
              <div className="bg-slate-900/90 border border-slate-700 rounded-xl p-3.5 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-amber-300 text-xs flex items-center gap-1.5">
                    📷 Product Photo
                  </label>
                  <span className="text-[10px] text-slate-400">Upload file or paste image URL</span>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-20 h-20 rounded-xl bg-slate-950 border border-slate-700 overflow-hidden flex-shrink-0 flex items-center justify-center relative shadow-inner">
                    {selectedProduct.image_urls && selectedProduct.image_urls[0] ? (
                      <img src={selectedProduct.image_urls[0]} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-[10px] text-slate-500 text-center px-1">No Photo</span>
                    )}
                  </div>

                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                      <label className="cursor-pointer inline-flex items-center gap-1.5 bg-emerald-700 hover:bg-emerald-600 text-white font-bold text-[11px] px-3 py-1.5 rounded-lg shadow transition">
                        <Upload className="w-3.5 h-3.5" />
                        <span>Upload from Device</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              const reader = new FileReader();
                              reader.onload = () => {
                                setSelectedProduct({
                                  ...selectedProduct,
                                  image_urls: [reader.result as string],
                                });
                              };
                              reader.readAsDataURL(file);
                            }
                          }}
                        />
                      </label>
                    </div>

                    <input
                      type="url"
                      placeholder="Or paste image URL (https://...)"
                      value={selectedProduct.image_urls?.[0] || ''}
                      onChange={(e) =>
                        setSelectedProduct({
                          ...selectedProduct,
                          image_urls: e.target.value ? [e.target.value] : [],
                        })
                      }
                      className="w-full bg-slate-950 border border-slate-700 text-white rounded-lg p-2 text-xs outline-none focus:border-emerald-500 font-mono"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Product Name (EN) *</label>
                  <input
                    type="text"
                    required
                    value={selectedProduct.name_en || ''}
                    onChange={(e) => setSelectedProduct({ ...selectedProduct, name_en: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Product Name (HI) *</label>
                  <input
                    type="text"
                    required
                    value={selectedProduct.name_hi || ''}
                    onChange={(e) => setSelectedProduct({ ...selectedProduct, name_hi: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Unit *</label>
                  <input
                    type="text"
                    required
                    value={selectedProduct.unit || ''}
                    onChange={(e) => setSelectedProduct({ ...selectedProduct, unit: e.target.value })}
                    placeholder="e.g. 5 kg"
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Selling Price (₹) *</label>
                  <input
                    type="number"
                    required
                    value={selectedProduct.selling_price || 0}
                    onChange={(e) => setSelectedProduct({ ...selectedProduct, selling_price: Number(e.target.value) })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white font-bold"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">MRP (₹)</label>
                  <input
                    type="number"
                    value={selectedProduct.mrp || 0}
                    onChange={(e) => setSelectedProduct({ ...selectedProduct, mrp: Number(e.target.value) })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-3 border-t border-slate-700">
                <button type="submit" className="flex-1 bg-emerald-600 hover:bg-emerald-500 font-bold py-2 rounded-xl text-white">
                  Save Product
                </button>
                <button type="button" onClick={() => setIsProductModalOpen(false)} className="px-4 py-2 bg-slate-700 text-slate-300 rounded-xl">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
