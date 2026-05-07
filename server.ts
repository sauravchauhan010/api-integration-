import express from "express";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";
import axios from "axios";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import mongoose, { Schema, Document } from "mongoose";

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || "super-secret-key";
const MONGODB_URI = process.env.MONGODB_URI || "mongodb+srv://saurav1802:saurav1802@luxbag.d9rids7.mongodb.net/raynaapi?appName=luxbag";

// ============================================================
// MONGODB CONNECTION
// ============================================================
mongoose.connect(MONGODB_URI)
  .then(() => console.log("✅ MongoDB connected successfully"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

// USER SCHEMA
interface IUser extends Document {
  email: string;
  password: string;
  name: string;
  companyName: string;
  agentName: string;
  logoUrl: string;
  createdAt: Date;
}

const UserSchema = new Schema<IUser>({
  email:       { type: String, required: true, unique: true },
  password:    { type: String, required: true },
  name:        { type: String, default: "" },
  companyName: { type: String, default: "" },
  agentName:   { type: String, default: "" },
  logoUrl:     { type: String, default: "" },
  createdAt:   { type: Date, default: Date.now },
});
const User = mongoose.model<IUser>("User", UserSchema);

// BOOKING SCHEMA
interface IBooking extends Document {
  userId: string;
  raynaBookingId: string;
  referenceNo: string;
  tourName: string;
  optionName: string;
  tourId: number;
  bookingDate: Date;
  travelDate: string;
  totalAmount: number;
  status: string;
  paxDetails: object;
  createdAt: Date;
}

const BookingSchema = new Schema<IBooking>({
  userId:         { type: String, required: true },
  raynaBookingId: { type: String, required: true },
  referenceNo:    { type: String, default: "" },
  tourName:       { type: String, default: "" },
  optionName:     { type: String, default: "" },
  tourId:         { type: Number, default: 0 },
  bookingDate:    { type: Date, default: Date.now },
  travelDate:     { type: String, default: "" },
  totalAmount:    { type: Number, default: 0 },
  status:         { type: String, default: "Confirmed" },
  paxDetails:     { type: Object, default: {} },
  createdAt:      { type: Date, default: Date.now },
});
const Booking = mongoose.model<IBooking>("Booking", BookingSchema);
// ============================================================

if (!process.env.VITE_RAYNA_API_TOKEN) {
  console.warn("WARNING: VITE_RAYNA_API_TOKEN is not set!");
} else {
  console.log("API Token loaded (length: " + process.env.VITE_RAYNA_API_TOKEN.length + ")");
}

const app = express();
const PORT = 3000;
const BASE_URL = 'https://activities.raynatours.com';

app.use(express.json());

// ============================================================
// CACHE SYSTEM
// ============================================================
interface CacheEntry { data: any; expiresAt: number; }
const cache = new Map<string, CacheEntry>();

const CACHE_TTL = {
  FOREVER: 365 * 24 * 60 * 60 * 1000,
  LONG:      6 * 60 * 60 * 1000,
  MEDIUM:    1 * 60 * 60 * 1000,
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
    const config: any = { headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${process.env.VITE_RAYNA_API_TOKEN}` } };
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

const proxyRequest = async (endpoint: string, method: 'get' | 'post', body: any, res: express.Response) => {
  console.log(`Proxying ${method.toUpperCase()} ${endpoint}...`);
  try {
    const config: any = { headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${process.env.VITE_RAYNA_API_TOKEN}` } };
    const response = method === 'get'
      ? await axios.get(`${BASE_URL}${endpoint}`, config)
      : await axios.post(`${BASE_URL}${endpoint}`, body, config);
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

// HEALTH
app.get("/api/health", async (req, res) => {
  try {
    const userCount = await User.countDocuments();
    const bookingCount = await Booking.countDocuments();
    res.json({ status: "ok", database: "mongodb", users: userCount, bookings: bookingCount, env: process.env.NODE_ENV });
  } catch (error: any) {
    res.status(500).json({ status: "error", database: error.message });
  }
});

// --- Auth Endpoints ---

app.post("/api/auth/register", async (req, res) => {
  const { email, password, name, companyName, agentName } = req.body;
  console.log(`Registration attempt for: ${email}`);
  try {
    const hashedPassword = bcrypt.hashSync(password, 10);
    const user = new User({ email, password: hashedPassword, name: name || agentName, companyName, agentName });
    await user.save();
    console.log(`User registered: ${email}`);
    res.json({ success: true, message: "Account created successfully! Please log in." });
  } catch (error: any) {
    console.error(`Registration error for ${email}:`, error.message);
    if (error.code === 11000) {
      res.status(400).json({ error: "Email already exists" });
    } else {
      res.status(500).json({ error: "Registration failed: " + error.message });
    }
  }
});

app.post("/api/auth/login", async (req, res) => {
  const { email, password } = req.body;
  console.log(`Login attempt for: ${email}`);
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ error: "Invalid credentials" });
    if (!bcrypt.compareSync(password, user.password)) return res.status(401).json({ error: "Invalid credentials" });
    const token = jwt.sign({
      id: user._id,
      email: user.email,
      name: user.name,
      companyName: user.companyName,
      agentName: user.agentName,
      logoUrl: user.logoUrl
    }, JWT_SECRET);
    res.json({
      token,
      user: { id: user._id, email: user.email, name: user.name, companyName: user.companyName, agentName: user.agentName, logoUrl: user.logoUrl }
    });
  } catch (error: any) {
    res.status(500).json({ error: "Login failed: " + error.message });
  }
});

