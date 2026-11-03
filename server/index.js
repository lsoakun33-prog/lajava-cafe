const express = require('express');
const http = require('http');
const path = require('path');
const cors = require('cors');
require('dotenv').config();

// Ensure DB is initialized
require('./db');

const { initSocket } = require('./socket');
const { router: authRouter } = require('./routes/auth');
const menuRouter = require('./routes/menu');
const tablesRouter = require('./routes/tables');
const ordersRouter = require('./routes/orders');

const app = express();
const server = http.createServer(app);

// Initialize WebSockets
const io = initSocket(server);

// Middleware
app.use(cors({ origin: '*' }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/images', express.static(path.join(__dirname, '..', 'client', 'public', 'images')));

// API Routes
app.use('/api/auth', authRouter);
app.use('/api/menu', menuRouter);
app.use('/api/tables', tablesRouter);
app.use('/api/orders', ordersRouter);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    timestamp: new Date().toISOString(),
    service: 'La Java Cafe & Resto — Real-Time Self Order Engine',
  });
});

// Serve frontend in production if built
const clientDist = path.join(__dirname, '..', 'client', 'dist');
const fs = require('fs');
if (fs.existsSync(clientDist)) {
  app.use(express.static(clientDist));
  app.use((req, res) => {
    res.sendFile(path.join(clientDist, 'index.html'));
  });
}

const PORT = process.env.PORT || 5000;
server.listen(PORT, '0.0.0.0', () => {
  console.log('========================================================');
  console.log(`🚀 LA JAVA CAFE & RESTO SERVER RUNNING AT: http://localhost:${PORT}`);
  console.log(`📡 Socket.IO Real-Time Engine Active`);
  console.log(`🔐 Admin credentials: username="admin" | password="admin123"`);
  console.log('========================================================');
});
