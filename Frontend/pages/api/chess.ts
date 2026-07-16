import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { fen, depth } = req.body;

  const flaskUrl = process.env.NEXT_PUBLIC_FLASK_URL || "http://localhost:5000";

  try {
    console.log(`[Next.js API] Attempting to fetch bot move from custom Flask AI backend at ${flaskUrl}...`);
    
    // We set up a 6-second timeout for the Flask call to prevent long hangs on sleeping free tier instances
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);

    const flaskRes = await fetch(`${flaskUrl}/get_bot_move`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ fen }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (flaskRes.ok) {
      const data = await flaskRes.json();
      console.log(`[Next.js API] Successfully retrieved bot move from custom Flask backend: ${data.move}`);
      return res.status(200).json(data);
    } else {
      throw new Error(`Flask backend returned status code ${flaskRes.status}`);
    }
  } catch (error: any) {
    console.warn(`[Next.js API] Custom Flask AI backend check failed or timed out: ${error?.message || error}. Falling back to Stockfish public API.`);
    
    try {
      const fallbackRes = await fetch("https://chess-api.com/v1", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ fen, depth, maxThinkingTime: 100 }),
      });

      if (fallbackRes.ok) {
        const data = await fallbackRes.json();
        console.log(`[Next.js API] Fallback move fetched successfully: ${data.move}`);
        return res.status(200).json(data);
      } else {
        const errText = await fallbackRes.text();
        return res.status(fallbackRes.status).send(errText);
      }
    } catch (fallbackError: any) {
      console.error("[Next.js API] Both custom Flask backend and fallback API failed:", fallbackError);
      return res.status(500).json({ error: "Failed to generate bot move from all sources." });
    }
  }
}