app.get("/api/auth/me", async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: "No token" });
  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    const user = await User.findById(decoded.id).select("-password");
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json({ user: { id: user._id, email: user.email, name: user.name, companyName: user.companyName, agentName: user.agentName, logoUrl: user.logoUrl } });
  } catch (error) {
    res.status(401).json({ error: "Invalid token" });
  }
});

app.post("/api/auth/update-profile", async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: "No token" });
  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    const { companyName, agentName, logoUrl } = req.body;
    await User.findByIdAndUpdate(decoded.id, { companyName, agentName, logoUrl });
    res.json({ success: true });
  } catch (error) {
    res.status(401).json({ error: "Invalid token" });
  }
});

app.post("/api/auth/change-password", async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: "No token" });
  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(decoded.id);
    if (!user) return res.status(404).json({ error: "User not found" });
    if (!bcrypt.compareSync(currentPassword, user.password)) return res.status(400).json({ error: "Current password is incorrect" });
    user.password = bcrypt.hashSync(newPassword, 10);
    await user.save();
    res.json({ success: true });
  } catch (error) {
    res.status(401).json({ error: "Invalid token" });
  }
});

// --- Tour Endpoints ---

// STATIC — cached
app.get("/api/countries",            (req, res) => cachedProxyRequest('/api/Tour/countries',            'get',  null,     res, CACHE_TTL.FOREVER));
app.post("/api/cities",              (req, res) => cachedProxyRequest('/api/Tour/cities',               'post', req.body, res, CACHE_TTL.MEDIUM));
app.post("/api/tours",               (req, res) => cachedProxyRequest('/api/Tour/tourstaticdata',       'post', req.body, res, CACHE_TTL.LONG));
app.post("/api/tour-details",        (req, res) => cachedProxyRequest('/api/Tour/tourStaticDataById',   'post', req.body, res, CACHE_TTL.LONG));
app.post("/api/tour-options-static", (req, res) => cachedProxyRequest('/api/Tour/touroptionstaticdata', 'post', req.body, res, CACHE_TTL.LONG));

// DYNAMIC — never cached
app.post("/api/tour-policy",         (req, res) => proxyRequest('/api/Tour/policy',       'post', req.body, res));
app.post("/api/tour-prices",         (req, res) => proxyRequest('/api/Tour/tourlist',     'post', req.body, res));
app.post("/api/tour-options",        (req, res) => proxyRequest('/api/Tour/touroption',   'post', req.body, res));
app.post("/api/tour-timeslots",      (req, res) => proxyRequest('/api/Tour/timeslot',     'post', req.body, res));
app.post("/api/tour-availability",   (req, res) => proxyRequest('/api/Tour/availability', 'post', req.body, res));

// --- Booking Endpoints ---

