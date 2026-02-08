# How to Deploy AI Resume Builder to Render

This project is set up as a **Monorepo** (both client and server in one repository). The best way to deploy this on Render is to create two separate services: a **Web Service** for the backend and a **Static Site** for the frontend.

## Prerequisites
1.  Push your code to **GitHub**.
2.  Create an account on [Render.com](https://render.com).

---

## Part 1: Deploy the Backend (Server)

1.  On Render Dashboard, clicking **New +** and select **Web Service**.
2.  Connect your GitHub repository.
3.  Configure the service:
    *   **Name**: `ai-resume-server` (or similar)
    *   **Region**: Closest to you (e.g., Singapore, Oregon)
    *   **Root Directory**: `server`
    *   **Environment**: Node
    *   **Build Command**: `npm install`
    *   **Start Command**: `node index.js`
    *   **Plan**: Free
4.  **Environment Variables** (Advanced) -> **Add Environment Variable**:
    *   `MONGO_URI`: Your MongoDB Connection String (from MongoDB Atlas).
    *   `JWT_SECRET`: A secret string for authentication (e.g., `mysecretkey123`).
    *   `GEMINI_API_KEY`: Your Google Gemini API Key.
    *   `PORT`: `10000` (Render sets this automatically, but good to know).
5.  Click **Create Web Service**.
6.  Wait for the deployment to finish. **Copy the backend URL** (e.g., `https://ai-resume-server.onrender.com`). You will need this for the frontend.

---

## Part 2: Deploy the Frontend (Client)

1.  On Render Dashboard, click **New +** and select **Static Site**.
2.  Connect the **SAME** GitHub repository.
3.  Configure the service:
    *   **Name**: `ai-resume-client`
    *   **Root Directory**: `client`
    *   **Build Command**: `npm run build`
    *   **Publish Directory**: `dist`
4.  **Environment Variables**:
    *   Key: `VITE_API_URL`
    *   Value: `https://ai-resume-server.onrender.com/api`  
        *(Paste the Backend URL you copied earlier, and append `/api` at the end)*.
5.  Click **Create Static Site**.
6.  Wait for deployment. Once done, visit your site URL!

## Troubleshooting
*   **CORS Errors**: If you see CORS errors in the browser console, ensure your backend is running and the URL in `VITE_API_URL` is correct.
*   **Database Connection**: Ensure your IP address on MongoDB Atlas Allowlist includes `0.0.0.0/0` (Access from Anywhere) since Render IPs change.
