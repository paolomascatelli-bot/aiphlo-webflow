/* =========================================
   AIPHLO MASTER API
   The brain that feeds content to templates
   ========================================= */

const express = require('express');
const cors = require('cors');
const path = require('path');
const app = express();

app.use(cors());
app.use(express.json());

// Serve downloaded images from assets folder
app.use('/assets', express.static(path.join(__dirname, '../assets')));

// Serve template files
app.use('/template', express.static(path.join(__dirname, '../template')));

// Serve Webflow integration files
app.use('/webflow', express.static(path.join(__dirname, '../webflow-code')));

// =========================================
// CONTENT DATABASE (will connect to real DB later)
// For now, content lives here
// =========================================

const SITES = {
  'aiphlo-demo': {
    name: 'AiPhlo Demo',
    pages: {
      '/': require('./content/home.json'),
      '/home': require('./content/home.json'),
      '/projects': require('./content/projects.json'),
      '/photography': require('./content/photography.json'),
      '/socialmedia': require('./content/socialmedia.json'),
      '/faqs': require('./content/faqs.json'),
      '/contact': require('./content/contact.json'),
      '/aiphlo': require('./content/aiphlo.json')
    }
  }
};

// =========================================
// MAIN ENDPOINT - Template calls this
// =========================================

app.post('/v1/populate', (req, res) => {
  const { site_key, page } = req.body;

  // Validate
  if (!site_key) {
    return res.status(400).json({ error: 'Missing site_key' });
  }

  // Find site
  const site = SITES[site_key];
  if (!site) {
    return res.status(404).json({ error: 'Site not found' });
  }

  // Find page content
  const pageContent = site.pages[page] || site.pages['/'];
  if (!pageContent) {
    return res.status(404).json({ error: 'Page not found' });
  }

  // Return blocks
  console.log(`[API] Serving ${site_key} → ${page}`);
  res.json(pageContent);
});

// =========================================
// EXTRACTION API - Console script delivery & data upload
// =========================================

const fs = require('fs');
const extractorScript = fs.readFileSync(
  path.join(__dirname, 'extract/console-extractor.js'),
  'utf-8'
);

// Serve the extractor script (user copies to console)
app.get('/v1/extract/script', (req, res) => {
  res.set('Content-Type', 'text/javascript');
  console.log(`[API] Serving console extractor script`);
  res.send(extractorScript);
});

// Serve as downloadable file
app.get('/v1/extract/script.js', (req, res) => {
  res.set('Content-Type', 'text/javascript');
  res.set('Content-Disposition', 'attachment; filename="aiphlo-extractor.js"');
  console.log(`[API] Download: console extractor script`);
  res.send(extractorScript);
});

// Receive extracted data from user
app.post('/v1/extract/upload', (req, res) => {
  const { site, pages, extractedAt } = req.body;

  if (!site || !pages) {
    return res.status(400).json({ error: 'Missing site or pages data' });
  }

  // Save to extractions folder
  const extractDir = path.join(__dirname, 'extractions');
  if (!fs.existsSync(extractDir)) {
    fs.mkdirSync(extractDir, { recursive: true });
  }

  const siteSlug = site.replace(/[^a-z0-9]/gi, '-').toLowerCase();
  const timestamp = new Date().toISOString().split('T')[0];
  const filename = `${siteSlug}-${timestamp}.json`;
  const filepath = path.join(extractDir, filename);

  fs.writeFileSync(filepath, JSON.stringify(req.body, null, 2));

  console.log(`[API] Saved extraction: ${filename} (${pages.length} pages)`);

  res.json({
    success: true,
    message: 'Extraction saved',
    filename: filename,
    pagesReceived: pages.length,
    totalImages: pages.reduce((sum, p) => sum + (p.images?.length || 0), 0),
    totalVideos: pages.reduce((sum, p) => sum + (p.videos?.length || 0), 0)
  });
});

// List saved extractions
app.get('/v1/extract/list', (req, res) => {
  const extractDir = path.join(__dirname, 'extractions');
  if (!fs.existsSync(extractDir)) {
    return res.json({ extractions: [] });
  }

  const files = fs.readdirSync(extractDir)
    .filter(f => f.endsWith('.json'))
    .map(f => {
      const stats = fs.statSync(path.join(extractDir, f));
      return {
        filename: f,
        size: stats.size,
        created: stats.birthtime
      };
    })
    .sort((a, b) => new Date(b.created) - new Date(a.created));

  res.json({ extractions: files });
});

