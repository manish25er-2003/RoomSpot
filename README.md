# Smart Room & Rent Management

A responsive room and rent management app with a React + Vite client and an Express, MongoDB and Mongoose API. Admin and tenant accounts use JWT authentication. If the API is unavailable, the UI opens in a local demo workspace so you can explore the screens; demo changes are stored in this browser only.

## Requirements

- Node.js 20.19+ (Vite 8 requirement)
- MongoDB 6+ running locally, or a MongoDB Atlas connection string

## Run locally

1. Install client dependencies from the project root:

   ```sh
   npm install
   cp .env.example .env.local
   npm run dev
   ```

2. In another terminal, configure and start the API:

   ```sh
   cd server
   npm install
   cp .env.example .env
   # Edit MONGODB_URI, JWT_SECRET, ADMIN_EMAIL and ADMIN_PASSWORD
   npm run dev
   ```

   The API listens on `http://localhost:5000`; Vite runs at `http://localhost:5173`.

3. Optional: populate a demo property and accounts. Stop the API first, then run:

   ```sh
   cd server
   npm run seed
   npm run dev
   ```

   Seeded logins (password `maish123`): `admin@maish.com`, `rahul@email.com`, `priya@email.com`.

The API creates the configured admin account at startup when it does not exist. Public registration always creates a tenant. Change the example credentials before using the app beyond a local demo.

## Features

- Admin and tenant registration/login, bcrypt password hashing, JWT protection, and role restricted API routes.
- Room CRUD, facility tracking, occupancy states, room assignment and vacating.
- Monthly payment records, due date tracking, payment status changes, receipt details endpoint, and rent totals.
- Tenant complaint submission and admin status updates.
- Tenant ↔ admin message persistence, notifications and admin activity history.
- Responsive dashboards, search, local demo fallback and browser printable receipts.

## API overview

All protected routes use `Authorization: Bearer <token>`.

- `POST /api/auth/register`, `POST /api/auth/login`, `GET /api/auth/me`
- `GET/POST /api/rooms`, `PUT/DELETE /api/rooms/:id`, `PATCH /api/rooms/:id/assign`, `PATCH /api/rooms/:id/vacate`
- `GET/POST /api/users`, `PATCH/DELETE /api/users/:id` (admin)
- `GET/POST /api/payments`, `PATCH /api/payments/:id` (admin), `POST /api/payments/:id/pay` (tenant), `GET /api/payments/:id/receipt`
- `GET/POST /api/complaints`, `PATCH /api/complaints/:id` (admin)
- `GET/POST /api/messages`, `GET /api/notifications`, `PATCH /api/notifications/:id/read`, `GET /api/activity` (admin)

`npm run build` creates the client production bundle. Set `CLIENT_URL` to the deployed frontend origin and `VITE_API_URL` to the deployed API base URL when hosting separately.

## Install Roomspot from Chrome

Roomspot is a Progressive Web App. Deploy the built client to an HTTPS origin (localhost also works for development), open the site in Chrome, then use **Install app** when the Roomspot install button appears or choose **Install Roomspot** from Chrome's menu. The installed app opens in its own window and caches the app shell for offline startup; API-backed data still requires a connection to the server. Browsers only show installation after the site has been visited and meets their install criteria.
