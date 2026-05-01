import express from "express";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";
import axios from "axios";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import db from "./src/db";
console.log("Database module imported successfully");

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || "super-secret-key";

if (!process.env.VITE_RAYNA_API_TOKEN) {
  console.warn("WARNING: VITE_RAYNA_API_TOKEN is not set in .env or Secrets!");
} else {
  console.log("API Token loaded successfully (length: " + process.env.VITE_RAYNA_API_TOKEN.length + ")");
}

const app = express();
const PORT = 3000;
const BASE_URL = 'https://sandbox.raynatours.com';
 
app.use(express.json());

// ============================================================
// CACHE SYSTEM
// ============================================================
interface CacheEntry { data: any; expiresAt: number; }
const cache = new Map<string, CacheEntry>();

const CACHE_TTL = {
  FOREVER:  365 * 24 * 60 * 60 * 1000,
  LONG:       6 * 60 * 60 * 1000,
  MEDIUM:     1 * 60 * 60 * 1000,
};

const getCache = (key: string) => {
  const entry = cache.get(key);
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) { cache.delete(key); return null; }
  return entry.data;
};

const setCache = (key: string, data: any, ttl: number) => {
  cache.set(key, { data, expiresAt: Date.now() + ttl });
};

const cachedProxyRequest = async (endpoint: string, method: 'get' | 'post', body: any, res: express.Response, ttl: number) => {
  const cacheKey = `${endpoint}::${JSON.stringify(body)}`;
  const cached = getCache(cacheKey);
  if (cached) {
    console.log(`[CACHE HIT] ${endpoint}`);
    return res.json(cached);
  }
  console.log(`[CACHE MISS] ${endpoint} — fetching from Rayna...`);
  try {
    const config: any = {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.VITE_RAYNA_API_TOKEN}`
      }
    };
    const response = method === 'get'
      ? await axios.get(`${BASE_URL}${endpoint}`, config)
      : await axios.post(`${BASE_URL}${endpoint}`, body, config);
    setCache(cacheKey, response.data, ttl);
    res.json(response.data);
  } catch (error: any) {
    console.error(`Proxy error (${endpoint}):`, error.message);
    if (error.response) res.status(error.response.status).json(error.response.data);
    else res.status(500).json({ error: `Failed to fetch from Rayna: ${endpoint}` });
  }
};

app.get("/api/cache/clear", (req, res) => {
  const { key, endpoint } = req.query as { key?: string; endpoint?: string };
  const secretKey = process.env.CACHE_CLEAR_KEY || 'saurav123';
  if (key !== secretKey) return res.status(403).json({ error: 'Invalid key' });
  if (endpoint) {
    let cleared = 0;
    cache.forEach((_, k) => { if (k.startsWith(endpoint as string)) { cache.delete(k); cleared++; } });
    return res.json({ success: true, message: `Cleared ${cleared} entries for ${endpoint}` });
  }
  const size = cache.size;
  cache.clear();
  return res.json({ success: true, message: `Cleared all ${size} cache entries` });
});

app.get("/api/cache/status", (req, res) => {
  const { key } = req.query as { key?: string };
  const secretKey = process.env.CACHE_CLEAR_KEY || 'saurav123';
  if (key !== secretKey) return res.status(403).json({ error: 'Invalid key' });
  const entries: any[] = [];
  cache.forEach((val, k) => {
    entries.push({ key: k.split('::')[0], expiresIn: Math.round((val.expiresAt - Date.now()) / 1000 / 60) + ' mins' });
  });
  res.json({ totalEntries: cache.size, entries });
});
// ============================================================

app.get("/api/health", (req, res) => {
  try {
    const userCount = db.prepare("SELECT COUNT(*) as count FROM users").get() as any;
    const bookingCount = db.prepare("SELECT COUNT(*) as count FROM bookings").get() as any;
    res.json({ 
      status: "ok", 
      database: "connected", 
      users: userCount.count, 
      bookings: bookingCount.count,
      env: process.env.NODE_ENV
    });
  } catch (error: any) {
    res.status(500).json({ status: "error", database: error.message });
  }
});
  
// Helper for proxying requests
const proxyRequest = async (endpoint: string, method: 'get' | 'post', body: any, res: express.Response) => {
  console.log(`Proxying ${method.toUpperCase()} request to ${endpoint}...`, body);
  try {
    const config: any = {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.VITE_RAYNA_API_TOKEN}`
      }
    };

    let response;
    if (method === 'get') {
      response = await axios.get(`${BASE_URL}${endpoint}`, config);
    } else {
      response = await axios.post(`${BASE_URL}${endpoint}`, body, config);
    }

    console.log(`Rayna Tours ${endpoint} response status:`, response.status);
    res.json(response.data);
  } catch (error: any) {
    console.error(`Proxy error (${endpoint}):`, error.message);
    if (error.response) {
      res.status(error.response.status).json(error.response.data);
    } else {
      res.status(500).json({ error: `Failed to fetch from Rayna: ${endpoint}` });
    }
  }
};

