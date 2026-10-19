const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const db = require('../db');
const { authenticateAdmin } = require('./auth');
const { getIO } = require('../socket');

/**
 * SQLite CURRENT_TIMESTAMP returns "YYYY-MM-DD HH:MM:SS" in UTC
 * without any timezone indicator. When the browser calls new Date() on
 * this string it treats it as LOCAL time on some engines (Chrome) —
 * causing a +7h offset error in Indonesia (WIB / UTC+7).
 *
 * Fix: append " UTC" so the spec forces UTC interpretation, then the
 * browser's Intl / Date engine converts it correctly to local time.
 */
function normalizeTimestamp(ts) {
  if (!ts) return ts;
  // Already has timezone info (ISO 8601 with Z or +HH:MM) → leave it
  if (ts.includes('Z') || ts.includes('+') || ts.includes('T')) return ts;
  return ts + ' UTC';
}

function normalizeOrder(order) {
  if (!order) return order;
  return {
    ...order,
    created_at: normalizeTimestamp(order.created_at),
    updated_at: normalizeTimestamp(order.updated_at),
  };
}

// Helper to format order number: e.g. "ORD-20261016-004"
function generateOrderNumber() {
  const now = new Date();
  const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '');
  const rand = Math.floor(100 + Math.random() * 900);
  return `ORD-${dateStr}-${rand}`;
}

