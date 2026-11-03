import React, { useState, useEffect } from 'react';
import { Lock, User, KeyRound, ShieldAlert, CheckCircle2, Bell } from 'lucide-react';
import AdminHeader from '../components/admin/AdminHeader';
import OrdersTab from '../components/admin/OrdersTab';
import MenuTab from '../components/admin/MenuTab';
import TablesTab from '../components/admin/TablesTab';
import AnalyticsTab from '../components/admin/AnalyticsTab';
import MenuItemFormModal from '../components/admin/MenuItemFormModal';
import TableFormModal from '../components/admin/TableFormModal';
import WaiterCallsModal from '../components/admin/WaiterCallsModal';
import ChangePasswordModal from '../components/admin/ChangePasswordModal';
import ReceiptModal from '../components/ReceiptModal';
import { api } from '../api';
import { socket, joinAdminRoom } from '../socket';
import { playNotificationSound, playWaiterBellSound } from '../utils/sound';
import { formatTimeAgo } from '../utils/format';

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
  const [isSocketConnected, setIsSocketConnected] = useState(socket.connected);

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
  const [isWaiterCallsModalOpen, setIsWaiterCallsModalOpen] = useState(false);
  const [isChangePasswordModalOpen, setIsChangePasswordModalOpen] = useState(false);

  // 1. Listen for global auth:expired event from API interceptor
  useEffect(() => {
    const onAuthExpired = (e) => {
      setToken(null);
      setUser(null);
      setLoginError(e.detail || 'Sesi login telah berakhir. Silakan login kembali.');
    };
    window.addEventListener('auth:expired', onAuthExpired);
    return () => window.removeEventListener('auth:expired', onAuthExpired);
  }, []);

  // 2. Validate token with server on load
  useEffect(() => {
    if (token) {
      api.getMe()
        .then((res) => {
          if (res.success && res.data) {
            setUser(res.data);
            joinAdminRoom(token);
            loadAllAdminData();
          }
        })
        .catch((err) => {
          console.warn('[Admin Auth Check Failed]:', err.message);
          setToken(null);
          setUser(null);
          localStorage.removeItem('noir_admin_token');
          localStorage.removeItem('noir_admin_user');
          setLoginError('Sesi Anda telah kedaluwarsa. Silakan masuk kembali.');
        });
    }
  }, [token]);

  // 3. Real-time socket listeners for Admin with Auto Re-join & Auto Re-sync on Reconnect
  useEffect(() => {
    if (!token) return;

    const handleConnect = () => {
      setIsSocketConnected(true);
      joinAdminRoom(token);
      loadAllAdminData(); // Auto re-sync latest orders so no orders are missed!
    };

    const handleDisconnect = () => {
      setIsSocketConnected(false);
    };

    const handleAuthFailed = (data) => {
      console.warn('[Admin Socket Auth Failed]:', data?.message);
      setToken(null);
      setUser(null);
      localStorage.removeItem('noir_admin_token');
      localStorage.removeItem('noir_admin_user');
      setLoginError(data?.message || 'Sesi admin tidak valid. Silakan login kembali.');
    };

    const handleNewOrder = (newOrder) => {
      // Audio chime alert!
      if (isSoundEnabled) {
        playNotificationSound();
      }

      setOrders((prev) => {
        if (prev.some((o) => o.id === newOrder.id)) return prev;
        return [newOrder, ...prev];
      });

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
      // FIFO: Append new calls to the end of the queue so oldest call remains priority #1 at index 0
      setWaiterCalls((prev) => [...prev.filter((c) => c.id !== call.id), call]);
    };

    const handleWaiterResolved = ({ id }) => {
      setWaiterCalls((prev) => prev.filter((c) => c.id !== id));
    };

    const handleWaiterResolvedAll = () => {
      setWaiterCalls([]);
    };

    socket.on('connect', handleConnect);
    socket.on('disconnect', handleDisconnect);
    socket.on('admin:auth_failed', handleAuthFailed);
    socket.on('order:new', handleNewOrder);
    socket.on('order:status_updated', handleStatusUpdated);
    socket.on('order:payment_updated', handlePaymentUpdated);
    socket.on('waiter:called', handleWaiterCalled);
    socket.on('waiter:resolved', handleWaiterResolved);
    socket.on('waiter:resolved_all', handleWaiterResolvedAll);

    return () => {
      socket.off('connect', handleConnect);
      socket.off('disconnect', handleDisconnect);
      socket.off('admin:auth_failed', handleAuthFailed);
      socket.off('order:new', handleNewOrder);
      socket.off('order:status_updated', handleStatusUpdated);
      socket.off('order:payment_updated', handlePaymentUpdated);
      socket.off('waiter:called', handleWaiterCalled);
      socket.off('waiter:resolved', handleWaiterResolved);
      socket.off('waiter:resolved_all', handleWaiterResolvedAll);
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

  const handleResolveAllWaiterCalls = async () => {
    try {
      await api.resolveAllWaiterCalls();
      setWaiterCalls([]);
    } catch (err) {
      console.error('Failed to resolve all waiter calls:', err);
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
        waiterCallsCount={waiterCalls.length}
        onOpenWaiterCallsModal={() => setIsWaiterCallsModalOpen(true)}
        onOpenChangePasswordModal={() => setIsChangePasswordModalOpen(true)}
        isSoundEnabled={isSoundEnabled}
        onToggleSound={() => setIsSoundEnabled(!isSoundEnabled)}
        onSwitchToCustomer={onSwitchToCustomer}
        onLogout={handleLogout}
        user={user}
        isLive={isSocketConnected}
      />

      {/* Real-Time Waiter Calls Alert Bar with Multi-Call & FIFO Priority Support */}
      {waiterCalls.length > 0 && (
        <div className="bg-zinc-900 border-b border-zinc-800 px-4 lg:px-8 py-3 transition-all no-print">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2.5 text-xs">
              <span className="w-2.5 h-2.5 rounded-full bg-white animate-ping" />
              <span className="font-extrabold text-white uppercase tracking-wider bg-zinc-800 px-2 py-0.5 rounded-md border border-zinc-700">
                Panggilan Meja ({waiterCalls.length})
              </span>
              <span className="text-zinc-300 flex flex-wrap items-center gap-1.5">
                <span className="text-zinc-400 font-semibold">Prioritas #1:</span>
                <span className="font-black text-white bg-zinc-800 px-2 py-0.5 rounded border border-zinc-700">
                  {waiterCalls[0].table_number}
                </span>
                <span>— {waiterCalls[0].call_type ? waiterCalls[0].call_type.replace(/_/g, ' ') : 'Bantuan'}</span>
                {waiterCalls[0].note && (
                  <span className="text-zinc-400 italic font-mono text-[11px]">
                    ("{waiterCalls[0].note}")
                  </span>
                )}
                {waiterCalls[0].created_at && (
                  <span className="text-zinc-400 text-[11px]">
                    ({formatTimeAgo(waiterCalls[0].created_at)})
                  </span>
                )}
              </span>

              {/* Preview next tables in queue if multiple */}
              {waiterCalls.length > 1 && (
                <span className="text-zinc-400 text-[11px] hidden lg:inline">
                  | Antrean berikutnya:{' '}
                  <span className="text-zinc-300 font-semibold">
                    {waiterCalls.slice(1, 4).map((c) => c.table_number).join(', ')}
                    {waiterCalls.length > 4 ? ` (+${waiterCalls.length - 4} lainnya)` : ''}
                  </span>
                </span>
              )}
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => setIsWaiterCallsModalOpen(true)}
                className="px-3.5 py-1.5 rounded-xl border border-zinc-700 bg-zinc-800 text-white text-xs font-bold hover:bg-zinc-700 transition-colors flex items-center gap-1.5"
              >
                <Bell className="w-3.5 h-3.5" />
                <span>Buka Antrean ({waiterCalls.length})</span>
              </button>
              <button
                onClick={() => handleResolveWaiterCall(waiterCalls[0].id)}
                className="px-3.5 py-1.5 rounded-xl bg-white text-black text-xs font-bold uppercase tracking-wider hover:bg-zinc-200 transition-colors shadow-sm"
              >
                ✓ Selesaikan {waiterCalls[0].table_number}
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
        isAdmin={true}
      />

      {/* Active Waiter Calls Queue Modal */}
      <WaiterCallsModal
        isOpen={isWaiterCallsModalOpen}
        onClose={() => setIsWaiterCallsModalOpen(false)}
        calls={waiterCalls}
        onResolveCall={handleResolveWaiterCall}
        onResolveAll={handleResolveAllWaiterCalls}
      />

      {/* Change Password Modal */}
      <ChangePasswordModal
        isOpen={isChangePasswordModalOpen}
        onClose={() => setIsChangePasswordModalOpen(false)}
      />
    </div>
  );
}
