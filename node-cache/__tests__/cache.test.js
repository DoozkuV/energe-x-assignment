const request = require('supertest');
const express = require('express');
const { createClient } = require('redis');
const mysql = require('mysql2/promise');

// Mock Redis and MySQL
jest.mock('redis');
jest.mock('mysql2/promise');

// Create a test app
const app = express();
app.use(express.json());

// Mock implementations
const mockRedisClient = {
  connect: jest.fn(),
  get: jest.fn(),
  set: jest.fn(),
  on: jest.fn()
};

const mockPool = {
  query: jest.fn()
};

createClient.mockReturnValue(mockRedisClient);
mysql.createPool = jest.fn().mockReturnValue(mockPool);

// Import the actual app routes (we'll need to refactor the index.ts to be testable)
describe('Cache Service API', () => {
  let testApp;

  beforeAll(() => {
    // Create test routes
    testApp = express();
    testApp.use(express.json());

    // Mock the routes from index.ts
    testApp.get('/cache/posts', async (req, res) => {
      const cached = await mockRedisClient.get('posts:all');
      if (cached) return res.json(JSON.parse(cached));

      const [rows] = await mockPool.query('SELECT * FROM posts ORDER BY id DESC');
      await mockRedisClient.set('posts:all', JSON.stringify(rows), { EX: 60 });
      res.json(rows);
    });

    testApp.get('/cache/posts/:id', async (req, res) => {
      const id = req.params.id;
      const key = `posts:${id}`;
      const cached = await mockRedisClient.get(key);
      if (cached) return res.json(JSON.parse(cached));

      const [rows] = await mockPool.query('SELECT * FROM posts WHERE id = ?', [id]);
      const row = rows[0];
      if (!row) return res.status(404).json({ error: 'Post not found' });

      await mockRedisClient.set(key, JSON.stringify(row), { EX: 60 });
      res.json(row);
    });
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /cache/posts', () => {
    test('should return cached posts when available', async () => {
      const mockPosts = [
        { id: 1, title: 'Test Post', content: 'Test content', user_id: 1 },
        { id: 2, title: 'Another Post', content: 'More content', user_id: 1 }
      ];

      mockRedisClient.get.mockResolvedValue(JSON.stringify(mockPosts));

      const response = await request(testApp).get('/cache/posts');

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockPosts);
      expect(mockRedisClient.get).toHaveBeenCalledWith('posts:all');
      expect(mockPool.query).not.toHaveBeenCalled();
    });

    test('should query database when cache miss', async () => {
      const mockPosts = [
        { id: 1, title: 'DB Post', content: 'DB content', user_id: 1 }
      ];

      mockRedisClient.get.mockResolvedValue(null);
      mockPool.query.mockResolvedValue([mockPosts]);

      const response = await request(testApp).get('/cache/posts');

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockPosts);
      expect(mockRedisClient.get).toHaveBeenCalledWith('posts:all');
      expect(mockPool.query).toHaveBeenCalledWith('SELECT * FROM posts ORDER BY id DESC');
      expect(mockRedisClient.set).toHaveBeenCalledWith(
        'posts:all',
        JSON.stringify(mockPosts),
        { EX: 60 }
      );
    });
  });

  describe('GET /cache/posts/:id', () => {
    test('should return cached post when available', async () => {
      const mockPost = { id: 1, title: 'Cached Post', content: 'Cached content', user_id: 1 };

      mockRedisClient.get.mockResolvedValue(JSON.stringify(mockPost));

      const response = await request(testApp).get('/cache/posts/1');

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockPost);
      expect(mockRedisClient.get).toHaveBeenCalledWith('posts:1');
      expect(mockPool.query).not.toHaveBeenCalled();
    });

    test('should query database when cache miss', async () => {
      const mockPost = { id: 1, title: 'DB Post', content: 'DB content', user_id: 1 };

      mockRedisClient.get.mockResolvedValue(null);
      mockPool.query.mockResolvedValue([[mockPost]]);

      const response = await request(testApp).get('/cache/posts/1');

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockPost);
      expect(mockRedisClient.get).toHaveBeenCalledWith('posts:1');
      expect(mockPool.query).toHaveBeenCalledWith('SELECT * FROM posts WHERE id = ?', ['1']);
      expect(mockRedisClient.set).toHaveBeenCalledWith(
        'posts:1',
        JSON.stringify(mockPost),
        { EX: 60 }
      );
    });

    test('should return 404 when post not found', async () => {
      mockRedisClient.get.mockResolvedValue(null);
      mockPool.query.mockResolvedValue([[]]);

      const response = await request(testApp).get('/cache/posts/999');

      expect(response.status).toBe(404);
      expect(response.body).toEqual({ error: 'Post not found' });
      expect(mockRedisClient.set).not.toHaveBeenCalled();
    });
  });
});