# Module 05 — Authentication & Dashboard (MERN)

A full-stack blog application with secure password hashing, JWT authentication, protected dashboard routes, per-user blog ownership, profile details, and logout.

## Stack
- React + Vite
- Node.js + Express
- MongoDB + Mongoose
- JSON Web Tokens (JWT)
- bcryptjs password hashing

## Requirements
- Node.js 18+
- MongoDB local instance or MongoDB Atlas

## Setup

### 1. Configure backend
```bash
cd server
cp .env.example .env
```
Set a strong `JWT_SECRET` in `server/.env`. Configure `MONGODB_URI` for your MongoDB.

Example:
```env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/blog_auth_dashboard
JWT_SECRET=replace_this_with_a_long_random_secret
CLIENT_URL=http://localhost:5173
```

### 2. Run backend
From `server/`:
```bash
npm install
npm run dev
```
Backend runs at `http://localhost:5000`.

### 3. Run frontend
Open a second terminal and run:
```bash
cd client
npm install
npm run dev
```
Open `http://localhost:5173`.

## How to test
1. Register a new account.
2. Log in with that account.
3. Create a blog from the dashboard.
4. Confirm the dashboard only lists blogs owned by the logged-in account.
5. Edit and delete your own blog.
6. Open Profile to view account details.
7. Log out, then try opening `/dashboard` directly; it should return to the login screen.
8. Register a second account and confirm it cannot see the first user's blogs.

## API
- `POST /api/auth/register` — create account
- `POST /api/auth/login` — sign in
- `GET /api/auth/me` — current authenticated user
- `GET /api/blogs` — list current user's blogs (JWT required)
- `POST /api/blogs` — create blog (JWT required)
- `PUT /api/blogs/:id` — update own blog (JWT required)
- `DELETE /api/blogs/:id` — delete own blog (JWT required)

## Security notes
- Passwords are hashed using bcryptjs; plaintext passwords are never stored.
- Protected API routes verify JWTs.
- Blog queries are scoped to the authenticated user's ID.
- Keep `.env` private; never commit real secrets.
- This is a learning project. For production, add rate limiting, email verification, password reset, HTTPS, security monitoring, and stronger deployment configuration.

## Deliverables
- [x] JWT authentication
- [x] Protected dashboard
- [x] Per-user blog listing and ownership checks
- [x] Profile and logout
- [ ] Push to your GitHub repository
- [ ] Publish your LinkedIn post
- [ ] Submit both links to the internship portal
