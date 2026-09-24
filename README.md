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
| `NEXT_PUBLIC_API_URL` | Backend URL (the client adds `/api`) | `https://campustuck-api.onrender.com` |
| `NEXT_PUBLIC_SOCKET_URL` | Optional Socket.IO server override | Uses the API backend origin |

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
  - `NEXT_PUBLIC_API_URL=https://campustuck-api.onrender.com`
- On Vercel, set the root directory to `frontend` and add this API variable for the desired environments, then redeploy so Next.js includes it in the browser build.
- Remove any old `NEXT_PUBLIC_SOCKET_URL` pointing to a local server, or set it to `https://campustuck-api.onrender.com`.