// --- Auth Endpoints ---

app.post("/api/auth/register", (req, res) => {
  const { email, password, name, companyName, agentName } = req.body;
  console.log(`Registration attempt for: ${email}`);
  try {
    const hashedPassword = bcrypt.hashSync(password, 10);
    const stmt = db.prepare("INSERT INTO users (email, password, name, company_name, agent_name) VALUES (?, ?, ?, ?, ?)");
    const info = stmt.run(email, hashedPassword, name || agentName, companyName, agentName);
    console.log(`User registered successfully: ${email}, ID: ${info.lastInsertRowid}`);
    res.json({ success: true, message: "Account created successfully! Please log in." });
  } catch (error: any) {
    console.error(`Registration error for ${email}:`, error.message);
    if (error.message.includes("UNIQUE constraint failed")) {
      res.status(400).json({ error: "Email already exists" });
    } else {
      res.status(500).json({ error: "Registration failed: " + error.message });
    }
  }
});

app.post("/api/auth/login", (req, res) => {
  const { email, password } = req.body;
  console.log(`Login attempt for: ${email}`);
  try {
    const user = db.prepare("SELECT * FROM users WHERE email = ?").get(email) as any;
    if (!user) {
      console.log(`Login failed: User not found - ${email}`);
      return res.status(401).json({ error: "Invalid credentials" });
    }
    if (!bcrypt.compareSync(password, user.password)) {
      console.log(`Login failed: Incorrect password for - ${email}`);
      return res.status(401).json({ error: "Invalid credentials" });
    }
    console.log(`Login successful: ${email}`);
    const token = jwt.sign({ 
      id: user.id, 
      email: user.email, 
      name: user.name,
      companyName: user.company_name,
      agentName: user.agent_name,
      logoUrl: user.logo_url
    }, JWT_SECRET);
    res.json({ 
      token, 
      user: { 
        id: user.id, 
        email: user.email, 
        name: user.name,
        companyName: user.company_name,
        agentName: user.agent_name,
        logoUrl: user.logo_url
      } 
    });
  } catch (error: any) {
    console.error(`Login error for ${email}:`, error.message);
    res.status(500).json({ error: "Login failed: " + error.message });
  }
});

app.get("/api/auth/me", (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: "No token" });
  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    const user = db.prepare("SELECT id, email, name, company_name, agent_name, logo_url FROM users WHERE id = ?").get(decoded.id) as any;
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json({ 
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        companyName: user.company_name,
        agentName: user.agent_name,
        logoUrl: user.logo_url
      } 
    });
  } catch (error) {
    res.status(401).json({ error: "Invalid token" });
  }
});

app.post("/api/auth/update-profile", (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: "No token" });
  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    const { companyName, agentName, logoUrl } = req.body;
    
    const stmt = db.prepare("UPDATE users SET company_name = ?, agent_name = ?, logo_url = ? WHERE id = ?");
    stmt.run(companyName, agentName, logoUrl, decoded.id);
    
    res.json({ success: true });
  } catch (error) {
    res.status(401).json({ error: "Invalid token" });
  }
});

app.post("/api/auth/change-password", (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: "No token" });
  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    const { currentPassword, newPassword } = req.body;
    const user = db.prepare("SELECT * FROM users WHERE id = ?").get(decoded.id) as any;
    if (!user) return res.status(404).json({ error: "User not found" });
    if (!bcrypt.compareSync(currentPassword, user.password)) {
      return res.status(400).json({ error: "Current password is incorrect" });
    }
    const hashedPassword = bcrypt.hashSync(newPassword, 10);
    db.prepare("UPDATE users SET password = ? WHERE id = ?").run(hashedPassword, decoded.id);
    res.json({ success: true });
  } catch (error) {
    res.status(401).json({ error: "Invalid token" });
  }
});

// --- Tour Endpoints ---

app.post("/api/tour-policy", (req, res) => proxyRequest('/api/Tour/policy', 'post', req.body, res));
app.get("/api/countries", (req, res) => proxyRequest('/api/Tour/countries', 'get', null, res));
app.post("/api/cities", (req, res) => proxyRequest('/api/Tour/cities', 'post', req.body, res));
app.post("/api/tours", (req, res) => proxyRequest('/api/Tour/tourstaticdata', 'post', req.body, res));
app.post("/api/tour-details", (req, res) => proxyRequest('/api/Tour/tourStaticDataById', 'post', req.body, res));
app.post("/api/tour-options-static", (req, res) => proxyRequest('/api/Tour/touroptionstaticdata', 'post', req.body, res));
app.post("/api/tour-prices", (req, res) => proxyRequest('/api/Tour/tourlist', 'post', req.body, res));
app.post("/api/tour-options", (req, res) => proxyRequest('/api/Tour/touroption', 'post', req.body, res));
app.post("/api/tour-timeslots", (req, res) => proxyRequest('/api/Tour/timeslot', 'post', req.body, res));
app.post("/api/tour-availability", (req, res) => proxyRequest('/api/Tour/availability', 'post', req.body, res));

