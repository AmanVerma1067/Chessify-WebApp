import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { fen, depth } = req.body;

  const apiRes = await fetch("https://chess-api.com/v1", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${process.env.CHESS_API_KEY}`, // if required
    },
    body: JSON.stringify({ fen, depth, maxThinkingTime: 100 }),
  });

  const data = await apiRes.json();
  res.status(apiRes.status).json(data);
}