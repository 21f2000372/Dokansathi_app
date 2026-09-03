# DokanSathi

**DokanSathi – Smart Queue and Store Operations Management System for Neighborhood Grocery Stores**

DokanSathi is a full-stack web application designed to help neighborhood grocery (kirana) stores manage their in-store operations efficiently during busy hours.

The system replaces manual order slips and verbal coordination with a structured digital workflow for order management, queue management, task assignment, inventory, billing, and payment.

## 🎯 Objective

The main objective of DokanSathi is to reduce rush-hour chaos in neighborhood grocery stores by providing a centralized platform where shop owners, assistants, and customers can coordinate orders and track their status in real time.

## ✨ Key Features

- 🔐 Role-based authentication and authorization
- 🛒 Customer order placement and order tracking
- 📋 Smart order queue management
- 👨‍💼 Shop owner dashboard
- 👷 Assistant task assignment and tracking
- 📦 Inventory and stock management
- 🧾 Billing and payment management
- 🔔 Order status notifications
- 📊 Store operation and sales overview

## 👥 User Roles

### Shop Owner

- Manage store operations
- Monitor the order queue
- Assign tasks to assistants
- Manage products and inventory
- Generate bills and manage payments
- Monitor store activity

### Assistant

- View assigned tasks
- Start and complete assigned tasks
- Report stock discrepancies
- Track order preparation

### Customer

- Browse available products
- Place orders
- Track order status and queue position
- Cancel pending orders
- View order history
- Receive notifications

## 🔄 Order Workflow

```text
Customer Places Order
        ↓
Order Added to Queue
        ↓
Owner Reviews Order
        ↓
Task Assigned to Assistant
        ↓
Assistant Prepares Order
        ↓
Order Marked Ready
        ↓
Bill Generated
        ↓
Payment Recorded
        ↓
Order Completed
```

## 🧰 Tech Stack

**Frontend**

- React (with Vite)
- React Router

**Backend**

- Node.js + Express
- TypeORM
- PostgreSQL
- JWT (authentication), bcrypt (password hashing)
- Groq API (used only for the owner "AI Insights" feature)

## ✅ Prerequisites

Make sure these are installed before running the app:

- **Node.js** v18 or newer
- **PostgreSQL** (installed and running)
- **npm** (comes with Node.js)

## 📥 Getting Started (Running from a Downloaded ZIP)

> **Note:** `node_modules`, `dist`, the `.env` files, and `backend/reviews.json` are **not** included in the repository/ZIP. You need to recreate the `.env` files and install dependencies after extracting.

### 1. Extract the ZIP

Download the ZIP from GitHub and extract it. Open the extracted `Dokansathi_app` folder.

### 2. Create the environment files

These files are not included in the ZIP, so create them manually.

Create **`backend/.env`**:

```env
PORT=5000

DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=your_postgres_password
DB_NAME=dokansathi

JWT_SECRET=any_long_random_secret_string

# Optional: only needed for the owner "AI Insights" feature
GROQ_API_KEY=your_groq_api_key
```

Create **`frontend/.env`**:

```env
VITE_API_URL=http://localhost:5000/api
```

### 3. Create the PostgreSQL database

Create a database that matches `DB_NAME` above (default `dokansathi`). For example, using `psql`:

```sql
CREATE DATABASE dokansathi;
```

### 4. Install dependencies

Install in **both** folders.

```bash
# backend
cd backend
npm install

# frontend (in a separate terminal, from the project root)
cd frontend
npm install
```

### 5. Create the database tables (run migrations)

From the `backend` folder:

```bash
npm run typeorm migration:run -- -d src/config/data-source.ts
```

This creates all the required tables (User, Product, Inventory, Order, OrderItem, Task, Bill, Payment, Notification).

### 6. Start the backend

From the `backend` folder:

```bash
npm run dev
```

The backend runs on `http://localhost:5000`. You should see `Database connected successfully`.

### 7. Start the frontend

From the `frontend` folder (separate terminal):

```bash
npm run dev
```

Vite prints a local URL (usually `http://localhost:5173`). Open it in your browser.

### 8. Use the app

- Register a shop owner account, then log in.
- Add products, create assistant/customer users, and place orders to try the full workflow.

## ⚙️ Environment Variables

**Backend (`backend/.env`)**

| Variable       | Description                                              |
| -------------- | -------------------------------------------------------- |
| `PORT`         | Port the backend runs on (default `5000`)                |
| `DB_HOST`      | PostgreSQL host (default `localhost`)                    |
| `DB_PORT`      | PostgreSQL port (default `5432`)                         |
| `DB_USERNAME`  | PostgreSQL username (default `postgres`)                 |
| `DB_PASSWORD`  | PostgreSQL password                                      |
| `DB_NAME`      | Database name (default `dokansathi`)                     |
| `JWT_SECRET`   | Secret used to sign JWT auth tokens                      |
| `GROQ_API_KEY` | Groq API key — only required for the AI Insights feature |

**Frontend (`frontend/.env`)**

| Variable       | Description                                                    |
| -------------- | -------------------------------------------------------------- |
| `VITE_API_URL` | Base URL of the backend API (e.g. `http://localhost:5000/api`) |

## 📝 Notes

- **AI Insights** (owner Performance page) require a valid `GROQ_API_KEY`. Without it, the rest of the app still works; only the insights request will fail gracefully.
- **Reviews** are stored in a local `backend/reviews.json` file (a lightweight, demo-grade store) and are created automatically when the first review is submitted. This file is not tracked in the repository.
- Because `synchronize` is disabled, the database tables are created by running the migration step above — don't skip step 5.
