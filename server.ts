import express from "express";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";
import axios from "axios";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// API Proxy for Rayna Tours Cities
app.post("/api/cities", async (req, res) => {
  console.log('Proxying request to Rayna Tours cities API...', req.body);
  try {
    const response = await axios.post('https://sandbox.raynatours.com/api/Tour/cities', req.body, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.VITE_RAYNA_API_TOKEN}`
      }
    });
    console.log('Rayna Tours cities response status:', response.status);
    res.json(response.data);
  } catch (error: any) {
    console.error('Proxy error (cities):', error.message);
    if (error.response) {
      res.status(error.response.status).json(error.response.data);
    } else {
      res.status(500).json({ error: 'Failed to fetch cities from Rayna' });
    }
  }
});

// API Proxy for Rayna Tours Static Data by ID
app.post("/api/tour-details", async (req, res) => {
  console.log('Proxying request to Rayna Tours static data by ID API...', req.body);
  try {
    const response = await axios.post('https://sandbox.raynatours.com/api/Tour/tourStaticDataById', req.body, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.VITE_RAYNA_API_TOKEN}`
      }
    });
    console.log('Rayna Tours tour details response status:', response.status);
    res.json(response.data);
  } catch (error: any) {
    console.error('Proxy error (tour-details):', error.message);
    if (error.response) {
      res.status(error.response.status).json(error.response.data);
    } else {
      res.status(500).json({ error: 'Failed to fetch tour details from Rayna' });
    }
  }
});

// API Proxy for Rayna Tours Search (Static Data)
app.post("/api/tours", async (req, res) => {
  console.log('Proxying request to Rayna Tours static data API...', req.body);
  try {
    const response = await axios.post('https://sandbox.raynatours.com/api/Tour/tourstaticdata', req.body, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.VITE_RAYNA_API_TOKEN}`
      }
    });
    console.log('Rayna Tours static data response status:', response.status);
    res.json(response.data);
  } catch (error: any) {
    console.error('Proxy error (tours):', error.message);
    if (error.response) {
      res.status(error.response.status).json(error.response.data);
    } else {
      res.status(500).json({ error: 'Failed to fetch tours from Rayna' });
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
  // But we still need to handle the SPA fallback if the static build doesn't
}

export default app;
