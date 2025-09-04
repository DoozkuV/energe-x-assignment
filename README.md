# EnergeX-AI Technical Assessment

A full-stack microservice application built with **Lumen (PHP)**, **Node.js (TypeScript)**, **React.js**, **MySQL**, and **Redis** - all containerized with Docker.

## 🏗️ Project Architecture

```
energe-x/
├── lumen-api/          # PHP Lumen REST API with JWT authentication
├── node-cache/         # Node.js TypeScript caching layer with Redis
├── frontend/           # React.js frontend application
├── docker/             # Docker configuration files
├── .github/workflows/  # CI/CD pipeline (GitHub Actions)
├── docker-compose.yml  # Full stack orchestration
└── docker-composer.dev.yml # Development database services
```

## 🚀 Features

### Backend APIs
- **Lumen API** (Port 8000): JWT authentication, CRUD operations for posts
- **Cache Service** (Port 4000): Redis caching layer with MySQL fallback
- **Database**: MySQL with proper migrations and relationships
- **Caching**: Redis for performance optimization

### Frontend
- **React.js** (Port 80): User authentication, post management interface
- **Tailwind CSS**: Modern, responsive UI design
- **JWT Integration**: Secure token-based authentication

### DevOps
- **Docker**: Fully containerized services
- **CI/CD**: Automated testing with GitHub Actions  
- **Testing**: PHPUnit for PHP, Jest for Node.js

## 📋 Prerequisites

- **Docker** and **Docker Compose** installed
- **Node.js 20+** (for local development)
- **PHP 8.3+** (for local development)

## 🐳 Docker Deployment (Recommended)

### Quick Start - Full Stack
```bash
# Clone the repository
git clone <repository-url>
cd energe-x

# Build and start all services
docker compose up --build

# The application will be available at:
# - Frontend: http://localhost
# - Lumen API: http://localhost:8000
# - Cache Service: http://localhost:4000
# - MySQL: localhost:3306
# - Redis: localhost:6379
```

### Development Mode - Database Only
```bash
# Start only database services for local development
docker compose -f docker-composer.dev.yml up -d

# This starts MySQL and Redis containers
# Then run individual services locally for development
```

## 🔧 Local Development Setup

### 1. Database Services
```bash
# Start MySQL and Redis
docker compose -f docker-composer.dev.yml up -d
```

### 2. Lumen API Setup
```bash
cd lumen-api

# Install dependencies
composer install

# Copy environment file
cp .env.example .env

# Run migrations
php artisan migrate

# Start the server
php -S localhost:8000 -t public
```

### 3. Node.js Cache Service
```bash
cd node-cache

# Install dependencies
npm install

# Start development server
npm run dev
# or for production build
npm run build && npm start
```

### 4. React Frontend
```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

## 📚 API Documentation

### Lumen API Endpoints (Port 8000)
```
POST   /api/register     # Register new user
POST   /api/login        # Authenticate user  
GET    /api/posts        # Get all posts (requires auth)
POST   /api/posts        # Create new post (requires auth)
GET    /api/posts/{id}   # Get specific post (requires auth)
```

### Cache Service Endpoints (Port 4000)  
```
GET    /cache/posts      # Get cached posts (Redis → MySQL fallback)
GET    /cache/posts/{id} # Get cached post by ID
```

### Authentication
All `/api/posts` endpoints require JWT authentication:
```bash
# Login to get token
curl -X POST http://localhost:8000/api/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password"}'

# Use token in requests  
curl -X GET http://localhost:8000/api/posts \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## 🧪 Testing

### Run All Tests
```bash
# Lumen PHP Tests
cd lumen-api
vendor/bin/phpunit

# Node.js Tests
cd node-cache  
npm test

# Or run via Docker
docker compose exec lumen-api vendor/bin/phpunit
docker compose exec cache-service npm test
```

### CI/CD Pipeline
The project includes GitHub Actions workflow that automatically:
- Runs PHPUnit tests for Lumen API
- Runs Jest tests for Node.js cache service
- Triggers on push/PR to main branch

## 🗄️ Database Schema

### Users Table
```sql
- id (Primary Key)
- name (String)
- email (Unique String) 
- password (Hashed String)
- created_at, updated_at (Timestamps)
```

### Posts Table
```sql  
- id (Primary Key)
- title (String)
- content (Text)
- user_id (Foreign Key → users.id)
- created_at, updated_at (Timestamps)
```

## ⚙️ Environment Configuration

### Lumen API (.env)
```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_DATABASE=energex
DB_USERNAME=energe_user
DB_PASSWORD=energe_pass

CACHE_DRIVER=redis
REDIS_HOST=127.0.0.1

JWT_SECRET=your_jwt_secret_key
```

### Node.js Cache (.env)
```env
PORT=4000
REDIS_URL=redis://127.0.0.1:6379
DB_HOST=127.0.0.1
DB_USER=energe_user
DB_PASS=energe_pass
DB_NAME=energex
```

## 🔍 Service Health Checks

```bash
# Check if services are running
docker compose ps

# View service logs
docker compose logs lumen-api
docker compose logs cache-service
docker compose logs frontend

# Check MySQL connection
docker compose exec db mysql -u energe_user -p energex

# Check Redis connection  
docker compose exec redis redis-cli ping
```

## 🛠️ Troubleshooting

### Common Issues

1. **Port conflicts**: Ensure ports 80, 3306, 4000, 6379, 8000 are available
2. **Database connection**: Wait for MySQL health check to pass before starting apps
3. **JWT token issues**: Ensure JWT_SECRET is set in Lumen .env
4. **Cache misses**: Verify Redis connection and TTL settings

### Reset Everything
```bash
# Stop and remove all containers, networks, volumes
docker compose down -v
docker system prune -f

# Rebuild from scratch
docker compose up --build
```

## 📝 Development Notes

- **Caching Strategy**: 60-second TTL for all cached posts
- **Security**: JWT tokens, password hashing, CORS middleware
- **Testing**: Comprehensive unit tests for all API endpoints
- **Logging**: Structured error handling across all services

### ⚠️ Security Note: Cache Service Authentication Bypass

The cache service (`/cache/posts` endpoints on port 4000) does not implement authentication, while the main API (`/api/posts` endpoints on port 8000) requires JWT authentication. This means users can bypass authentication by accessing cached posts directly through the cache service.

This is a known architectural consideration - in a production environment, the cache service would typically be:
- Internal-only (no external port exposure)
- Protected by API gateway authentication
- Or implement its own JWT validation

For this technical assessment, both services remain publicly accessible as per the microservices architecture demonstration requirements.

## 🎯 Assessment Requirements Fulfilled

- ✅ **Backend (Lumen)**: REST API with JWT authentication
- ✅ **Backend (Node.js)**: Redis caching layer  
- ✅ **Database (MySQL)**: User and post data with migrations
- ✅ **Frontend (React)**: UI consuming the APIs
- ✅ **Testing**: PHPUnit and Jest test suites
- ✅ **DevOps (Docker)**: Complete containerization
- ✅ **CI/CD**: GitHub Actions automated testing

Built with ❤️ for the EnergeX-AI Technical Assessment
