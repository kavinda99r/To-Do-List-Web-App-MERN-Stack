# TaskMate - To-Do List Web Application using MERN Stack ✅

This is a simple, responsive To-Do List application built using the MERN stack (MongoDB, Express, React, Node.js).

<h3>Key Features ✨</h3>

- Add Tasks: Create new to-do items with ease.
- Edit Tasks: Modify the existing tasks.
- Delete Tasks: Remove tasks when completed or no longer needed.
- Mark as Complete: Easily mark tasks as completed by checking them off, with a visual indicator for completed and pending tasks.
- Responsive Design: Fully responsive and mobile-friendly user interface.

<h3>Tech Stack 🛠️</h3>

- Frontend: React.js, Tailwind CSS, Bootstrap Icons
- Backend: Node.js, Express.js
- Database: MongoDB

<br>

<h2>Installation Guide 💻</h2>
1. Extract the project folder. <br>
2. Open the folder in VS Code. 

<h3>Install Dependencies</h3>

<h4>1. Navigate to the frontend directory and install dependencies</h4>

```
cd frontend
```
```
npm i
```

<h4>2. Install backend dependencies</h4>

```
cd ../backend
```
```
npm i
```

<h3>Running the Application</h3>

<h4>1. To run the backend, open a new terminal and use</h4>
<p>If you are already in the backend directory, run this in the terminal.</p>

```
npm start
```

<h4>2. To run the frontend, use the following commands</h4>

```
cd ../frontend
```
```
npm run dev
```

<h2> </h2>

<h3>Happy Coding! 🎉</h3>

---

## Project structure

- `frontend/src/pages/`: home, authentication, tasks, and account pages.
- `frontend/src/components/`: shared header, loading status, and route guards.
- `frontend/src/styles.css`: shared colors, fonts, typography, inputs, and buttons. Page layouts use Tailwind utilities directly in JSX.
- `frontend/src/api.js` and `session.js`: API access and session updates.
- `backend/routes/` and `models/`: API endpoints and database models.
- `backend/authenticate.js`: shared authentication middleware.
- `backend/tests/`: account and authentication endpoint tests.

Run `npm run lint` and `npm run build` in `frontend`, and `npm test` in `backend`.
