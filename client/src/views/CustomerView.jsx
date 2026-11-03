import React, { useState, useEffect, useCallback, useRef } from 'react';
import { ArrowRight, ShoppingBag, Sparkles, AlertCircle, WifiOff } from 'lucide-react';
import Header from '../components/Header';
import CategoryFilter from '../components/CategoryFilter';
import MenuItemCard from '../components/MenuItemCard';
import ItemModal from '../components/ItemModal';
import CartDrawer from '../components/CartDrawer';
import OrderStatusModal from '../components/OrderStatusModal';
import QRScannerModal from '../components/QRScannerModal';
import ReceiptModal from '../components/ReceiptModal';
import CallWaiterModal from '../components/CallWaiterModal';
import OrderHistoryModal from '../components/OrderHistoryModal';
import { api } from '../api';
import { socket, joinTableRoom, joinOrderRoom, joinDeviceRoom } from '../socket';
import { formatRupiah } from '../utils/format';

function getOrCreateDeviceId() {
  try {
    let id = localStorage.getItem('noir_device_id');
    if (!id) {
      id = (typeof crypto !== 'undefined' && crypto.randomUUID)
        ? crypto.randomUUID()
        : 'dev_' + Math.random().toString(36).slice(2) + Date.now().toString(36);
      localStorage.setItem('noir_device_id', id);
    }
    return id;
  } catch {
    return 'dev_fallback_' + Date.now();
  }
}

function isOrderFromToday(order) {
  if (!order || !order.created_at) return false;
  try {
    const orderDate = new Date(order.created_at);
    const now = new Date();
    const diffHours = (now - orderDate) / (1000 * 60 * 60);
    return diffHours < 18 || orderDate.toDateString() === now.toDateString();
  } catch {
    return false;
  }
}

