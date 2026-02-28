import type { VercelRequest, VercelResponse } from '@vercel/node';
import axios from 'axios';

export const raynaProxy = async (
  endpoint: string,
  req: VercelRequest,
  res: VercelResponse
) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    const response = await axios.post(
      `https://sandbox.raynatours.com/api${endpoint}`,
      req.body,
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.VITE_RAYNA_API_TOKEN}`,
        },
      }
    );
    return res.json(response.data);
  } catch (error: any) {
    console.error(`Proxy error (${endpoint}):`, error.message);
    if (error.response) {
      return res.status(error.response.status).json(error.response.data);
    }
    return res.status(500).json({ error: `Failed to fetch from Rayna: ${endpoint}` });
  }
};