// --- Booking Endpoints ---

app.post("/api/bookings", async (req, res) => {
  // Separate Rayna payload from local metadata
  const { localDetails, ...raynaPayload } = req.body;
  
  console.log(`Proxying POST request to /api/Booking/bookings...`, raynaPayload);
  try {
    const config = {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.VITE_RAYNA_API_TOKEN}`
      }
    };

    const response = await axios.post(`${BASE_URL}/api/Booking/bookings`, raynaPayload, config);
    console.log(`Rayna Booking Response Status: ${response.status}`);
    console.log(`Rayna Booking Response Data:`, JSON.stringify(response.data, null, 2));
    
    // If successful, save locally if user is logged in
    const authHeader = req.headers.authorization;
    const bookingId = response.data?.result?.details?.[0]?.bookingId || response.data?.bookingId;
    const referenceNo = response.data?.result?.referenceNo || response.data?.referenceNo;
    
    if (authHeader && response.data && bookingId) {
      const token = authHeader.split(" ")[1];
      try {
        const decoded = jwt.verify(token, JWT_SECRET) as any;
        const { tourName, optionName, tourId, travelDate, totalAmount, paxDetails } = localDetails || {};
        
        const stmt = db.prepare(`
          INSERT INTO bookings (user_id, rayna_booking_id, reference_no, tour_name, option_name, tour_id, booking_date, travel_date, total_amount, status, pax_details)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);
        
        stmt.run(
          decoded.id,
          bookingId.toString(),
          referenceNo || "",
          tourName || "Unknown Tour",
          optionName || "Standard",
          tourId || 0,
          new Date().toISOString(),
          travelDate || "Unknown",
          totalAmount || 0,
          "Confirmed",
          JSON.stringify(paxDetails || {})
        );
        console.log(`Local booking saved for user ${decoded.id}, bookingId: ${bookingId}`);
      } catch (e: any) {
        console.error("Failed to save local booking:", e.message);
      }
    }

    res.json(response.data);
  } catch (error: any) {
    console.error(`Proxy error (/api/Booking/bookings):`, error.message);
    if (error.response) {
      res.status(error.response.status).json(error.response.data);
    } else {
      res.status(500).json({ error: `Failed to fetch from Rayna: /api/Booking/bookings` });
    }
  }
});

app.get("/api/my-bookings", (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: "No token" });
  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    const bookings = db.prepare("SELECT * FROM bookings WHERE user_id = ? ORDER BY created_at DESC").all(decoded.id);
    res.json(bookings);
  } catch (error) {
    res.status(401).json({ error: "Invalid token" });
  }
});

app.post("/api/get-tickets", (req, res) => proxyRequest('/api/Booking/GetBookedTickets', 'post', req.body, res));
app.post("/api/cancel-booking", async (req, res) => {
  const { bookingId } = req.body;
  const authHeader = req.headers.authorization;
  
  console.log(`Proxying POST request to /api/Booking/cancelbooking...`, req.body);
  try {
    const config = {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.VITE_RAYNA_API_TOKEN}`
      }
    };

    const response = await axios.post(`${BASE_URL}/api/Booking/cancelbooking`, req.body, config);
    
    // If successful, update local DB status
    if (response.data.statuscode === 200 && response.data.result?.status === 1) {
      if (authHeader) {
        const token = authHeader.split(" ")[1];
        try {
          const decoded = jwt.verify(token, JWT_SECRET) as any;
          const stmt = db.prepare("UPDATE bookings SET status = 'Cancelled' WHERE rayna_booking_id = ? AND user_id = ?");
          stmt.run(bookingId.toString(), decoded.id);
          console.log(`Local booking status updated to Cancelled for bookingId: ${bookingId}`);
        } catch (e: any) {
          console.error("Failed to update local booking status:", e.message);
        }
      }
    }
    
    res.json(response.data);
  } catch (error: any) {
    console.error(`Proxy error (/api/Booking/cancelbooking):`, error.message);
    if (error.response) {
      res.status(error.response.status).json(error.response.data);
    } else {
      res.status(500).json({ error: `Failed to fetch from Rayna: /api/Booking/cancelbooking` });
    }
  }
});

async function setupVite() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // Production static serving
    app.use(express.static("dist"));
    app.get("*", (req, res) => {
      res.sendFile("dist/index.html", { root: "." });
    });
  }
}

// Only run listen if not on Vercel
if (process.env.NODE_ENV !== "production" || !process.env.VERCEL) {
  setupVite().then(() => {
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  });
} else {
  // On Vercel, we just need the routes, Vite is handled by static build
}

export default app;
