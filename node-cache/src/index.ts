/**
 * Cache Service 
 * Acts as a cahcing proxy between front and backends. 
 * - Serves posts from Redis if available 
 * - Falls back to MySQL if not cached 
 * - Stores results back in Redis with TTL 
 */

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createClient } from 'redis';
import mysql from 'mysql2/promise';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const redis = createClient({ url: process.env.REDIS_URL! });
redis.on('error', (err) => console.error('Redis error', err));

let pool: mysql.Pool;

async function init() {
  await redis.connect();
  pool = mysql.createPool({
    host: process.env.DB_HOST!,
    port: Number(process.env.DB_PORT!),
    user: process.env.DB_USER!,
    password: process.env.DB_PASS!,
    database: process.env.DB_NAME!,
  });
}


// Fetch all posts (cached in redis)
app.get('/cache/posts', async (_req, res) => {
  const cached = await redis.get('posts:all');
  if (cached) return res.json(JSON.parse(cached));

  const [rows] = await pool.query('SELECT * FROM posts ORDER BY id DESC');
  await redis.set('posts:all', JSON.stringify(rows), { EX: 60 });
  res.json(rows);
});

app.get('/cache/posts/:id', async (req, res) => {
  const id = req.params.id;
  const key = `posts:${id}`;
  const cached = await redis.get(key);
  if (cached) return res.json(JSON.parse(cached));

  const [rows] = await pool.query('SELECT * FROM posts WHERE id = ?', [id]);
  const row = (rows as any[])[0];
  if (row == null) return res.status(404).json({ error: 'Post not found' });

  await redis.set(key, JSON.stringify(row), { EX: 60 });
  res.json(row);
});

app.use((req, res, _next) => {
  res.status(404).json({
    error: "Not Found",
    path: req.originalUrl,
  });
});

app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(err); // log to console for debugging

  res.status(err.status || 500).json({
    error: err.message || "Internal Server Error",
    type: err.name || "Error",
    stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
  });
});

init().then(() => {
  const PORT = process.env.PORT || 4000;
  app.listen(PORT, () => {
    console.log(`Cache service running on port ${PORT}`);
  });
});
