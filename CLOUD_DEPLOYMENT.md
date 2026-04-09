# NimbusFS Cloud Deployment Guide 🚀

Follow these steps to deploy NimbusFS to **Vercel** (Frontend) and **Railway** (Backend & Storage Nodes).

---

## 1. Backend Deployment (Railway)

We will deploy 4 separate services using the same GitHub repository.

### A. Create the Main API Service
1. Connect your GitHub repo to Railway.
2. Select the `backend` directory.
3. In **Settings -> Build**, ensure it uses the `Dockerfile` in `backend/`.
4. In **Variables**, add:
   - `NODE1_URL`: (You'll get this after deploying node1)
   - `NODE2_URL`: (You'll get this after deploying node2)
   - `NODE3_URL`: (You'll get this after deploying node3)
   - `SECRET_KEY`: (A random string for JWT)
5. In **Settings -> Volumes**, create a volume for `/app/storage` to persist the database and uploaded files.

### B. Create Storage Node Services (Repeat 3 times)
1. Add a new service from the same repo.
2. In **Settings -> Deploy**, set the **Start Command** to:
   - Node 1: `python node_server.py --node node1 --port 8001`
   - Node 2: `python node_server.py --node node2 --port 8002`
   - Node 3: `python node_server.py --node node3 --port 8003`
3. Expose the respective ports (8001, 8002, 8003).
4. Add a Volume for `/app/storage` for each node.

---

## 2. Frontend Deployment (Vercel)

### A. Deploy Frontend
1. Connect your GitHub repo to Vercel.
2. Select the `frontend` directory as the Root Directory.
3. Use the default Vite build settings.

### B. Connect to Backend
1. Once your **Railway Main API** is deployed, copy its public URL (e.g., `https://nimbus-api.up.railway.app`).
2. Go to your local code (or Vercel environment variables) and update `frontend/vercel.json`:
   ```json
   "destination": "https://your-backend-url.railway.app/:path*"
   ```
   *Replace `https://your-backend-url.railway.app` with your actual Railway URL.*
3. Push the change to GitHub or redeploy in Vercel.

---

## 3. Important Notes ⚠️

> [!CAUTION]
> **Persistence**: Without Railway Volumes, your uploaded files and user data will be deleted every time the service restarts. Always ensure a Volume is mapped to the storage directory.

> [!TIP]
> **Internal Networking**: If you are using Railway, you can use internal service URLs (e.g., `http://node1.railway.internal:8001`) instead of public URLs for better performance and security between the API and Storage Nodes.

---
*Happy Deploying!*
