const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const db = require('../db');
const { authenticateAdmin } = require('./auth');
const { getIO } = require('../socket');

// GET /api/menu/categories
router.get('/categories', (req, res) => {
  try {
    const categories = db.prepare(`
      SELECT c.*, COUNT(m.id) as item_count 
      FROM categories c
      LEFT JOIN menu_items m ON c.id = m.category_id
      GROUP BY c.id
      ORDER BY c.sort_order ASC
    `).all();

    return res.json({ success: true, data: categories });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/menu/categories (Admin)
router.post('/categories', authenticateAdmin, (req, res) => {
  try {
    const { name, sort_order } = req.body;
    if (!name) return res.status(400).json({ success: false, message: 'Nama kategori wajib diisi' });

    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    const id = `cat_${crypto.randomUUID().slice(0, 8)}`;

    db.prepare('INSERT INTO categories (id, name, slug, sort_order) VALUES (?, ?, ?, ?)').run(
      id,
      name,
      slug,
      sort_order || 0
    );

    return res.status(201).json({ success: true, message: 'Kategori berhasil ditambahkan', data: { id, name, slug } });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/menu/items
router.get('/items', (req, res) => {
  try {
    const { category, search, availableOnly } = req.query;
    let query = `
      SELECT m.*, c.name as category_name, c.slug as category_slug 
      FROM menu_items m
      JOIN categories c ON m.category_id = c.id
      WHERE 1=1
    `;
    const params = [];

    if (category && category !== 'all') {
      query += ` AND (c.slug = ? OR c.id = ?)`;
      params.push(category, category);
    }

    if (availableOnly === 'true') {
      query += ` AND m.is_available = 1`;
    }

    if (search) {
      query += ` AND (m.name LIKE ? OR m.description LIKE ?)`;
      params.push(`%${search}%`, `%${search}%`);
    }

    query += ` ORDER BY c.sort_order ASC, m.name ASC`;

    const items = db.prepare(query).all(...params);
    return res.json({ success: true, data: items });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/menu/items (Admin)
router.post('/items', authenticateAdmin, (req, res) => {
  try {
    const { category_id, name, description, price, image, prep_time, stock } = req.body;
    if (!category_id || !name || price === undefined) {
      return res.status(400).json({ success: false, message: 'Data nama, kategori, dan harga wajib diisi' });
    }

    const id = `item_${crypto.randomUUID().slice(0, 8)}`;
    const finalImage = image || 'https://images.unsplash.com/photo-1510707577719-ae7c14805e3a?w=600&auto=format&fit=crop&q=80';
    const parsedStock = stock !== undefined && stock !== null && stock !== '' ? Math.max(0, parseInt(stock, 10)) : null;
    const initialAvailable = parsedStock === 0 ? 0 : 1;

    db.prepare(`
      INSERT INTO menu_items (id, category_id, name, description, price, image, is_available, prep_time, stock)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(id, category_id, name, description || '', Number(price), finalImage, initialAvailable, Number(prep_time) || 15, parsedStock);

    const newItem = db.prepare(`
      SELECT m.*, c.name as category_name 
      FROM menu_items m 
      JOIN categories c ON m.category_id = c.id 
      WHERE m.id = ?
    `).get(id);

    // Real-time broadcast
    try {
      getIO().emit('menu:updated', newItem);
    } catch (_) {}

    return res.status(201).json({ success: true, message: 'Menu berhasil ditambahkan', data: newItem });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// PUT /api/menu/items/:id (Admin)
router.put('/items/:id', authenticateAdmin, (req, res) => {
  try {
    const { id } = req.params;
    const { category_id, name, description, price, image, is_available, prep_time, stock } = req.body;

    const existing = db.prepare('SELECT * FROM menu_items WHERE id = ?').get(id);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Menu tidak ditemukan' });
    }

    let parsedStock = existing.stock;
    if (stock !== undefined) {
      parsedStock = stock === '' || stock === null ? null : Math.max(0, parseInt(stock, 10));
    }

    let finalAvailable = is_available !== undefined ? (is_available ? 1 : 0) : existing.is_available;
    if (parsedStock === 0) {
      finalAvailable = 0; // Auto sold-out if stock hits 0
    }

    db.prepare(`
      UPDATE menu_items 
      SET category_id = COALESCE(?, category_id),
          name = COALESCE(?, name),
          description = COALESCE(?, description),
          price = COALESCE(?, price),
          image = COALESCE(?, image),
          is_available = ?,
          prep_time = COALESCE(?, prep_time),
          stock = ?,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(
      category_id,
      name,
      description,
      price !== undefined ? Number(price) : null,
      image,
      finalAvailable,
      prep_time !== undefined ? Number(prep_time) : null,
      parsedStock,
      id
    );

    const updated = db.prepare(`
      SELECT m.*, c.name as category_name 
      FROM menu_items m 
      JOIN categories c ON m.category_id = c.id 
      WHERE m.id = ?
    `).get(id);

    try {
      getIO().emit('menu:updated', updated);
    } catch (_) {}

    return res.json({ success: true, message: 'Menu berhasil diperbarui', data: updated });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// PATCH /api/menu/items/:id/toggle (Admin quick stock toggle)
router.patch('/items/:id/toggle', authenticateAdmin, (req, res) => {
  try {
    const { id } = req.params;
    const item = db.prepare('SELECT * FROM menu_items WHERE id = ?').get(id);
    if (!item) {
      return res.status(404).json({ success: false, message: 'Menu tidak ditemukan' });
    }

    const newStatus = item.is_available === 1 ? 0 : 1;
    db.prepare('UPDATE menu_items SET is_available = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(newStatus, id);

    // Notify all active clients in real-time
    try {
      getIO().emit('menu:availability_changed', { id, is_available: newStatus });
    } catch (_) {}

    return res.json({
      success: true,
      message: `Status menu diubah menjadi ${newStatus === 1 ? 'Tersedia' : 'Habis'}`,
      data: { id, is_available: newStatus },
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// DELETE /api/menu/items/:id (Admin)
router.delete('/items/:id', authenticateAdmin, (req, res) => {
  try {
    const { id } = req.params;
    const item = db.prepare('SELECT * FROM menu_items WHERE id = ?').get(id);
    if (!item) {
      return res.status(404).json({ success: false, message: 'Menu tidak ditemukan' });
    }

    db.prepare('DELETE FROM menu_items WHERE id = ?').run(id);

    try {
      getIO().emit('menu:deleted', { id });
    } catch (_) {}

    return res.json({ success: true, message: 'Menu berhasil dihapus' });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
