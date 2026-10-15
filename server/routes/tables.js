const express = require('express');
const router = express.Router();
const QRCode = require('qrcode');
const crypto = require('crypto');
const db = require('../db');
const { authenticateAdmin } = require('./auth');

// Helper to generate QR Data URL
async function generateTableQRCode(tableNumber, clientBaseUrl) {
  // Encodes customer direct order URL: e.g. http://localhost:5173/?table=Meja%2001
  const targetUrl = `${clientBaseUrl}/?table=${encodeURIComponent(tableNumber)}`;
  const qrDataUrl = await QRCode.toDataURL(targetUrl, {
    width: 400,
    margin: 2,
    color: {
      dark: '#000000',
      light: '#ffffff',
    },
  });
  return { targetUrl, qrDataUrl };
}

// GET /api/tables - Public or Admin list of tables
router.get('/', async (req, res) => {
  try {
    const clientBaseUrl = process.env.CLIENT_URL || `http://${req.hostname}:5173`;
    const tables = db.prepare(`
      SELECT t.*, 
        (SELECT COUNT(*) FROM orders o WHERE o.table_number = t.table_number AND o.status NOT IN ('COMPLETED', 'CANCELLED')) as active_orders
      FROM tables t
      ORDER BY t.table_number ASC
    `).all();

    // Attach QR code data to each table
    const tablesWithQR = await Promise.all(
      tables.map(async (tbl) => {
        const { targetUrl, qrDataUrl } = await generateTableQRCode(tbl.table_number, clientBaseUrl);
        return {
          ...tbl,
          orderUrl: targetUrl,
          qrCodeImage: qrDataUrl,
        };
      })
    );

    return res.json({ success: true, data: tablesWithQR });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/tables (Admin)
router.post('/', authenticateAdmin, async (req, res) => {
  try {
    const { table_number, capacity } = req.body;
    if (!table_number) {
      return res.status(400).json({ success: false, message: 'Nomor meja wajib diisi' });
    }

    const existing = db.prepare('SELECT * FROM tables WHERE table_number = ?').get(table_number);
    if (existing) {
      return res.status(400).json({ success: false, message: 'Nomor meja sudah terdaftar' });
    }

    const id = `tbl_${crypto.randomUUID().slice(0, 8)}`;
    const qrToken = `qr_${crypto.randomUUID().slice(0, 12)}`;

    db.prepare('INSERT INTO tables (id, table_number, capacity, qr_token) VALUES (?, ?, ?, ?)').run(
      id,
      table_number,
      capacity ? Number(capacity) : 4,
      qrToken
    );

    const clientBaseUrl = process.env.CLIENT_URL || `http://${req.hostname}:5173`;
    const { targetUrl, qrDataUrl } = await generateTableQRCode(table_number, clientBaseUrl);

    return res.status(201).json({
      success: true,
      message: 'Meja berhasil ditambahkan',
      data: {
        id,
        table_number,
        capacity: capacity ? Number(capacity) : 4,
        status: 'AVAILABLE',
        orderUrl: targetUrl,
        qrCodeImage: qrDataUrl,
      },
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// DELETE /api/tables/:id (Admin)
router.delete('/:id', authenticateAdmin, (req, res) => {
  try {
    const { id } = req.params;
    db.prepare('DELETE FROM tables WHERE id = ?').run(id);
    return res.json({ success: true, message: 'Meja berhasil dihapus' });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
