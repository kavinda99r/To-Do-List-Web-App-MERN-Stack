# TaskMate

A task manager built with React, Tailwind CSS, Bootstrap Icons, Express, and MongoDB. It supports signup/login, private task lists, password changes, account deletion, and server-verified logout.

## Project structure

- `frontend/src/pages/`: home, authentication, tasks, and account pages.
- `frontend/src/components/`: header, loading indicator, and route guards.
- `frontend/src/styles.css`: shared design variables, typography, inputs, and buttons. Page layouts use Tailwind utilities in JSX.
- `frontend/src/api.js`: API URL and authorization headers.
- `frontend/src/session.js`: login/logout updates across browser tabs.
- `backend/server.js`: Express entry point, exported for Vercel.
- `backend/database.js`: MongoDB connection reuse.
- `backend/authenticate.js`: JWT and account checks.
- `backend/routes/`, `backend/models/`, `backend/tests/`: endpoints, data models, and automated tests.

## Run locally

Use Node.js 22.x, which is also selected in both package files for Vercel.

1. Install both applications from the repository root:

   ```powershell
   npm ci --prefix backend
   npm ci --prefix frontend
   ```

2. If you do not already have `backend/.env`, copy `backend/.env.example` to it. Set your MongoDB connection string and a random `JWT_SECRET`. Keep `PORT=5001`. Existing environment files should not be overwritten.
3. In one terminal, start the backend:

   ```powershell
   npm run dev --prefix backend
   ```

4. In another terminal, start React:

   ```powershell
   npm run dev --prefix frontend
   ```

5. Open the URL printed by Vite. Requests to `/api` are proxied to port 5001. Leave `VITE_API_URL` unset for this local setup.

## Deploy both applications to Vercel

Use **two Vercel projects connected to the same Git repository**. Do not select the repository root as the Root Directory.

| Setting | Backend project | Frontend project |
| --- | --- | --- |
| Example project name | `taskmate-api` | `taskmate-web` |
| Root Directory | `backend` | `frontend` |
| Framework Preset | Express | Vite |
| Node.js version | 22.x | 22.x |
| Install Command | `npm ci` | `npm ci` |
| Build Command | Leave the framework default | `npm run build` |
| Output Directory | Leave the framework default | `dist` |

Vercel supports an exported Express app directly. The frontend's `vercel.json` also provides the SPA fallback so `/login`, `/signup`, `/todos`, and `/profile` can be refreshed or opened directly. See the official [Express deployment instructions](https://vercel.com/docs/frameworks/backend/express), [Vite SPA instructions](https://vercel.com/docs/frameworks/frontend/vite), and [monorepo guide](https://vercel.com/docs/monorepos).

### 1. Prepare MongoDB Atlas