// Get specific extraction
app.get('/v1/extract/:filename', (req, res) => {
  const filepath = path.join(__dirname, 'extractions', req.params.filename);
  if (!fs.existsSync(filepath)) {
    return res.status(404).json({ error: 'Extraction not found' });
  }

  const data = JSON.parse(fs.readFileSync(filepath, 'utf-8'));
  res.json(data);
});

// =========================================
// SHOPPING CART & ORDERS API
// =========================================

// Product catalog (loaded from aiphlo.json)
const getProducts = () => {
  const aiphloContent = require('./content/aiphlo.json');
  return aiphloContent.cart?.products || {};
};

// In-memory cart storage (keyed by session ID)
const carts = {};

// Orders storage
const ordersDir = path.join(__dirname, 'orders');
if (!fs.existsSync(ordersDir)) {
  fs.mkdirSync(ordersDir, { recursive: true });
}

// Helper to get/create cart
const getCart = (sessionId) => {
  if (!carts[sessionId]) {
    carts[sessionId] = { items: [], createdAt: new Date().toISOString() };
  }
  return carts[sessionId];
};

// Get available products
app.get('/v1/cart/products', (req, res) => {
  const products = getProducts();
  console.log(`[CART] Products requested`);
  res.json({ products });
});

// Get cart
app.get('/v1/cart', (req, res) => {
  const sessionId = req.headers['x-session-id'] || 'default';
  const cart = getCart(sessionId);
  const products = getProducts();

  // Calculate totals
  let subtotal = 0;
  const itemsWithDetails = cart.items.map(item => {
    const product = products[item.productId];
    if (product) {
      subtotal += product.price * item.quantity;
      return { ...item, product };
    }
    return item;
  });

  res.json({
    sessionId,
    items: itemsWithDetails,
    subtotal: subtotal.toFixed(2),
    itemCount: cart.items.reduce((sum, i) => sum + i.quantity, 0)
  });
});

// Add to cart
app.post('/v1/cart/add', (req, res) => {
  const sessionId = req.headers['x-session-id'] || 'default';
  const { productId, quantity = 1 } = req.body;

  const products = getProducts();
  if (!products[productId]) {
    return res.status(400).json({ error: 'Product not found' });
  }

  const cart = getCart(sessionId);
  const existingItem = cart.items.find(i => i.productId === productId);

  if (existingItem) {
    existingItem.quantity += quantity;
  } else {
    cart.items.push({ productId, quantity, addedAt: new Date().toISOString() });
  }

  console.log(`[CART] Added ${productId} x${quantity} to cart ${sessionId}`);
  res.json({ success: true, cart: getCart(sessionId) });
});

// Remove from cart
app.post('/v1/cart/remove', (req, res) => {
  const sessionId = req.headers['x-session-id'] || 'default';
  const { productId } = req.body;

  const cart = getCart(sessionId);
  cart.items = cart.items.filter(i => i.productId !== productId);

  console.log(`[CART] Removed ${productId} from cart ${sessionId}`);
  res.json({ success: true, cart });
});

// Clear cart
app.post('/v1/cart/clear', (req, res) => {
  const sessionId = req.headers['x-session-id'] || 'default';
  carts[sessionId] = { items: [], createdAt: new Date().toISOString() };

  console.log(`[CART] Cleared cart ${sessionId}`);
  res.json({ success: true });
});

// Checkout (create order)
app.post('/v1/cart/checkout', (req, res) => {
  const sessionId = req.headers['x-session-id'] || 'default';
  const { customer } = req.body;

  if (!customer || !customer.email) {
    return res.status(400).json({ error: 'Customer email required' });
  }

  const cart = getCart(sessionId);
  if (cart.items.length === 0) {
    return res.status(400).json({ error: 'Cart is empty' });
  }

  const products = getProducts();
  let subtotal = 0;
  const orderItems = cart.items.map(item => {
    const product = products[item.productId];
    subtotal += product.price * item.quantity;
    return {
      productId: item.productId,
      name: product.name,
      price: product.price,
      quantity: item.quantity,
      type: product.type
    };
  });

  // Generate order ID
  const orderId = `AIPH-${Date.now().toString(36).toUpperCase()}`;

  const order = {
    id: orderId,
    customer,
    items: orderItems,
    subtotal: subtotal.toFixed(2),
    status: 'pending',
    createdAt: new Date().toISOString(),
    sessionId
  };

  // Save order
  const orderPath = path.join(ordersDir, `${orderId}.json`);
  fs.writeFileSync(orderPath, JSON.stringify(order, null, 2));

  // Clear cart
  carts[sessionId] = { items: [], createdAt: new Date().toISOString() };

  console.log(`[ORDER] Created order ${orderId} for ${customer.email} - $${subtotal.toFixed(2)}`);

  res.json({
    success: true,
    order,
    message: 'Order created successfully'
  });
});

