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

## Deploy to Render

The root `render.yaml` defines a Node web service for the API and a static site for the unchanged Vite frontend. Push the project to GitHub, then create a Render **Blueprint** from that repository. Supply private values for `MONGODB_URI`, `JWT_SECRET`, and `CLIENT_ORIGIN` when prompted. Set `CLIENT_ORIGIN` to the deployed frontend's exact HTTPS origin (no trailing slash). The frontend's `VITE_API_BASE_URL` is populated from the API service host; redeploy the static site after changing it.

In Atlas, permit the Render service's outbound access through **Network Access** (Atlas documents `0.0.0.0/0` as a broad option; use the narrowest workable policy for production). Keep the database user least-privileged. After deployment, open the API service's `/api/health` URL. It should report `{"ok":true,"database":"connected"}` only after Mongoose has connected. A failed connection means the URI, database-user credentials, network access, or cluster availability still needs attention.

## Security

- `.env` and `.env.*` files are ignored by Git; `.env.example` contains placeholders only.
- Never expose `MONGODB_URI` or `JWT_SECRET` through a `VITE_` frontend variable.
- Before collecting real customer information, add a privacy notice, retention policy, abuse protection, and production monitoring.
