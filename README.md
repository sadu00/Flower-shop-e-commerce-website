# 🌸 Flora & Fleur – Flower Shop E-Commerce Website

A full-stack flower shop web application built for **CSE 323 – Web Programming Lab**, Metropolitan University, Sylhet.
Customers can browse flower arrangements, add them to a cart, place orders, track order history and chat with the shop. Admins can manage products, orders and customer messages from a dashboard.

**Live demo:** https://flower-shop-e-commerce-website-nu.vercel.app

---

## ✨ Features

### Customer
- Register / login with JWT authentication
- Browse products by category
- Shopping cart (saved in the browser)
- Checkout with address, phone and payment method (bKash, Nagad, Card, COD – demo payment)
- **Order history** – see all your past orders with their status
- Product ratings and reviews
- Edit profile (name, phone, address, password)
- Live chat with the admin

### Admin
- Add, edit and delete products
- View all customer orders, update status (Pending / Processing / Delivered / Cancelled) or delete
- Reply to customer messages

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | HTML5, CSS3, JavaScript (ES6), Bootstrap 5 |
| Backend | Node.js, Express 5 |
| Database | MongoDB Atlas (Mongoose) |
| Auth | JSON Web Tokens (JWT), bcryptjs |
| Hosting | Vercel (serverless API + static frontend) |

---

## 📁 Project Structure

```
Flower-shop-e-commerce-website/
├── api/
│   └── index.js        # Express API (used by Vercel and for local run)
├── frontend/
│   ├── index.html      # Home, cart, orders, profile, chat modals
│   ├── login.html      # Login / register
│   ├── cart.html       # Checkout page
│   ├── orders.html     # Order history page
│   ├── profile.html    # Profile page
│   ├── chat.html       # Customer chat page
│   ├── admin.html      # Admin dashboard
│   ├── style.css
│   └── images/
├── backend/            # Older standalone backend (seed.js for sample data)
├── package.json
└── vercel.json         # Routes /api/* to api/index.js, everything else to frontend/
```

---

## 🚀 Run Locally

### Prerequisites
- [Node.js](https://nodejs.org/) v18 or higher
- A MongoDB database (free [MongoDB Atlas](https://www.mongodb.com/atlas) cluster works)

### Steps

```bash
# 1. Clone
git clone https://github.com/sadu00/Flower-shop-e-commerce-website.git
cd Flower-shop-e-commerce-website

# 2. Install dependencies
npm install

# 3. Create a .env file in the project root (see below)

# 4. Start the API
node api/index.js
```

The API runs on `http://localhost:5000`.
Open `frontend/index.html` with VS Code **Live Server** (or any static server) to use the website.

> For local testing, change `API_URL` at the top of the `<script>` in each frontend page to `http://localhost:5000/api`.

### Environment Variables

Create a `.env` file in the root folder:

```env
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=any_long_random_secret
```

⚠️ **Never commit `.env` or put your database password directly in the code.**
`.env` is already listed in `.gitignore`.

---

## ☁️ Deploy on Vercel

1. Push the repo to GitHub and import it in Vercel.
2. Keep **Root Directory** as `./` (the project root, not `backend/`).
3. In **Settings → Environment Variables** add `MONGO_URI` and `JWT_SECRET`.
4. In MongoDB Atlas → **Network Access**, allow `0.0.0.0/0` so Vercel can connect.
5. Deploy. `vercel.json` routes `/api/*` to the API and all other paths to `frontend/`.

---

## 🔌 API Endpoints

Base URL: `/api`

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/auth/register` | – | Create account |
| POST | `/auth/login` | – | Login, returns JWT |
| GET | `/users/profile` | ✅ | Get profile |
| PUT | `/users/profile` | ✅ | Update profile |
| GET | `/products` | – | List products |
| POST | `/products` | – | Add product (admin page) |
| PUT / DELETE | `/products/:id` | – | Edit / delete product |
| POST | `/orders` | ✅ | Place an order |
| GET | `/orders/my-orders` | ✅ | Logged-in user's order history |
| GET | `/orders` | – | All orders (admin page) |
| PUT | `/orders/:id/status` | – | Update order status |
| DELETE | `/orders/:id` | – | Delete order |
| GET | `/reviews/product/:id` | – | Reviews of a product |
| POST | `/reviews` | ✅ | Add review |
| POST | `/messages/send` | ✅ | Customer sends message |
| GET | `/messages` | ✅ | Customer's chat messages |
| GET | `/messages/users` | – | Admin: customers who chatted |
| GET | `/messages/user/:userId` | – | Admin: one customer's chat |
| POST | `/messages/reply` | – | Admin reply |

✅ = needs header `Authorization: Bearer <token>`

---

## 🐞 Troubleshooting

| Problem | Fix |
|---------|-----|
| Order can't be placed / order history empty | Make sure every frontend `API_URL` ends with `/api`, then **logout and login again** |
| API returns 404 on Vercel | Root Directory must be `./` and `vercel.json` must be in the project root |
| `MongoDB connection failed` | Check `MONGO_URI` in Vercel env variables and allow `0.0.0.0/0` in Atlas Network Access |
| Atlas SRV lookup error (some ISPs) | Use the standard (non-SRV) connection string from Atlas |

---

## 🔒 Known Limitations (future work)

- Admin routes are not yet protected by an admin-role check
- Admin role can be chosen at registration
- Payment is a demo only – no real payment gateway

---

## 👩‍💻 Author

**Sadia** – CSE, Metropolitan University, Sylhet
GitHub: [@sadu00](https://github.com/sadu00)
