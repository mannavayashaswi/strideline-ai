# Classic Rides

Classic Rides is the existing React + Vite showroom/enquiry UI with an Express, Mongoose, and MongoDB Atlas API. It is an educational demo and is not affiliated with any motorcycle manufacturer. An enquiry is not an official booking or a confirmed appointment.

## Local setup (Windows PowerShell)

1. In MongoDB Atlas, create a cluster and database user, then allow your development IP under **Network Access**. Copy the Atlas driver connection string. Replace its `<username>` and `<password>` placeholders with your own database-user values; URL-encode special characters in the password. You may set a database name such as `classic_rides` in the URI.
2. In the project root, copy `.env.example` to `.env`. Open `.env` and set `MONGODB_URI` to that copied Atlas URI and `JWT_SECRET` to a private random value of at least 32 characters. Do not put quotes around the values, and never commit `.env`.
3. Install dependencies once from the project root with `npm install`.
4. Open two PowerShell terminals in the project root:

	**Terminal 1 — backend:**
	```powershell
	npm start
	```
	The Express API listens on port 5000, and only starts listening after a successful MongoDB connection.

	**Terminal 2 — frontend:**
	```powershell
	npm run dev
	```
	Open `http://localhost:5173`. Vite forwards local `/api` requests to `http://localhost:5000`.

## API routes

- `GET /api/health` — reports the actual MongoDB connection state.
- `POST /api/auth/register` — validates registration and stores a bcrypt-hashed password in `users`.
- `POST /api/auth/login` — verifies credentials and returns a one-day JWT.
- `GET /api/auth/me` — requires `Authorization: Bearer <token>` and returns the signed-in user without the password.
- `POST /api/bookings` — requires a JWT and stores the enquiry in `bookings`.

## Deploy the backend to Render and frontend to Vercel

Use the `classic-rides-deploy` branch, which has the project files at the repository root. The root `render.yaml` creates only the Express API service; `vercel.json` configures the Vite frontend build and SPA fallback.

### 1. Deploy the API on Render

1. In MongoDB Atlas, allow the Render service to connect through **Network Access** and use a least-privilege database user. Atlas documents `0.0.0.0/0` as a broad option; apply the narrowest workable policy for production.
2. In Render, choose **New → Blueprint**, select the GitHub repository and the `classic-rides-deploy` branch, then apply the Blueprint from `render.yaml`.
3. Enter your own Atlas URI for `MONGODB_URI` and a private random value for `JWT_SECRET` when prompted. Do not use the local `.env` file or put these values in Vercel.
4. Wait for the API service to deploy. Open `https://<your-render-api-host>/api/health`; it must return `{"ok":true,"database":"connected"}`. The Blueprint temporarily sets `CLIENT_ORIGIN` to `*` so the Vercel site can be deployed first.

### 2. Deploy the frontend on Vercel

1. In Vercel, import the same GitHub repository and select the `classic-rides-deploy` branch. Set the project/root directory to `.` (repository root). `vercel.json` specifies `npm run build`, the `dist` output directory, and the SPA fallback.
2. Add the environment variable `VITE_API_BASE_URL` for Production, using the Render API's full HTTPS origin only, for example `https://your-api-service.onrender.com` (no `/api` suffix). Deploy or redeploy the frontend after adding/changing it; Vite embeds this value at build time.
3. Open the Vercel deployment and note its production URL.

### 3. Restrict API access to your deployed site

In Render's API service **Environment** settings, replace the temporary `CLIENT_ORIGIN=*` with your exact Vercel production origin, such as `https://your-project.vercel.app` (no trailing slash), then save and redeploy/restart the API. You may set a comma-separated list if you intentionally support multiple origins. Avoid `*` for the final production configuration.

Finally, reload the Vercel site, register/login, and submit a test enquiry. Confirm documents appear in Atlas under the `users` and `bookings` collections. Never expose `MONGODB_URI` or `JWT_SECRET` in a `VITE_` variable. A Render health response of `disconnected` means the database is not connected; check the URI, Atlas database-user credentials, network access, and cluster status.

## Security

- `.env` and `.env.*` files are ignored by Git; `.env.example` contains placeholders only.
- Never expose `MONGODB_URI` or `JWT_SECRET` through a `VITE_` frontend variable.
- Before collecting real customer information, add a privacy notice, retention policy, abuse protection, and production monitoring.