1. Create an Atlas cluster, or use your existing hosted cluster.
2. Create a database user with read/write access to the `taskmate` database. Use a unique password.
3. Copy the MongoDB driver connection string. Replace the username/password placeholders and include `/taskmate` before the query string. URL-encode special characters in the password.
4. Configure Atlas Network Access to allow connections from Vercel. Vercel's default outbound addresses are dynamic; Atlas's Vercel integration documents allowing `0.0.0.0/0` for that setup. This opens network access, so database credentials still need to be strong and limited to the application database. For restricted access, use a static-egress/private-network setup instead. See [Atlas's Vercel integration documentation](https://www.mongodb.com/docs/atlas/reference/partner-integrations/vercel/).

MongoDB runs in Atlas; deploying the backend to Vercel does not host a MongoDB server.

### 2. Prepare the Git repository

Push your application changes to GitHub. Keep `.env.example` files, but do not commit real `.env` files or credentials.

Check whether an existing environment file is tracked:

```powershell
git ls-files backend/.env
```

If it prints `backend/.env`, Git is already tracking it. To stop tracking it while preserving the local file:

```powershell
git rm --cached backend/.env
```

Commit that removal with the ignore rules. If real credentials have already been pushed, rotate them; removing the file does not erase older commits. The application update does not modify your existing `.env` or Git index automatically.

### 3. Deploy the backend first

1. Open Vercel, choose **Add New > Project**, and import the repository.
2. Set the project name, Root Directory, and framework using the backend column in the table above.
3. Add these variables for **Production**:

   | Variable | Value |
   | --- | --- |
   | `MONGO_URI` | Your Atlas connection string |
   | `JWT_SECRET` | A long random secret; keep this server-only |
   | `FRONTEND_URL` | Your frontend domain, if already known; otherwise add it after step 4 |

   Generate a secret on your computer with:

   ```powershell
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```

   `PORT` is not needed in Vercel. Vercel invokes the exported app.

4. Deploy. Copy the project's **production domain**, for example `https://taskmate-api.vercel.app`.
5. Open `https://YOUR-BACKEND.vercel.app/api/health`. It should return:

   ```json
   { "status": "ok" }
   ```

   This endpoint waits for MongoDB. If it returns 503, verify `MONGO_URI`, Atlas network access, database credentials, and `JWT_SECRET`. Use Vercel function logs to diagnose connection errors.

### 4. Deploy the frontend

1. Import the **same repository again**, as a second Vercel project.
2. Set Root Directory to `frontend` and Framework Preset to Vite.
3. Add this **Production** variable before building:

   ```text
   VITE_API_URL=https://YOUR-BACKEND.vercel.app/api
   ```

   Include `/api`. Use the real backend production domain, not localhost and not an individual temporary deployment URL.

4. Deploy and copy the frontend production domain, for example `https://taskmate-web.vercel.app`.

The API URL is public configuration. Never put `MONGO_URI` or `JWT_SECRET` in frontend variables. Vite embeds `VITE_` variables into the JavaScript bundle at build time, so changing them requires a frontend redeployment. See [Vite's environment-variable documentation](https://vite.dev/guide/env-and-mode).

### 5. Allow the frontend on the backend

1. Open the backend project's **Settings > Environment Variables**.
2. Set `FRONTEND_URL` to the exact frontend origin:

   ```text
   https://YOUR-FRONTEND.vercel.app
   ```

   Do not include a path such as `/todos`.
3. Redeploy the backend so the updated value takes effect.
4. Open the frontend and create a test account.

For a custom domain, add that origin too. Multiple trusted origins are comma-separated:

```text
https://taskmate-web.vercel.app,https://tasks.example.com
```

CORS restricts browser origins; JWT verification still protects the private API endpoints.

### 6. Check the live application

- Sign up and log in.
- Add, edit, complete, and delete a test task.
- Refresh `/todos` and `/profile` directly; neither should return a hosting 404.
- Change the test account's password and check that old sessions are rejected.
- Log out, type `/profile` manually, and confirm redirection to login.
- Delete the test account and verify that it can no longer sign in.

### 7. Configure previews and later updates

- Add environment variables to Vercel's **Preview** environment if you use preview deployments. Prefer a separate test database and secret there.
- Add each trusted frontend preview origin to the backend's `FRONTEND_URL`; the code does not allow every `*.vercel.app` domain automatically.
- Keep the API production URL stable. Git pushes create new deployments for the connected projects.
- Redeploy a project whenever its environment settings change.
- If a backend URL displays Vercel's authentication screen instead of JSON, Deployment Protection is intercepting the request. Use a production API endpoint accessible to the frontend; never put a protection-bypass secret in the browser bundle.

## Common deployment problems

| Symptom | Check |
| --- | --- |
| Refreshing a frontend route returns 404 | Root Directory is `frontend`, and `frontend/vercel.json` is included |
| Requests go to the frontend domain's `/api` | Set `VITE_API_URL` and rebuild the frontend |
| API returns HTML or the response is not an object | Check the API URL, `/api` suffix, and Deployment Protection |
| CORS error or HTTP 403 | Add the exact frontend origin to backend `FRONTEND_URL` and redeploy |
| Health check returns 503 | Check backend secrets, Atlas access, and database availability |
| Vercel deploys the wrong app | Use separate projects with `backend` and `frontend` Root Directories |

## Validate changes

Run from the repository root:

```powershell
npm test --prefix backend
npm run lint --prefix frontend
npm run build --prefix frontend
```

The automated backend tests use mocked models/connections, not your live Atlas database. A successful live health check and the manual checks above are still required after deployment.
