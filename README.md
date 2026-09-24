# CampusTuck Web (Frontend)

Modern, responsive Next.js 14 web application for CampusTuck — the campus tuck shop & delivery platform for students, faculty, and tuck shop administrators.

## Features
- **Next.js 14 App Router** with React 18 and TypeScript
- **Tailwind CSS** styling with customized campus design tokens
- **Automatic CSRF Token Handling & Retry** via `/api/config/csrf` with credentials inclusion
- **Real-Time Order Updates** via Socket.IO
- **Role-Based Access**:
  - Customer browsing, cart management, checkout with campus building & room delivery
  - Admin dashboard, order status transitions, catalog and category management, inventory audits
- **Mobile Responsive** with sliding drawers, toasts, and search filters

## Getting Started

### 1. Installation
```bash
npm install
```

### 2. Environment Configuration
Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```

Key environment variables:
| Variable | Description | Default |
| :--- | :--- | :--- |
| `NEXT_PUBLIC_API_URL` | Base URL of the backend API | `http://localhost:5000/api` |
| `NEXT_PUBLIC_SOCKET_URL` | Socket.IO server URL | `http://localhost:5000` |

### 3. Running Locally
- **Development**:
  ```bash
  npm run dev
  ```
  App will be running at `http://localhost:3000`.
- **Production Build & Run**:
  ```bash
  npm run build
  npm start
  ```
- **Lint**:
  ```bash
  npm run lint
  ```

## Production Deployment (Render / Vercel)
- Deploy as a **Web Service** on Render or **Next.js Project** on Vercel.
- **Build Command**: `npm install && npm run build`
- **Start Command**: `npm start`
- **Environment Variables**:
  - `NODE_ENV=production`
  - `NEXT_PUBLIC_API_URL=https://campustuck-api.onrender.com/api`
  - `NEXT_PUBLIC_SOCKET_URL=https://campustuck-api.onrender.com`
