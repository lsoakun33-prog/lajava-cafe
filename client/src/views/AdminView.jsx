import React, { useState, useEffect } from 'react';
import { Lock, User, KeyRound, ShieldAlert, CheckCircle2 } from 'lucide-react';
import AdminHeader from '../components/admin/AdminHeader';
import OrdersTab from '../components/admin/OrdersTab';
import MenuTab from '../components/admin/MenuTab';
import TablesTab from '../components/admin/TablesTab';
import AnalyticsTab from '../components/admin/AnalyticsTab';
import MenuItemFormModal from '../components/admin/MenuItemFormModal';
import TableFormModal from '../components/admin/TableFormModal';
import ReceiptModal from '../components/ReceiptModal';
import { api } from '../api';
import { socket, joinAdminRoom } from '../socket';
import { playNotificationSound, playWaiterBellSound } from '../utils/sound';

export default function AdminView({ onSwitchToCustomer }) {
  const [user, setUser] = useState(() => api.getStoredUser());
  const [token, setToken] = useState(() => localStorage.getItem('noir_admin_token'));

  // Login form state
  const [usernameInput, setUsernameInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [loginError, setLoginError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Admin Dashboard State
  const [activeTab, setActiveTab] = useState('orders'); // 'orders' | 'menu' | 'tables' | 'analytics'
  const [isSoundEnabled, setIsSoundEnabled] = useState(true);

  // Data states
  const [orders, setOrders] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [tables, setTables] = useState([]);
  const [stats, setStats] = useState(null);
  const [waiterCalls, setWaiterCalls] = useState([]);

  // Modals state
  const [isMenuModalOpen, setIsMenuModalOpen] = useState(false);
  const [editingMenuItem, setEditingMenuItem] = useState(null);
  const [isTableModalOpen, setIsTableModalOpen] = useState(false);
  const [receiptOrder, setReceiptOrder] = useState(null);

  // Check login on load
  useEffect(() => {
    if (token) {
      joinAdminRoom(token);
      loadAllAdminData();
    }
  }, [token]);

  // Real-time socket listeners for Admin
  useEffect(() => {
    if (!token) return;

    const handleNewOrder = (newOrder) => {
      // Audio chime alert!
      if (isSoundEnabled) {
        playNotificationSound();
      }

      setOrders((prev) => [newOrder, ...prev]);

      // Refresh stats
      api.getStats().then((res) => setStats(res.data)).catch(() => {});
    };

    const handleStatusUpdated = (updatedOrder) => {
      setOrders((prev) =>
        prev.map((o) => (o.id === updatedOrder.id ? updatedOrder : o))
      );
      api.getStats().then((res) => setStats(res.data)).catch(() => {});
    };

    const handlePaymentUpdated = (updatedOrder) => {
      setOrders((prev) =>
        prev.map((o) => (o.id === updatedOrder.id ? updatedOrder : o))
      );
    };

    const handleWaiterCalled = (call) => {
      if (isSoundEnabled) {
        playWaiterBellSound();
      }
      setWaiterCalls((prev) => [call, ...prev.filter((c) => c.id !== call.id)]);
    };

    const handleWaiterResolved = ({ id }) => {
      setWaiterCalls((prev) => prev.filter((c) => c.id !== id));
    };

    socket.on('order:new', handleNewOrder);
    socket.on('order:status_updated', handleStatusUpdated);
    socket.on('order:payment_updated', handlePaymentUpdated);
    socket.on('waiter:called', handleWaiterCalled);
    socket.on('waiter:resolved', handleWaiterResolved);

    return () => {
      socket.off('order:new', handleNewOrder);
      socket.off('order:status_updated', handleStatusUpdated);
      socket.off('order:payment_updated', handlePaymentUpdated);
      socket.off('waiter:called', handleWaiterCalled);
      socket.off('waiter:resolved', handleWaiterResolved);
    };
  }, [token, isSoundEnabled]);

  const loadAllAdminData = async () => {
    try {
      const [ordRes, itemRes, catRes, tblRes, statRes, callRes] = await Promise.all([
        api.getOrders().catch(() => ({ data: [] })),
        api.getMenuItems().catch(() => ({ data: [] })),
        api.getCategories().catch(() => ({ data: [] })),
        api.getTables().catch(() => ({ data: [] })),
        api.getStats().catch(() => ({ data: null })),
        api.getWaiterCalls().catch(() => ({ data: [] })),
      ]);

      setOrders(ordRes.data || []);
      setMenuItems(itemRes.data || []);
      setCategories(catRes.data || []);
      setTables(tblRes.data || []);
      setStats(statRes.data || null);
      setWaiterCalls(callRes.data || []);
    } catch (err) {
      console.error('Failed to load admin data:', err);
    }
  };

  const handleResolveWaiterCall = async (callId) => {
    try {
      await api.resolveWaiterCall(callId);
      setWaiterCalls((prev) => prev.filter((c) => c.id !== callId));
    } catch (err) {
      console.error('Failed to resolve waiter call:', err);
    }
  };

  // Auth Handler
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginError('');
    setIsLoggingIn(true);
    try {
      const res = await api.login(usernameInput, passwordInput);
      if (res.success) {
        setUser(res.user);
        setToken(res.token);
      }
    } catch (err) {
      setLoginError(err.message || 'Login gagal. Periksa username dan password.');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = () => {
    api.logout();
    setUser(null);
    setToken(null);
  };

  // Status Change (supports cancelReason)
  const handleUpdateOrderStatus = async (orderId, newStatus, cancelReason = '') => {
    try {
      const res = await api.updateOrderStatus(orderId, newStatus, cancelReason);
      if (res.success) {
        setOrders((prev) =>
          prev.map((o) => (o.id === orderId ? res.data : o))
        );
      }
    } catch (err) {
      alert(err.message || 'Gagal mengubah status pesanan.');
    }
  };

  // Payment Toggle
  const handleTogglePayment = async (orderId, newPaymentStatus) => {
    try {
      const res = await api.updateOrderPayment(orderId, newPaymentStatus);
      if (res.success) {
        setOrders((prev) =>
          prev.map((o) => (o.id === orderId ? res.data : o))
        );
      }
    } catch (err) {
      alert(err.message || 'Gagal mengubah status pembayaran.');
    }
  };

  // Menu Operations
  const handleSaveMenuItem = async (menuData) => {
    try {
      if (editingMenuItem) {
        const res = await api.updateMenuItem(editingMenuItem.id, menuData);
        if (res.success) {
          setMenuItems((prev) =>
            prev.map((i) => (i.id === editingMenuItem.id ? res.data : i))
          );
        }
      } else {
        const res = await api.addMenuItem(menuData);
        if (res.success) {
          setMenuItems((prev) => [res.data, ...prev]);
        }
      }
      setIsMenuModalOpen(false);
      setEditingMenuItem(null);
    } catch (err) {
      alert(err.message || 'Gagal menyimpan menu.');
    }
  };

  const handleToggleMenuItemStock = async (itemId) => {
    try {
      const res = await api.toggleMenuItemStock(itemId);
      if (res.success) {
        setMenuItems((prev) =>
          prev.map((i) => (i.id === itemId ? { ...i, is_available: res.data.is_available } : i))
        );
      }
    } catch (err) {
      alert(err.message || 'Gagal mengubah status stok.');
    }
  };

  const handleDeleteMenuItem = async (itemId) => {
    try {
      const res = await api.deleteMenuItem(itemId);
      if (res.success) {
        setMenuItems((prev) => prev.filter((i) => i.id !== itemId));
      }
    } catch (err) {
      alert(err.message || 'Gagal menghapus menu.');
    }
  };

  // Table Operations
  const handleSaveTable = async (tableData) => {
    try {
      const res = await api.addTable(tableData);
      if (res.success) {
        setTables((prev) => [...prev, res.data]);
        setIsTableModalOpen(false);
      }
    } catch (err) {
      alert(err.message || 'Gagal menambahkan meja.');
    }
  };

  const handleDeleteTable = async (tableId) => {
    try {
      const res = await api.deleteTable(tableId);
      if (res.success) {
        setTables((prev) => prev.filter((t) => t.id !== tableId));
      }
    } catch (err) {
      alert(err.message || 'Gagal menghapus meja.');
    }
  };

  // If NOT Logged In, Render Sleek Login Gate
  if (!token) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center p-4 selection:bg-white selection:text-black">
        <div className="w-full max-w-md bg-zinc-950 border border-zinc-800 rounded-3xl p-8 space-y-6 shadow-2xl relative overflow-hidden">
          {/* Top Logo */}
          <div className="text-center space-y-2">
            <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-zinc-700 bg-black mx-auto shadow-xl">
              <img
                src="/logo-lajava.jpg"
                alt="La Java Cafe & Resto"
                className="w-full h-full object-cover"
              />
            </div>
            <h1 className="text-xl font-black tracking-widest uppercase text-white">
              LA JAVA CAFE & RESTO
            </h1>
            <p className="text-xs text-zinc-400">
              Masuk ke Dashboard Manajemen Pesanan & Dapur (KDS)
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            {loginError && (
              <div className="p-3 bg-red-950/60 border border-red-800 rounded-xl text-xs text-red-200 flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 shrink-0 text-red-400" />
                <span>{loginError}</span>
              </div>
            )}

            <div className="space-y-1">
              <label className="text-xs font-semibold text-zinc-300 block">Username</label>
              <div className="relative">
                <User className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={usernameInput}
                  onChange={(e) => setUsernameInput(e.target.value)}
                  placeholder="Masukkan username"
                  required
                  className="w-full pl-10 pr-4 py-2.5 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-white transition-colors"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-zinc-300 block">Password</label>
              <div className="relative">
                <KeyRound className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full pl-10 pr-4 py-2.5 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-white transition-colors"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoggingIn}
              className="w-full py-3 px-4 rounded-xl bg-white text-black font-bold text-xs tracking-wider uppercase hover:bg-zinc-200 transition-all shadow-lg active:scale-[0.99] disabled:opacity-50"
            >
              {isLoggingIn ? 'Memverifikasi...' : 'Masuk ke Dashboard'}
            </button>
          </form>

          {/* Switch back to Customer */}
          <div className="text-center pt-2 border-t border-zinc-900">
            <button
              onClick={onSwitchToCustomer}
              className="text-xs text-zinc-400 hover:text-white transition-colors"
            >
              ← Kembali ke Halaman Pemesanan Tamu
            </button>
          </div>
        </div>
      </div>
    );
  }

  const pendingCount = orders.filter((o) => o.status === 'PENDING').length;

  return (
    <div className="min-h-screen bg-black text-white flex flex-col selection:bg-white selection:text-black">
      {/* Header */}
      <AdminHeader
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        pendingCount={pendingCount}
        isSoundEnabled={isSoundEnabled}
        onToggleSound={() => setIsSoundEnabled(!isSoundEnabled)}
        onSwitchToCustomer={onSwitchToCustomer}
        onLogout={handleLogout}
        user={user}
      />

      {/* Real-Time Waiter Calls Alert Bar */}
      {waiterCalls.length > 0 && (
        <div className="bg-zinc-900 border-b border-zinc-800 px-4 lg:px-8 py-2.5 animate-pulse">
          <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 text-xs">
              <span className="w-2.5 h-2.5 rounded-full bg-white animate-ping"></span>
              <span className="font-bold text-white uppercase tracking-wider">
                Panggilan Meja ({waiterCalls.length}):
              </span>
              <span className="text-zinc-300">
                <span className="font-bold text-white">{waiterCalls[0].table_number}</span> —{' '}
                {waiterCalls[0].call_type.replace(/_/g, ' ')}
                {waiterCalls[0].note ? ` ("${waiterCalls[0].note}")` : ''}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleResolveWaiterCall(waiterCalls[0].id)}
                className="px-3 py-1 rounded-lg bg-white text-black text-xs font-bold uppercase hover:bg-zinc-200 transition-colors"
              >
                ✓ Tandai Sudah Ditangani
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 lg:px-8 py-6 pb-20">
        {activeTab === 'orders' && (
          <OrdersTab
            orders={orders}
            onUpdateStatus={handleUpdateOrderStatus}
            onTogglePayment={handleTogglePayment}
            onPrintReceipt={(order) => setReceiptOrder(order)}
            onRefresh={loadAllAdminData}
          />
        )}

        {activeTab === 'menu' && (
          <MenuTab
            menuItems={menuItems}
            categories={categories}
            onOpenAddModal={() => {
              setEditingMenuItem(null);
              setIsMenuModalOpen(true);
            }}
            onOpenEditModal={(item) => {
              setEditingMenuItem(item);
              setIsMenuModalOpen(true);
            }}
            onToggleStock={handleToggleMenuItemStock}
            onDeleteItem={handleDeleteMenuItem}
          />
        )}

        {activeTab === 'tables' && (
          <TablesTab
            tables={tables}
            onOpenAddTable={() => setIsTableModalOpen(true)}
            onDeleteTable={handleDeleteTable}
          />
        )}

        {activeTab === 'analytics' && (
          <AnalyticsTab stats={stats} orders={orders} onRefresh={loadAllAdminData} />
        )}
      </main>

      {/* Modals */}
      <MenuItemFormModal
        isOpen={isMenuModalOpen}
        onClose={() => {
          setIsMenuModalOpen(false);
          setEditingMenuItem(null);
        }}
        onSubmit={handleSaveMenuItem}
        categories={categories}
        editingItem={editingMenuItem}
      />

      <TableFormModal
        isOpen={isTableModalOpen}
        onClose={() => setIsTableModalOpen(false)}
        onSubmit={handleSaveTable}
      />

      <ReceiptModal
        order={receiptOrder}
        onClose={() => setReceiptOrder(null)}
      />
    </div>
  );
}
