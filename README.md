# MyShop

A full-stack e-commerce application with a React storefront and an Express + Prisma API. Customers can browse products, manage a persistent cart, place orders with shipping details, and track or cancel them. Admins get a protected dashboard to manage the product catalog.

## ✨ Features

**Customers**

- Register and log in — sessions are kept in an **httpOnly JWT cookie** (safe from client-side JS)
- Browse the active product catalog with **search, sorting (newest / price), and pagination**, and view product details
- Add to cart with **stock-aware quantity limits**; cart persists across sessions via localStorage
- Check out with shipping details — stock is reserved **atomically inside a database transaction**
- Order history, per-order detail view, and cancel-pending-orders that **restore stock in the same transaction**

**Admins**

- Manage the product catalog: list, create, and edit products
- Product visibility toggle (`isActive` controls what shoppers can see)
- Manage orders: paginated list with search + status filter, detail view, and **lifecycle status updates** (confirm, ship, deliver; cancel restores stock)
- Administrator and role-based access enforced on both routes and queries

**Backend**

- Feature-based module layout (`auth`, `users`, `products`, `orders`)
- **Zod-validated** environment config — the server refuses to boot on a missing/malformed env
- Centralized validation, error handling, and 404 middleware with consistent error envelopes
- Role-based authorization middleware; customers can only ever see their own orders
- Shared **search, sort, and pagination** helpers on list endpoints (`meta` envelope with `total` / `totalPages`)
- Order status transitions validated against a server-side transition map (illegal moves return 409)
- Seed script that creates an admin account and six sample products

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19 · TypeScript · Vite 8 · Tailwind CSS 4 · React Router 8 |
| State | Zustand (persisted cart) + Axios API client |
| Backend | Node.js · Express 5 · TypeScript · Zod 4 |
| Database | PostgreSQL 17 via Prisma 7 (transactions, atomic stock updates) |
| Auth | JWT in httpOnly cookies · bcrypt (12 rounds) · constant-time login |
| Tooling | Docker Compose · Prettier · ESLint |

## 🗂 Project Structure

```
ecommerce-app/
├── client/            # React storefront (Vite)
│   └── src/
│       ├── pages/     # Storefront + admin pages
│       ├── components/
│       ├── store/     # Zustand stores (auth, cart)
│       └── lib/       # Axios client, formatting utils
├── server/            # Express API (Prisma)
│   └── src/
│       ├── modules/   # auth / users / products / orders
│       ├── middleware/ # auth, roles, validation, errors
│       └── config/    # Zod-validated environment
├── prisma/            # Schema, migrations, seed
└── docker-compose.yml # Local PostgreSQL 17
```

## 🚀 Getting Started

**Prerequisites:** Node.js 20+, Docker (for PostgreSQL).

1. **Start the database**

   ```bash
   docker compose up -d
   ```

2. **Configure the server**

   ```bash
   cd server
   cp .env.example .env   # set JWT_SECRET to your own value
   npm install
   ```

3. **Configure the client**

   ```bash
   cd ../client
   npm install
   ```

4. **Migrate and seed**

   ```bash
   cd ../server
   npm run db:migrate
   npm run db:seed
   ```

5. **Run both apps**

   ```bash
   cd ../server && npm run dev    # API on :5000
   cd ../client && npm run dev    # app on :5173
   ```

> ⚙️ Admin credentials and opt-in values (e.g. `SEED_ADMIN_EMAIL`, `ALLOW_REGISTRATION`) are configured in `server/.env.example`.

## 🔌 API Overview

| Method | Route | Description |
|---|---|---|
| `POST` | `/api/auth/register` | Create a customer account |
| `POST` | `/api/auth/login` | Sign in (sets httpOnly cookie) |
| `POST` | `/api/auth/logout` | Clear session |
| `GET` | `/api/auth/me` | Current user |
| `GET` | `/api/products?search&sort&page&limit` | Active catalog (search, sort, paginated) |
| `GET` | `/api/products/:id` | Product detail |
| `POST` | `/api/orders` | Place order (transactional stock reservation) |
| `GET` | `/api/orders` | My orders |
| `GET` | `/api/orders/:id` | Order detail (ownership enforced) |
| `DELETE` | `/api/orders/:id` | Cancel pending order (restores stock) |
| `GET/POST/PUT` | `/api/admin/products*` | Admin product CRUD (auth + role required) |
| `GET` | `/api/admin/orders` | All orders — search + status filter + pagination |
| `GET` | `/api/admin/orders/:id` | Order detail with allowed next statuses |
| `PATCH` | `/api/admin/orders/:id/status` | Advance status lifecycle (cancel restores stock) |

## 🗺 Roadmap / In Progress

Current focus is the shopping experience; the following are planned:

- [ ] Product categories and advanced filtering
- [ ] Payment integration
- [ ] Automated tests (unit + integration)
- [ ] Deployment configuration and Dockerfiles for both apps

## 🔒 Security Notes

- Passwords hashed with **bcrypt (cost 12)**; login uses a dummy hash for constant-time comparison
- JWT stored in an **httpOnly cookie** — inaccessible to client-side scripts
- Roles are **never taken from client input** — new accounts are always `CUSTOMER`
- Stock decrements use atomic `WHERE stock >= quantity` updates inside transactions
- Cancelling an order restores stock in the **same transaction** as the status change
- Admin order status transitions are validated server-side (forward-only, plus `PENDING → CANCELLED`)