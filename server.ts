import express from "express";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";
import axios from "axios";

dotenv.config();

const app = express();
const PORT = 3000;
const BASE_URL = 'https://sandbox.raynatours.com';
 
app.use(express.json());
  
// Helper for proxying requests
const proxyRequest = async (endpoint: string, method: 'get' | 'post', body: any, res: express.Response) => {
  console.log(`Proxying ${method.toUpperCase()} request to ${endpoint}...`, body);
  try {
    const config: any = {
      headers: {
        'Content-Type': 'application/json',
        'ApiKey': process.env.VITE_RAYNA_API_TOKEN 
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

// --- Tour Endpoints ---

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

app.post("/api/bookings", (req, res) => proxyRequest('/api/Booking/bookings', 'post', req.body, res));
app.post("/api/get-tickets", (req, res) => proxyRequest('/api/Booking/GetBookedTickets', 'post', req.body, res));
app.post("/api/cancel-booking", (req, res) => proxyRequest('/api/Booking/cancelbooking', 'post', req.body, res));

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
  // But we still need to handle the SPA fallback if the static build doesn't
}

export default app;
