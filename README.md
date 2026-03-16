# Project Management Tool

A full-stack project management tool with JWT authentication, project management, task tracking, and MongoDB seed data.

## Tech Stack

### Frontend
- React.js
- TypeScript
- Vite
- Tailwind CSS
- React Router DOM
- Axios

### Backend
- FastAPI
- PyMongo
- JWT Authentication
- Passlib + bcrypt

### Database
- MongoDB Atlas / MongoDB

---

## Important Note

The original assignment preferred Node.js for the backend. However, Python backend was explicitly approved by the recruiter, so this project uses **FastAPI** for the backend while keeping **React + TypeScript** on the frontend and **MongoDB** as the database.

---

## Features

### Authentication
- User registration
- User login
- JWT-based authentication
- Password hashing using bcrypt

### Projects
- Create project
- View own projects
- Update project
- Delete project
- Project fields:
  - title
  - description
  - status (`active`, `completed`)

### Tasks
- Create tasks under a project
- View project tasks
- Update task
- Delete task
- Filter tasks by status
- Task fields:
  - title
  - description
  - status (`todo`, `in-progress`, `done`)
  - due date

### Seed Data
- One demo user:
  - `test@example.com`
  - `Test@123`
- At least 2 demo projects
- At least 3 tasks per project

---

## Project Structure

```text
project-management-tool/
├── backend/
│   ├── app/
│   │   ├── core/
│   │   │   ├── config.py
│   │   │   ├── database.py
│   │   │   ├── security.py
│   │   │   └── dependencies.py
│   │   ├── routes/
│   │   │   ├── auth.py
│   │   │   ├── projects.py
│   │   │   └── tasks.py
│   │   ├── schemas/
│   │   │   ├── auth.py
│   │   │   ├── project.py
│   │   │   └── task.py
│   │   └── main.py
│   ├── scripts/
│   │   └── seed.py
│   ├── .env.example
│   ├── requirements.txt
│   └── README.md
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── api/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── types/
│   │   ├── App.tsx
│   │   ├── main.tsx
│   │   └── index.css
│   ├── package.json
│   └── ...
│
└── README.md