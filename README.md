# memory vault

A premium personal and project asset memory vault web app designed to track and organize workspace logs, voice notes, links, and documents in a unified, secure platform. 

Built using a modern monorepo architecture with **NodeJS/Express** (backend) and **React/Vite** (frontend) styled with **Tailwind CSS v4**.

**Live Application**: [https://memory-vault-eeeg.onrender.com](https://memory-vault-eeeg.onrender.com)

---

## 🌟 Key Features

*   **Project Workspaces**: Create, edit, and delete distinct project categories to separate personal logs, code assets, and designs.
*   **Team Collaboration**: Share project access via secure, time-sensitive email invitations (powered by SMTP & Nodemailer). Collaborators get full read/write access to shared project entries.
*   **Chronological Timeline**: View project entries grouped chronologically (e.g., *Today*, *Yesterday*, or formatted calendar dates).
*   **Cloudflare R2 Direct Uploads**: Secure browser-to-bucket file uploads via pre-signed S3 signatures, bypassing server load and memory limits.
*   **In-Browser Voice & Media**: Record audio memos directly inside the browser using HTML5 capture or upload local audio files to the timeline.
*   **JWT Cookie-based Auth**: Secure user session tracking utilizing Access and Refresh JWT tokens stored in secure, `httpOnly` cookies.
*   **Security Hardened**: Protected with security headers (hiding `X-Powered-By`), CORS verification, and brute-force rate-limiting on sensitive auth routes.
*   **Live Comments (Real-time)**: Built-in WebSocket connection (via Socket.io) enables real-time chatting and commenting on specific entries without needing to refresh the page.
*   **Universal Media Downloads**: Securely download any media asset (Images, Videos, PDFs, Audio) using auto-generated pre-signed URLs from the backend directly from the entry timeline.
*   **Fully Responsive UI**: Mobile-optimized layouts featuring a collapsible mobile slide-out settings drawer, desktop left sidebar, and responsive action buttons.

---

## 🛠️ Tech Stack

*   **Frontend**: React 19, Vite 8, Tailwind CSS v4, Lucide React (Icons), Axios
*   **Backend**: NodeJS, Express, Mongoose (MongoDB ODM), Express Rate Limit, Cookie Parser
*   **Storage**: Cloudflare R2 (S3 Compatible object storage)
*   **Hosting & Deployment**: Render (Single Service Monorepo configuration)

---

## 🔑 Environment Variables Setup

Since files containing credentials (`.env`) are listed in `.gitignore` to prevent leaks on GitHub, they must be set up manually in two places depending on the environment.

### 1. Local Development (`/server/.env`)
Create a new file named `.env` inside the `/server` directory and paste the following keys:

```env
PORT=5001
MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/memory_vault?retryWrites=true&w=majority
JWT_SECRET=your_128_bit_jwt_access_token_secret_here
JWT_REFRESH_SECRET=your_128_bit_jwt_refresh_token_secret_here
R2_ACCOUNT_ID=your_cloudflare_r2_account_id
R2_ACCESS_KEY_ID=your_cloudflare_r2_access_key_id
R2_SECRET_ACCESS_KEY=your_cloudflare_r2_secret_access_key
R2_BUCKET_NAME=your_r2_bucket_name
R2_ENDPOINT=your_r2_endpoint_url
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_16_digit_app_password
SMTP_FROM=your_email@gmail.com
CLIENT_URL=http://localhost:5173
```

### 2. Production Deployment (Render Dashboard)
When hosting on Render, you must add these exact same keys (excluding `PORT` as Render handles this dynamically) in the web panel:
1. Go to your **Render Dashboard** and select your Web Service (**memory-vault**).
2. Click **Environment** in the left menu.
3. Click **Add Environment Variable** for each of the following:

| Key | Description / Recommended Value |
| :--- | :--- |
| `MONGODB_URI` | Your MongoDB Atlas connection cluster string. |
| `JWT_SECRET` | A secure, random 64+ character string for access tokens. |
| `JWT_REFRESH_SECRET` | A secure, random 64+ character string for refresh tokens. |
| `R2_ACCOUNT_ID` | Cloudflare R2 Account ID (found on your R2 dashboard). |
| `R2_ACCESS_KEY_ID` | R2 API Access Key ID with Read/Write bucket permissions. |
| `R2_SECRET_ACCESS_KEY`| R2 API Secret Access Key. |
| `R2_BUCKET_NAME` | The name of your Cloudflare R2 storage bucket. |
| `R2_ENDPOINT` | The public or API endpoint URL for your R2 bucket. |
| `SMTP_HOST` | SMTP server host (e.g., smtp.gmail.com). |
| `SMTP_PORT` | SMTP server port (e.g., 587). |
| `SMTP_USER` | Email address used for authentication. |
| `SMTP_PASS` | SMTP App password (if using Gmail, generate an App Password). |
| `SMTP_FROM` | Sender email address for outbound invites. |
| `CLIENT_URL` | Your frontend production URL (e.g., `https://memory-vault-eeeg.onrender.com`). |

4. Click **Save Changes** at the bottom to trigger a fresh, secure redeployment.

---

## 🚀 Running Locally

Ensure you have [NodeJS](https://nodejs.org/) installed on your machine.

### Step 1: Install Dependencies
Run the install command from the **root directory** of the repository:
```bash
npm run install-all
```
*This command automatically walks into both the `/server` and `/client` directories and installs all required Node modules.*

### Step 2: Start Development Servers
To run both the backend server (on port `5001`) and the Vite frontend dev server (on port `5173` with hot-reload) concurrently:
```bash
npm run dev
```

### Step 3: Run Production Build Locally
To test the production behavior locally where the Express server builds and serves the static React assets directly:
```bash
npm start
```
*Open `http://localhost:5001` in your browser.*

---

## ☁️ Render Deployment Details

Deploying a monorepo as a single web service on Render's free tier:

*   **Build Command**: `npm run build` (This runs root package dependencies, monorepo installers, and compiles client assets to `client/dist`).
*   **Start Command**: `npm start` (This builds frontend and launches the Express server, serving both static assets and API routers).
*   **Branch**: `main` (or whichever branch contains your latest configurations).

---

## ⚡ Bypassing Render Free Tier "Spin Down" (Keep Awake)

Render's free tier suspends Web Services after **15 minutes of inactivity**, resulting in a ~50-second delay ("cold start") on the next load. 

We have implemented a lightweight `/health` check endpoint at `https://memory-vault-eeeg.onrender.com/health` that returns a simple status response without querying the database.

### Setup UptimeRobot (Free & Automated)
1. Register a free account at [UptimeRobot](https://uptimerobot.com/).
2. Click **Add New Monitor**.
3. Fill in:
    *   **Monitor Type**: `HTTP(s)`
    *   **Friendly Name**: `memory vault`
    *   **URL (or IP)**: `https://memory-vault-eeeg.onrender.com/health`
    *   **Monitoring Interval**: `Every 5 minutes` (or 10 minutes)
4. Click **Create Monitor**.

*UptimeRobot will send a quick ping every 5 minutes, keeping the Render container active 24/7.*