app.post("/api/bookings", async (req, res) => {
  const { localDetails, ...raynaPayload } = req.body;
  console.log(`Proxying POST /api/Booking/bookings...`);
  try {
    const config = { headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${process.env.VITE_RAYNA_API_TOKEN}` } };
    const response = await axios.post(`${BASE_URL}/api/Booking/bookings`, raynaPayload, config);
    console.log(`Rayna Booking Response:`, JSON.stringify(response.data, null, 2));

    const authHeader = req.headers.authorization;
    const bookingId = response.data?.result?.details?.[0]?.bookingId || response.data?.bookingId;
    const referenceNo = response.data?.result?.referenceNo || response.data?.referenceNo;

    if (authHeader && bookingId) {
      const token = authHeader.split(" ")[1];
      try {
        const decoded = jwt.verify(token, JWT_SECRET) as any;
        const { tourName, optionName, tourId, travelDate, totalAmount, paxDetails } = localDetails || {};
        const booking = new Booking({
          userId: decoded.id,
          raynaBookingId: bookingId.toString(),
          referenceNo: referenceNo || "",
          tourName: tourName || "Unknown Tour",
          optionName: optionName || "Standard",
          tourId: tourId || 0,
          travelDate: travelDate || "",
          totalAmount: totalAmount || 0,
          status: "Confirmed",
          paxDetails: paxDetails || {}
        });
        await booking.save();
        console.log(`Booking saved to MongoDB: ${bookingId}`);
      } catch (e: any) {
        console.error("Failed to save booking:", e.message);
      }
    }
    res.json(response.data);
  } catch (error: any) {
    console.error(`Proxy error (/api/Booking/bookings):`, error.message);
    if (error.response) res.status(error.response.status).json(error.response.data);
    else res.status(500).json({ error: `Failed to fetch from Rayna: /api/Booking/bookings` });
  }
});

app.get("/api/my-bookings", async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: "No token" });
  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    const bookings = await Booking.find({ userId: decoded.id }).sort({ createdAt: -1 });
    // Map to match existing frontend field names
    const mapped = bookings.map(b => ({
      id: b._id,
      user_id: b.userId,
      rayna_booking_id: b.raynaBookingId,
      reference_no: b.referenceNo,
      tour_name: b.tourName,
      option_name: b.optionName,
      tour_id: b.tourId,
      booking_date: b.bookingDate,
      travel_date: b.travelDate,
      total_amount: b.totalAmount,
      status: b.status,
      pax_details: JSON.stringify(b.paxDetails),
      created_at: b.createdAt,
    }));
    res.json(mapped);
  } catch (error) {
    res.status(401).json({ error: "Invalid token" });
  }
});

app.post("/api/get-tickets", (req, res) => proxyRequest('/api/Booking/GetBookedTickets', 'post', req.body, res));

app.post("/api/cancel-booking", async (req, res) => {
  const { bookingId } = req.body;
  const authHeader = req.headers.authorization;
  console.log(`Proxying POST /api/Booking/cancelbooking...`, req.body);
  try {
    const config = { headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${process.env.VITE_RAYNA_API_TOKEN}` } };
    const response = await axios.post(`${BASE_URL}/api/Booking/cancelbooking`, req.body, config);

    if (response.data.statuscode === 200 && response.data.result?.status === 1) {
      if (authHeader) {
        const token = authHeader.split(" ")[1];
        try {
          const decoded = jwt.verify(token, JWT_SECRET) as any;
          await Booking.findOneAndUpdate(
            { raynaBookingId: bookingId.toString(), userId: decoded.id },
            { status: 'Cancelled' }
          );
          console.log(`Booking ${bookingId} marked Cancelled in MongoDB`);
        } catch (e: any) {
          console.error("Failed to update booking status:", e.message);
        }
      }
    }
    res.json(response.data);
  } catch (error: any) {
    console.error(`Proxy error (/api/Booking/cancelbooking):`, error.message);
    if (error.response) res.status(error.response.status).json(error.response.data);
    else res.status(500).json({ error: `Failed to fetch from Rayna: /api/Booking/cancelbooking` });
  }
});

async function setupVite() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({ server: { middlewareMode: true }, appType: "spa" });
    app.use(vite.middlewares);
  } else {
    app.use(express.static("dist"));
    app.get("*", (req, res) => { res.sendFile("dist/index.html", { root: "." }); });
  }
}

if (process.env.NODE_ENV !== "production" || !process.env.VERCEL) {
  setupVite().then(() => {
    app.listen(PORT, "0.0.0.0", () => { console.log(`Server running on http://localhost:${PORT}`); });
  });
}

export default app;