// List orders
app.get('/v1/orders', (req, res) => {
  const files = fs.readdirSync(ordersDir)
    .filter(f => f.endsWith('.json'))
    .map(f => {
      const data = JSON.parse(fs.readFileSync(path.join(ordersDir, f), 'utf-8'));
      return {
        id: data.id,
        customer: data.customer?.email,
        subtotal: data.subtotal,
        status: data.status,
        createdAt: data.createdAt,
        itemCount: data.items?.length || 0
      };
    })
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  console.log(`[ORDERS] Listed ${files.length} orders`);
  res.json({ orders: files });
});

// Get specific order
app.get('/v1/orders/:id', (req, res) => {
  const orderPath = path.join(ordersDir, `${req.params.id}.json`);
  if (!fs.existsSync(orderPath)) {
    return res.status(404).json({ error: 'Order not found' });
  }

  const order = JSON.parse(fs.readFileSync(orderPath, 'utf-8'));
  res.json({ order });
});

// Update order status
app.patch('/v1/orders/:id', (req, res) => {
  const orderPath = path.join(ordersDir, `${req.params.id}.json`);
  if (!fs.existsSync(orderPath)) {
    return res.status(404).json({ error: 'Order not found' });
  }

  const order = JSON.parse(fs.readFileSync(orderPath, 'utf-8'));
  const { status, notes } = req.body;

  if (status) order.status = status;
  if (notes) order.notes = notes;
  order.updatedAt = new Date().toISOString();

  fs.writeFileSync(orderPath, JSON.stringify(order, null, 2));

  console.log(`[ORDER] Updated ${req.params.id} - status: ${status}`);
  res.json({ success: true, order });
});

// =========================================
// HEALTH CHECK
// =========================================

app.get('/health', (req, res) => {
  res.json({ status: 'ok', version: '1.1.0' });
});

// =========================================
// SPA CATCH-ALL ROUTES
// Serve the template for all page routes
// =========================================

const pageRoutes = ['/', '/home', '/projects', '/photography', '/socialmedia', '/faqs', '/contact', '/aiphlo'];

pageRoutes.forEach(route => {
  app.get(route, (req, res) => {
    res.set('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.set('Pragma', 'no-cache');
    res.set('Expires', '0');
    res.sendFile(path.join(__dirname, '../template/accurate.html'));
  });
});

// =========================================
// START SERVER
// =========================================

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`\n🚀 AiPhlo API running on http://localhost:${PORT}`);
  console.log(`\n   Content API:`);
  console.log(`   POST /v1/populate          - Get page content`);
  console.log(`\n   Extraction API:`);
  console.log(`   GET  /v1/extract/script    - Get console extractor script`);
  console.log(`   POST /v1/extract/upload    - Upload extracted data`);
  console.log(`   GET  /v1/extract/list      - List saved extractions`);
  console.log(`\n   Shopping Cart API:`);
  console.log(`   GET  /v1/cart/products     - Get product catalog`);
  console.log(`   GET  /v1/cart              - Get current cart`);
  console.log(`   POST /v1/cart/add          - Add item to cart`);
  console.log(`   POST /v1/cart/remove       - Remove item from cart`);
  console.log(`   POST /v1/cart/checkout     - Create order`);
  console.log(`\n   Orders API:`);
  console.log(`   GET  /v1/orders            - List all orders`);
  console.log(`   GET  /v1/orders/:id        - Get order details`);
  console.log(`   PATCH /v1/orders/:id       - Update order status`);
  console.log(`\n   GET  /health               - Health check\n`);
});
