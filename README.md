# Production API — Express.js + TypeScript

A production-grade REST API with JWT authentication and blog CRUD.

## Stack

- **Runtime**: Node.js 18+
- **Framework**: Express.js 4
- **Language**: TypeScript 5
- **Database**: MongoDB (Mongoose)
- **Auth**: JWT (access + refresh tokens)
- **Validation**: Joi
- **Logging**: Winston + Daily Rotate

## Project Structure

```
src/
├── config/          # env, database
├── controllers/     # request handlers
├── middlewares/     # auth, validate, errorHandler
├── models/          # Mongoose schemas
├── routes/          # route definitions
├── services/        # business logic
├── types/           # shared TypeScript types
├── utils/           # logger, AppError, apiResponse
├── validators/      # Joi schemas
├── app.ts           # Express app factory
└── server.ts        # entry point + graceful shutdown
```

## Getting Started

```bash
# 1. Install dependencies
npm install

# 2. Configure environment
cp .env.example .env
# Edit .env with your values

# 3. Start development server
npm run dev

# 4. Build for production
npm run build && npm start
```

## API Endpoints

### Auth  `POST /api/v1/auth`

| Method | Path              | Auth     | Description         |
|--------|-------------------|----------|---------------------|
| POST   | /register         | Public   | Register new user   |
| POST   | /login            | Public   | Login               |
| POST   | /refresh          | Public   | Refresh tokens      |
| POST   | /logout           | Required | Logout              |
| GET    | /me               | Required | Get profile         |
| PATCH  | /change-password  | Required | Change password     |

### Blogs  `GET/POST/PATCH/DELETE /api/v1/blogs`

| Method | Path          | Auth     | Description         |
|--------|---------------|----------|---------------------|
| GET    | /             | Public   | List blogs (paginated) |
| GET    | /slug/:slug   | Public   | Get blog by slug    |
| GET    | /:id          | Public   | Get blog by ID      |
| POST   | /             | Required | Create blog         |
| PATCH  | /:id          | Required | Update blog         |
| DELETE | /:id          | Required | Delete blog         |

### Query Parameters (GET /blogs)
- `page`, `limit` — pagination
- `sort` — field to sort by (`createdAt`, `updatedAt`, `title`, `views`)
- `order` — `asc` | `desc`
- `status` — `draft` | `published` | `archived`
- `tags` — filter by tag(s)
- `search` — full-text search
- `author` — filter by author ID

## Response Format

```json
{
  "success": true,
  "message": "...",
  "data": { ... }
}
```

## Security Features

- Helmet (security headers)
- CORS whitelist
- Rate limiting (100 req / 15 min by default)
- MongoDB injection sanitization
- Password hashing (bcrypt, 12 rounds)
- JWT access token (15m) + refresh token (7d)
- Refresh token rotation (stored hashed in DB)
- Request body size limit (10kb)
