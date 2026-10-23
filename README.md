# 🏦 FinTrack — Expense Tracker

A full-stack personal finance management application built with the **MERN stack** (MongoDB, Express.js, React.js, Node.js). Track your income, expenses, budgets, and get detailed analytics — all in a beautiful, responsive UI.

![MERN Stack](https://img.shields.io/badge/Stack-MERN-green) ![License](https://img.shields.io/badge/License-MIT-blue)

---

## ✨ Features

### 🔐 Authentication
- Secure user registration & login
- JWT-based authentication with 30-day token expiry
- Password hashing with bcrypt
- Protected routes on frontend & backend

### 📊 Dashboard
- Real-time financial overview (balance, income, expenses, savings)
- Current month summary
- Income vs Expense bar chart (6 months)
- Category-wise expense donut chart
- Monthly savings trend line chart
- Recent transactions list

### 💰 Transaction Management
- Full CRUD (Create, Read, Update, Delete)
- Categorized transactions (10 expense + 5 income categories)
- Multiple payment methods (Cash, Credit Card, Debit Card, UPI, Net Banking)
- Advanced search, filter, and sort
- Pagination support
- Mobile-friendly card view + desktop table view

### 🎯 Budget Management
- Set monthly category budgets
- Real-time spending tracking against budgets
- Progress bars with color-coded status
- 80% warning threshold
- 100% exceeded alerts

### 📈 Analytics
- Monthly income vs expense comparison
- Savings trend with area chart
- Category breakdown for expenses & income
- Financial summary with key metrics
- Configurable time range (3/6/12 months)

### 📋 Reports
- Monthly, income, expense, and category reports
- CSV export with full transaction details
- Category breakdown chart per month
- Detailed transaction table

### ⚙️ Settings
- Profile management (name, currency)
- Password change
- Dark/light theme toggle
- Account information

### 🎨 UI/UX
- Modern SaaS-quality design
- Dark mode support
- Fully responsive (desktop, tablet, mobile)
- Collapsible sidebar navigation
- Toast notifications
- Loading skeletons
- Empty states
- Confirmation dialogs
- Form validation with error messages

---

## 🛠️ Tech Stack

### Frontend
| Tech | Purpose |
|------|---------|
| React.js | UI framework |
| Vite | Build tool |
| React Router | Client-side routing |
| Tailwind CSS | Styling |
| Axios | HTTP client |
| Recharts | Charts & visualizations |
| Lucide React | Icons |
| React Hot Toast | Notifications |

### Backend
| Tech | Purpose |
|------|---------|
| Node.js | Runtime |
| Express.js | Web framework |
| MongoDB | Database |
| Mongoose | ODM |
| JWT | Authentication |
| bcryptjs | Password hashing |
| Helmet | Security headers |
| CORS | Cross-origin support |
| Morgan | Request logging |

---

## 📁 Architecture

```
expense-tracker/
├── client/                     # React frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── common/         # Reusable UI components
│   │   │   ├── layout/         # AppLayout, Sidebar
│   │   │   ├── budget/         # Budget-specific components
│   │   │   └── transactions/   # Transaction-specific components
│   │   ├── context/            # React Context (Auth, Theme)
│   │   ├── hooks/              # Custom hooks
│   │   ├── pages/              # Page components
│   │   ├── services/           # API service layer
│   │   └── utils/              # Constants, helpers
│   ├── index.html
│   ├── tailwind.config.js
│   └── vite.config.js
│
├── server/                     # Express backend
│   ├── config/                 # Database configuration
│   ├── controllers/            # Route handlers
│   ├── middleware/              # Auth middleware
│   ├── models/                 # Mongoose models
│   ├── routes/                 # API routes
│   ├── utils/                  # Token generation
│   ├── server.js               # Entry point
│   └── seed.js                 # Demo data seeder
│
└── README.md
```

---

## 🚀 Installation & Setup

### Prerequisites
- **Node.js** v18+ ([Download](https://nodejs.org))
- **MongoDB** v6+ — running locally or a cloud instance ([MongoDB Atlas](https://www.mongodb.com/atlas))

### 1. Clone the repository
```bash
git clone <repo-url>
cd expense-tracker
```

### 2. Backend Setup
```bash
cd server
npm install
```

Create a `.env` file in `server/`:
```env
MONGO_URI=mongodb://localhost:27017/expense-tracker
JWT_SECRET=your_super_secret_jwt_key_change_this
PORT=5000
NODE_ENV=development
```

> ⚠️ Change `JWT_SECRET` to a strong random string in production!

### 3. Seed Demo Data (optional)
```bash
npm run seed
```
This creates a demo user with 6 months of realistic transactions:
- **Email:** `demo@example.com`
- **Password:** `demo123456`

### 4. Start the Backend
```bash
npm run dev
```
Server runs at `http://localhost:5000`

### 5. Frontend Setup
```bash
cd ../client
npm install
```

### 6. Start the Frontend
```bash
npm run dev
```
App runs at `http://localhost:5173`

---

## 🔌 API Documentation

### Authentication
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/auth/register` | Register new user | No |
| POST | `/api/auth/login` | Login user | No |
| GET | `/api/auth/me` | Get current user | Yes |
| PUT | `/api/auth/profile` | Update profile | Yes |
| PUT | `/api/auth/password` | Change password | Yes |

### Transactions
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/transactions` | Get all (with filters, pagination) | Yes |
| POST | `/api/transactions` | Create transaction | Yes |
| GET | `/api/transactions/:id` | Get single transaction | Yes |
| PUT | `/api/transactions/:id` | Update transaction | Yes |
| DELETE | `/api/transactions/:id` | Delete transaction | Yes |

**Query Parameters:** `type`, `category`, `paymentMethod`, `startDate`, `endDate`, `minAmount`, `maxAmount`, `search`, `sortBy`, `sortOrder`, `page`, `limit`

### Analytics
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/analytics/summary` | Financial summary | Yes |
| GET | `/api/analytics/monthly` | Monthly income/expense data | Yes |
| GET | `/api/analytics/categories` | Category breakdown | Yes |

### Budgets
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/budgets` | Get budgets (with spending) | Yes |
| POST | `/api/budgets` | Create budget | Yes |
| PUT | `/api/budgets/:id` | Update budget | Yes |
| DELETE | `/api/budgets/:id` | Delete budget | Yes |

---

## 🔒 Security

- JWT tokens for API authentication
- Passwords hashed with bcrypt (10 salt rounds)
- Helmet.js for HTTP security headers
- CORS configured for allowed origins
- User-scoped database queries (no data leaks)
- Sensitive errors not exposed to frontend

---

## 📸 Screenshots

> Run the application and access `http://localhost:5173` to see the UI.

| Page | Description |
|------|-------------|
| Login | Clean auth page with demo account button |
| Dashboard | Financial overview with charts and stats |
| Transactions | Filterable, searchable transaction list |
| Analytics | Detailed charts and financial metrics |
| Budgets | Category budgets with progress tracking |
| Reports | Exportable financial reports |
| Settings | Profile, password, and theme management |

---

## 🔮 Future Improvements

- [ ] Recurring transactions
- [ ] Multi-currency support
- [ ] Bill reminders / notifications
- [ ] Data import from bank statements
- [ ] Financial goals tracking
- [ ] PDF report generation
- [ ] PWA support for offline use
- [ ] Two-factor authentication
- [ ] Social login (Google, GitHub)
- [ ] Shared family accounts

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).