// POST /api/orders - Customer places an order
router.post('/', (req, res) => {
  try {
    const { tableNumber, customerName, customerNotes, paymentMethod, items } = req.body;

    if (!tableNumber || !customerName || !items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ success: false, message: 'Data meja, nama pemesan, dan menu wajib diisi' });
    }

    const orderId = `ord_${crypto.randomUUID()}`;
    const orderNumber = generateOrderNumber();

    // Calculate subtotal from items in database to avoid client tampering
    let subtotal = 0;
    const validatedItems = [];

    const getItemStmt = db.prepare('SELECT id, name, price, is_available FROM menu_items WHERE id = ?');

    for (const item of items) {
      const dbItem = getItemStmt.get(item.id);
      if (!dbItem) {
        return res.status(400).json({ success: false, message: `Menu dengan ID ${item.id} tidak ditemukan` });
      }
      if (dbItem.is_available === 0) {
        return res.status(400).json({ success: false, message: `Menu "${dbItem.name}" saat ini sedang habis` });
      }

      const qty = Math.max(1, Number(item.quantity) || 1);
      const itemSubtotal = dbItem.price * qty;
      subtotal += itemSubtotal;

      validatedItems.push({
        id: `oi_${crypto.randomUUID().slice(0, 8)}`,
        menuItemId: dbItem.id,
        name: dbItem.name,
        price: dbItem.price,
        quantity: qty,
        notes: item.notes || '',
      });
    }

    const tax = Math.round(subtotal * 0.1); // 10% PB1 tax
    const totalAmount = subtotal + tax;

    // Use transaction for atomic write
    const insertTransaction = db.transaction(() => {
      const insertOrderStmt = db.prepare(`
        INSERT INTO orders (
          id, order_number, table_number, customer_name, customer_notes, 
          status, payment_method, payment_status, subtotal, tax, total_amount
        ) VALUES (?, ?, ?, ?, ?, 'PENDING', ?, 'UNPAID', ?, ?, ?)
      `);

      insertOrderStmt.run(
        orderId,
        orderNumber,
        tableNumber,
        customerName,
        customerNotes || '',
        paymentMethod || 'CASHIER',
        subtotal,
        tax,
        totalAmount
      );

      const insertOrderItemStmt = db.prepare(`
        INSERT INTO order_items (id, order_id, menu_item_id, item_name, item_price, quantity, notes)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `);

      for (const vItem of validatedItems) {
        insertOrderItemStmt.run(
          vItem.id,
          orderId,
          vItem.menuItemId,
          vItem.name,
          vItem.price,
          vItem.quantity,
          vItem.notes
        );
      }
    });

    insertTransaction();

    // Fetch the created full order object
    const rawOrder = db.prepare('SELECT * FROM orders WHERE id = ?').get(orderId);
    rawOrder.items = validatedItems;
    const createdOrder = normalizeOrder(rawOrder);

    // Real-time broadcast to Admin Kitchen & Cashier!
    try {
      const io = getIO();
      io.to('admin:room').emit('order:new', createdOrder);
      io.to(`table:${tableNumber}`).emit('order:created', createdOrder);
    } catch (e) {
      console.warn('[Socket Error]', e.message);
    }

    return res.status(201).json({
      success: true,
      message: 'Pesanan berhasil dibuat! Dapur sedang menyiapkan pesanan Anda.',
      data: createdOrder,
    });
  } catch (err) {
    console.error('Error creating order:', err);
    return res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/orders - Admin retrieves orders
router.get('/', authenticateAdmin, (req, res) => {
  try {
    const { status, limit = 50 } = req.query;
    let query = 'SELECT * FROM orders WHERE 1=1';
    const params = [];

    if (status && status !== 'ALL') {
      query += ' AND status = ?';
      params.push(status);
    }

    query += ' ORDER BY created_at DESC LIMIT ?';
    params.push(Number(limit));

    const orders = db.prepare(query).all(...params);

    const getItemsStmt = db.prepare('SELECT * FROM order_items WHERE order_id = ?');
    const fullOrders = orders.map((ord) =>
      normalizeOrder({ ...ord, items: getItemsStmt.all(ord.id) })
    );

    return res.json({ success: true, data: fullOrders });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/orders/:id - Customer or Admin single order tracking
router.get('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const order = db.prepare('SELECT * FROM orders WHERE id = ? OR order_number = ?').get(id, id);

    if (!order) {
      return res.status(404).json({ success: false, message: 'Pesanan tidak ditemukan' });
    }

    const items = db.prepare('SELECT * FROM order_items WHERE order_id = ?').all(order.id);
    order.items = items;

    return res.json({ success: true, data: normalizeOrder(order) });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// PATCH /api/orders/:id/status - Admin status progression
router.patch('/:id/status', authenticateAdmin, (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ['PENDING', 'CONFIRMED', 'PREPARING', 'READY', 'COMPLETED', 'CANCELLED'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: 'Status pesanan tidak valid' });
    }

    const order = db.prepare('SELECT * FROM orders WHERE id = ?').get(id);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Pesanan tidak ditemukan' });
    }

    db.prepare('UPDATE orders SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(status, id);

    const updatedOrder = normalizeOrder({
      ...db.prepare('SELECT * FROM orders WHERE id = ?').get(id),
      items: db.prepare('SELECT * FROM order_items WHERE order_id = ?').all(id),
    });

    // Real-time broadcast to user's order screen & admin room
    try {
      const io = getIO();
      io.to(`order:${id}`).emit('order:status_updated', updatedOrder);
      io.to(`table:${order.table_number}`).emit('order:status_updated', updatedOrder);
      io.to('admin:room').emit('order:status_updated', updatedOrder);
    } catch (e) {
      console.warn('[Socket Error]', e.message);
    }

    return res.json({
      success: true,
      message: `Status pesanan #${order.order_number} diperbarui menjadi ${status}`,
      data: updatedOrder,
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// PATCH /api/orders/:id/payment - Payment status updater
router.patch('/:id/payment', (req, res) => {
  try {
    const { id } = req.params;
    const { paymentStatus } = req.body;

    const order = db.prepare('SELECT * FROM orders WHERE id = ?').get(id);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Pesanan tidak ditemukan' });
    }

    db.prepare('UPDATE orders SET payment_status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(
      paymentStatus || 'PAID',
      id
    );

    const updated = normalizeOrder({
      ...db.prepare('SELECT * FROM orders WHERE id = ?').get(id),
      items: db.prepare('SELECT * FROM order_items WHERE order_id = ?').all(id),
    });

    try {
      const io = getIO();
      io.to(`order:${id}`).emit('order:payment_updated', updated);
      io.to('admin:room').emit('order:payment_updated', updated);
    } catch (_) {}

    return res.json({ success: true, message: 'Status pembayaran diperbarui', data: updated });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/orders/stats/summary - Admin Dashboard Analytics
router.get('/stats/summary', authenticateAdmin, (req, res) => {
  try {
    const today = new Date().toISOString().slice(0, 10);

    const totalRevenue = db.prepare(`
      SELECT COALESCE(SUM(total_amount), 0) as total 
      FROM orders 
      WHERE status != 'CANCELLED'
    `).get().total;

    const todayOrdersCount = db.prepare(`
      SELECT COUNT(*) as count 
      FROM orders 
      WHERE date(created_at) = date('now', 'localtime')
    `).get().count;

    const activeOrdersCount = db.prepare(`
      SELECT COUNT(*) as count 
      FROM orders 
      WHERE status IN ('PENDING', 'CONFIRMED', 'PREPARING', 'READY')
    `).get().count;

    const completedOrdersCount = db.prepare(`
      SELECT COUNT(*) as count 
      FROM orders 
      WHERE status = 'COMPLETED'
    `).get().count;

    const topItems = db.prepare(`
      SELECT item_name, SUM(quantity) as total_sold, SUM(item_price * quantity) as total_revenue
      FROM order_items oi
      JOIN orders o ON oi.order_id = o.id
      WHERE o.status != 'CANCELLED'
      GROUP BY item_name
      ORDER BY total_sold DESC
      LIMIT 5
    `).all();

    return res.json({
      success: true,
      data: {
        totalRevenue,
        todayOrdersCount,
        activeOrdersCount,
        completedOrdersCount,
        topItems,
      },
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