export default function CustomerView({ onSwitchToAdmin }) {
  // Persistent Unique Device ID for customer device-level isolation
  const [deviceId] = useState(() => getOrCreateDeviceId());

  // Table state (parsed from ?table= URL query or saved in localStorage)
  const [tableNumber, setTableNumber] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    const tableParam = params.get('table');
    if (tableParam) return decodeURIComponent(tableParam);
    return localStorage.getItem('noir_customer_table') || 'Meja 01';
  });

  // Table Token for QR anti-spoofing
  const [tableToken, setTableToken] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    const tokenParam = params.get('token');
    if (tokenParam) {
      localStorage.setItem('noir_table_token', tokenParam);
      return tokenParam;
    }
    return localStorage.getItem('noir_table_token') || '';
  });

  // Online / Offline network state
  const [isOnline, setIsOnline] = useState(socket.connected);

  // Customer name saved across orders
  const [customerName, setCustomerName] = useState(() => {
    return localStorage.getItem('noir_customer_name') || '';
  });

  // Menu data
  const [categories, setCategories] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [tablesList, setTablesList] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Cart state
  const [cart, setCart] = useState(() => {
    try {
      const saved = localStorage.getItem('noir_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Active / Last placed order (only keep if placed today)
  const [activeOrder, setActiveOrder] = useState(() => {
    try {
      const saved = localStorage.getItem('noir_active_order');
      if (!saved) return null;
      const parsed = JSON.parse(saved);
      if (!isOrderFromToday(parsed)) {
        localStorage.removeItem('noir_active_order');
        return null;
      }
      return parsed;
    } catch {
      return null;
    }
  });

  // Session Order History (filtered to today's orders on this device)
  const [orderHistory, setOrderHistory] = useState(() => {
    try {
      const saved = localStorage.getItem('noir_order_history');
      if (!saved) return [];
      const parsed = JSON.parse(saved);
      const freshOnly = Array.isArray(parsed) ? parsed.filter(isOrderFromToday) : [];
      localStorage.setItem('noir_order_history', JSON.stringify(freshOnly));
      return freshOnly;
    } catch {
      return [];
    }
  });

  const [isRefreshingHistory, setIsRefreshingHistory] = useState(false);

  // Modals state
  const [selectedItemForModal, setSelectedItemForModal] = useState(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isOrderStatusOpen, setIsOrderStatusOpen] = useState(false);
  const [isQRScannerOpen, setIsQRScannerOpen] = useState(false);
  const [isCallWaiterOpen, setIsCallWaiterOpen] = useState(false);
  const [isOrderHistoryOpen, setIsOrderHistoryOpen] = useState(false);
  const [receiptOrder, setReceiptOrder] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 5-minute auto-close deadline (timestamp ms) — set when admin marks COMPLETED
  // null = no auto-close scheduled
  const [autoCloseDeadline, setAutoCloseDeadline] = useState(null);
  const autoCloseTimerRef = useRef(null); // stores the setTimeout ID

  // Persist cart
  useEffect(() => {
    localStorage.setItem('noir_cart', JSON.stringify(cart));
  }, [cart]);

  // Join device room & table room
  useEffect(() => {
    if (deviceId) {
      joinDeviceRoom(deviceId);
    }
  }, [deviceId]);

  // Persist table
  useEffect(() => {
    localStorage.setItem('noir_customer_table', tableNumber);
    joinTableRoom(tableNumber);
  }, [tableNumber]);

  // ─── Callback: sync updated order back to state + localStorage ─────────────
  const handleOrderUpdated = useCallback((updatedOrder) => {
    setActiveOrder(updatedOrder);
    localStorage.setItem('noir_active_order', JSON.stringify(updatedOrder));
    setOrderHistory((prev) => {
      const next = prev.some((o) => o.id === updatedOrder.id)
        ? prev.map((o) => (o.id === updatedOrder.id ? updatedOrder : o))
        : [updatedOrder, ...prev];
      localStorage.setItem('noir_order_history', JSON.stringify(next));
      return next;
    });
  }, []);

  // Online / Offline listener & auto re-join rooms on reconnect
  useEffect(() => {
    const onConnect = () => {
      setIsOnline(true);
      if (deviceId) joinDeviceRoom(deviceId);
      if (tableNumber) joinTableRoom(tableNumber);
    };
    const onDisconnect = () => setIsOnline(false);
    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
    };
  }, [deviceId, tableNumber]);

  // ─── Customer clicks "Selesai ✓" → clear IMMEDIATELY ────────────────────────
  const handleCustomerConfirmDone = useCallback(() => {
    // Cancel the 5-min auto-close timer if it was running
    if (autoCloseTimerRef.current) {
      clearTimeout(autoCloseTimerRef.current);
      autoCloseTimerRef.current = null;
    }
    setAutoCloseDeadline(null);
    // Wipe active order from state and localStorage right away
    setActiveOrder(null);
    localStorage.removeItem('noir_active_order');
    setIsOrderStatusOpen(false);
  }, []);

  // ─── Helper: start/reset the 5-min admin auto-close timer ───────────────────
  const startAdminAutoCloseTimer = useCallback(() => {
    // Clear any previously running timer
    if (autoCloseTimerRef.current) clearTimeout(autoCloseTimerRef.current);

    const deadline = Date.now() + 5 * 60 * 1000; // 5 minutes from now
    setAutoCloseDeadline(deadline);

    autoCloseTimerRef.current = setTimeout(() => {
      autoCloseTimerRef.current = null;
      setAutoCloseDeadline(null);
      setActiveOrder(null);
      localStorage.removeItem('noir_active_order');
      setIsOrderStatusOpen(false);
    }, 5 * 60 * 1000);
  }, []);

  // Sync orders for this device from server
  const syncDeviceOrders = useCallback(async () => {
    if (!deviceId) return;
    try {
      setIsRefreshingHistory(true);
      const res = await api.getMyOrders(deviceId, tableNumber);
      if (res && res.success && Array.isArray(res.data)) {
        setOrderHistory(res.data);
        localStorage.setItem('noir_order_history', JSON.stringify(res.data));

        // If there's an ongoing (uncompleted) order, ensure activeOrder is tracking it
        const currentOngoing = res.data.find(
          (o) => o.status !== 'COMPLETED' && o.status !== 'CANCELLED'
        );
        if (currentOngoing) {
          setActiveOrder(currentOngoing);
          localStorage.setItem('noir_active_order', JSON.stringify(currentOngoing));
          joinOrderRoom(currentOngoing.id);
        }
      }
    } catch (err) {
      console.warn('[Sync Orders] Failed to fetch device orders:', err.message);
    } finally {
      setIsRefreshingHistory(false);
    }
  }, [deviceId, tableNumber]);

  // Fetch initial data
  useEffect(() => {
    loadData();
    syncDeviceOrders();

    // Re-join order room if there's an existing active order (e.g. after page refresh)
    const savedOrder = (() => {
      try {
        const saved = localStorage.getItem('noir_active_order');
        return saved ? JSON.parse(saved) : null;
      } catch { return null; }
    })();
    if (savedOrder?.id) {
      joinOrderRoom(savedOrder.id);
    }

    // Listen to real-time menu events
    const handleAvailability = ({ id, is_available }) => {
      setMenuItems((prev) =>
        prev.map((item) => (item.id === id ? { ...item, is_available } : item))
      );
    };

    const handleMenuUpdate = (updatedItem) => {
      setMenuItems((prev) => {
        const exists = prev.some((i) => i.id === updatedItem.id);
        if (exists) {
          return prev.map((i) => (i.id === updatedItem.id ? updatedItem : i));
        }
        return [updatedItem, ...prev];
      });
    };

    const handleMenuDelete = ({ id }) => {
      setMenuItems((prev) => prev.filter((i) => i.id !== id));
    };

    // Listen to order status updates even when modal is closed
    // When admin marks COMPLETED → start 5-min countdown before auto-clearing
    const handleOrderStatusUpdate = (updatedOrder) => {
      setActiveOrder((prev) => {
        if (prev && updatedOrder.id === prev.id) {
          localStorage.setItem('noir_active_order', JSON.stringify(updatedOrder));

          if (updatedOrder.status === 'COMPLETED') {
            // Trigger the 5-min auto-close timer (via ref, safe inside state updater)
            startAdminAutoCloseTimer();
          }

          return updatedOrder;
        }
        return prev;
      });

      // Update in order history
      setOrderHistory((prev) => {
        if (!prev.some((o) => o.id === updatedOrder.id)) return prev;
        const next = prev.map((o) => (o.id === updatedOrder.id ? updatedOrder : o));
        localStorage.setItem('noir_order_history', JSON.stringify(next));
        return next;
      });
    };

    const handleOrderPaymentUpdate = (updatedOrder) => {
      setActiveOrder((prev) => {
        if (prev && updatedOrder.id === prev.id) {
          localStorage.setItem('noir_active_order', JSON.stringify(updatedOrder));
          return updatedOrder;
        }
        return prev;
      });

      setOrderHistory((prev) => {
        if (!prev.some((o) => o.id === updatedOrder.id)) return prev;
        const next = prev.map((o) => (o.id === updatedOrder.id ? updatedOrder : o));
        localStorage.setItem('noir_order_history', JSON.stringify(next));
        return next;
      });
    };

    socket.on('menu:availability_changed', handleAvailability);
    socket.on('menu:updated', handleMenuUpdate);
    socket.on('menu:deleted', handleMenuDelete);
    socket.on('order:status_updated', handleOrderStatusUpdate);
    socket.on('order:payment_updated', handleOrderPaymentUpdate);

    return () => {
      socket.off('menu:availability_changed', handleAvailability);
      socket.off('menu:updated', handleMenuUpdate);
      socket.off('menu:deleted', handleMenuDelete);
      socket.off('order:status_updated', handleOrderStatusUpdate);
      socket.off('order:payment_updated', handleOrderPaymentUpdate);
      // Clean up timer on unmount
      if (autoCloseTimerRef.current) clearTimeout(autoCloseTimerRef.current);
    };
  }, [startAdminAutoCloseTimer, syncDeviceOrders]);



  const loadData = async () => {
    setIsLoading(true);
    try {
      const [catRes, itemRes, tableRes] = await Promise.all([
        api.getCategories().catch(() => ({ data: [] })),
        api.getMenuItems().catch(() => ({ data: [] })),
        api.getTables().catch(() => ({ data: [] })),
      ]);

      setCategories(catRes.data || []);
      setMenuItems(itemRes.data || []);
      setTablesList(tableRes.data || []);
    } catch (err) {
      console.error('Error loading menu:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Cart operations
  const handleAddToCart = (itemToAdd) => {
    setCart((prev) => {
      const existingIdx = prev.findIndex(
        (i) => i.id === itemToAdd.id && (i.notes || '') === (itemToAdd.notes || '')
      );
      if (existingIdx > -1) {
        const copy = [...prev];
        copy[existingIdx].quantity += itemToAdd.quantity;
        return copy;
      }
      return [...prev, itemToAdd];
    });
  };

  const handleQuickAdd = (item) => {
    handleAddToCart({
      ...item,
      quantity: 1,
      notes: '',
    });
  };

  const handleUpdateQuantity = (itemId, itemNotes, newQty) => {
    if (newQty <= 0) {
      handleRemoveItem(itemId, itemNotes);
      return;
    }
    setCart((prev) =>
      prev.map((i) =>
        i.id === itemId && (i.notes || '') === (itemNotes || '') ? { ...i, quantity: newQty } : i
      )
    );
  };

  const handleRemoveItem = (itemId, itemNotes) => {
    setCart((prev) =>
      prev.filter((i) => !(i.id === itemId && (i.notes || '') === (itemNotes || '')))
    );
  };

  const handleUpdateItemNotes = (itemId, oldNotes, newNotes) => {
    setCart((prev) => {
      const itemIndex = prev.findIndex(
        (i) => i.id === itemId && (i.notes || '') === (oldNotes || '')
      );
      if (itemIndex === -1) return prev;

      const trimmedNewNotes = (newNotes || '').trim();
      if (trimmedNewNotes === (oldNotes || '').trim()) return prev;

      // Check if an item with the same id and the same new notes already exists
      const existingWithNewNotesIndex = prev.findIndex(
        (i, idx) => idx !== itemIndex && i.id === itemId && (i.notes || '') === trimmedNewNotes
      );

      if (existingWithNewNotesIndex > -1) {
        // Merge quantities together and remove current item
        const copy = [...prev];
        copy[existingWithNewNotesIndex].quantity += copy[itemIndex].quantity;
        copy.splice(itemIndex, 1);
        return copy;
      } else {
        // Update notes on current item
        const copy = [...prev];
        copy[itemIndex] = { ...copy[itemIndex], notes: trimmedNewNotes };
        return copy;
      }
    });
  };

  // Submit Order
  const handleSubmitOrder = async (orderPayload, paymentStatus = 'UNPAID') => {
    setIsSubmitting(true);
    try {
      // Save customer name for convenience
      localStorage.setItem('noir_customer_name', orderPayload.customerName);

      const payloadWithToken = {
        ...orderPayload,
        tableToken: tableToken || undefined,
        deviceId,
      };

      const res = await api.createOrder(payloadWithToken);
      if (res.success && res.data) {
        const finalOrder = res.data;

        setActiveOrder(finalOrder);
        localStorage.setItem('noir_active_order', JSON.stringify(finalOrder));

        // Save to multi-order history
        setOrderHistory((prev) => {
          const next = [finalOrder, ...prev.filter((o) => o.id !== finalOrder.id)];
          localStorage.setItem('noir_order_history', JSON.stringify(next));
          return next;
        });

        joinOrderRoom(finalOrder.id);

        // Clear cart
        setCart([]);
        setIsCartOpen(false);

        // Open live order status modal
        setIsOrderStatusOpen(true);
      }
    } catch (err) {
      alert(err.message || 'Gagal membuat pesanan. Silakan coba lagi.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle table switch from scanner
  const handleSelectTable = (newTable) => {
    setTableNumber(newTable);
    // Update URL query string without page reload
    const url = new URL(window.location);
    url.searchParams.set('table', newTable);
    window.history.replaceState({}, '', url);
  };

  // Filtered menu items
  const filteredItems = menuItems.filter((item) => {
    const matchCat =
      selectedCategory === 'all' ||
      item.category_slug === selectedCategory ||
      item.category_id === selectedCategory;
    const matchSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.description && item.description.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchCat && matchSearch;
  });

  const cartTotalItems = cart.reduce((acc, i) => acc + i.quantity, 0);
  const cartSubtotal = cart.reduce((acc, i) => acc + i.price * i.quantity, 0);

  return (
    <div className="min-h-screen bg-black text-white flex flex-col selection:bg-white selection:text-black">
      {/* Offline / Reconnecting Alert Banner */}
      {!isOnline && (
        <div className="bg-zinc-900 border-b border-zinc-800 text-zinc-300 py-2 px-4 text-center text-xs flex items-center justify-center gap-2 sticky top-0 z-50 animate-pulse">
          <WifiOff className="w-4 h-4 text-zinc-400" />
          <span>Koneksi terputus. Mencoba menghubungkan kembali ke dapur &amp; kasir...</span>
        </div>
      )}

      {/* Header */}
      <Header
        tableNumber={tableNumber}
        onOpenQRScanner={() => setIsQRScannerOpen(true)}
        cartCount={cartTotalItems}
        onOpenCart={() => setIsCartOpen(true)}
        onOpenOrderHistory={() => setIsOrderStatusOpen(true)}
        hasActiveOrder={!!activeOrder}
        onSwitchToAdmin={onSwitchToAdmin}
        onOpenCallWaiter={() => setIsCallWaiterOpen(true)}
        onOpenPastOrders={() => {
          syncDeviceOrders();
          setIsOrderHistoryOpen(true);
        }}
        pastOrdersCount={orderHistory.length}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 lg:px-8 py-6 pb-28">
        {/* Hero Welcome Banner */}
        <div className="mb-6 p-6 rounded-3xl bg-zinc-950 border border-zinc-800/80 relative overflow-hidden flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1 relative z-10">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold tracking-widest uppercase px-2.5 py-0.5 rounded-full bg-white text-black">
                Pesan dari Meja
              </span>
              <span className="text-xs text-zinc-400">Anda duduk di:</span>
              <span className="text-xs font-bold text-white px-2 py-0.5 rounded-md bg-zinc-900 border border-zinc-800">
                {tableNumber}
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white mt-1">
              Pesan Langsung Tanpa Antre
            </h1>
            <p className="text-xs text-zinc-400 max-w-lg">
              Pilih makanan & kopi artisan favorit Anda. Pesanan langsung masuk ke display dapur secara real-time.
            </p>
          </div>

          <button
            onClick={() => setIsQRScannerOpen(true)}
            className="self-start sm:self-auto flex items-center gap-2 px-4 py-2.5 rounded-xl border border-zinc-800 bg-zinc-900/80 text-zinc-300 hover:text-white hover:border-zinc-700 text-xs font-semibold transition-all relative z-10"
          >
            <span>Ganti Meja / Scan QR</span>
          </button>
        </div>

        {/* Categories & Search */}
        <CategoryFilter
          categories={categories}
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
        />

        {/* Menu Items Grid */}
        {isLoading ? (
          <div className="py-24 text-center text-zinc-500 text-xs flex flex-col items-center justify-center gap-3">
            <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            <span>Memuat hidangan artisan...</span>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="py-20 text-center rounded-3xl border border-dashed border-zinc-800 bg-zinc-950/40 p-6 space-y-2">
            <p className="text-sm font-bold text-white">Menu tidak ditemukan</p>
            <p className="text-xs text-zinc-500">
              Coba gunakan kata kunci lain atau pilih kategori menu yang berbeda.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5">
            {filteredItems.map((item) => (
              <MenuItemCard
                key={item.id}
                item={item}
                onSelect={setSelectedItemForModal}
                onQuickAdd={handleQuickAdd}
              />
            ))}
          </div>
        )}
      </main>

      {/* Floating Bottom Cart Bar (Sticky when cart > 0) */}
      {cart.length > 0 && !isCartOpen && (
        <div className="fixed bottom-5 left-4 right-4 z-40 max-w-lg mx-auto animate-bounce-subtle">
          <button
            onClick={() => setIsCartOpen(true)}
            className="w-full p-4 rounded-2xl bg-white text-black font-bold flex items-center justify-between shadow-2xl hover:bg-zinc-200 transition-all active:scale-[0.99] border-2 border-black"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-black text-white flex items-center justify-center text-xs font-bold">
                {cartTotalItems}
              </div>
              <div className="text-left">
                <div className="text-xs font-bold uppercase tracking-wider">Lihat Pesanan</div>
                <div className="text-[11px] text-zinc-600 font-normal">
                  {tableNumber} • {formatRupiah(cartSubtotal)}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1.5 text-xs font-black tracking-wider uppercase">
              <span>Selesaikan</span>
              <ArrowRight className="w-4 h-4" />
            </div>
          </button>
        </div>
      )}

      {/* Modals */}
      <ItemModal
        item={selectedItemForModal}
        isOpen={!!selectedItemForModal}
        onClose={() => setSelectedItemForModal(null)}
        onAddToCart={handleAddToCart}
      />

      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cart={cart}
        tableNumber={tableNumber}
        customerName={customerName}
        setCustomerName={setCustomerName}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveItem}
        onUpdateNotes={handleUpdateItemNotes}
        onClearCart={() => setCart([])}
        onSubmitOrder={handleSubmitOrder}
        isSubmitting={isSubmitting}
      />

      <OrderStatusModal
        order={activeOrder}
        isOpen={isOrderStatusOpen}
        onClose={() => setIsOrderStatusOpen(false)}
        onViewReceipt={(order) => {
          setReceiptOrder(order);
        }}
        onOrderUpdated={handleOrderUpdated}
        onCustomerConfirm={handleCustomerConfirmDone}
        onDismissCancelled={handleCustomerConfirmDone}
        autoCloseDeadline={autoCloseDeadline}
      />

      <QRScannerModal
        isOpen={isQRScannerOpen}
        onClose={() => setIsQRScannerOpen(false)}
        onSelectTable={handleSelectTable}
        tables={tablesList}
      />

      <ReceiptModal
        order={receiptOrder}
        onClose={() => setReceiptOrder(null)}
        isAdmin={false}
      />

      {/* Call Waiter Dialog */}
      <CallWaiterModal
        isOpen={isCallWaiterOpen}
        onClose={() => setIsCallWaiterOpen(false)}
        tableNumber={tableNumber}
      />

      {/* Session Order History Dialog */}
      <OrderHistoryModal
        isOpen={isOrderHistoryOpen}
        onClose={() => setIsOrderHistoryOpen(false)}
        orders={orderHistory}
        onRefresh={syncDeviceOrders}
        isRefreshing={isRefreshingHistory}
        onViewReceipt={(order) => setReceiptOrder(order)}
        onViewStatus={(order) => {
          setActiveOrder(order);
          setIsOrderStatusOpen(true);
        }}
      />
    </div>
  );
}
