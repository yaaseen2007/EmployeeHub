# EmployeeHub — Employee Management System

EmployeeHub is a full-stack employee management application built with Django REST Framework and React. It provides a dashboard to manage employee records through a REST API.

## Features

- Employee dashboard with total, active, inactive, and department statistics
- Create, read, update, and delete employee records
- Search employees by name, employee ID, designation, department, and email
- Filter employees by employment status and department
- Employee status badges and automatically generated avatars
- Form validation and confirmation before deleting records
- Export filtered employee records to CSV
- Responsive dashboard for desktop and mobile
- Django Admin for backend employee management

## Tech Stack

**Backend**
- Python
- Django
- Django REST Framework
- SQLite for local development
- PostgreSQL for production deployment

**Frontend**
- React
- Vite
- JavaScript
- CSS
- Lucide React icons

**Tools and Deployment**
- Git and GitHub
- Render

## Project Structure

```text
EmployeeHub/
├── .gitignore
├── README.md
├── employeehub/
│   ├── manage.py
│   ├── requirements.txt
│   ├── employeehub/
│   ├── employees/
│   └── api/
└── employeehub-frontend/
    ├── .env
    ├── package.json
    └── src/
```

## API Endpoints

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/api/v1/employees/` | List employees |
| POST | `/api/v1/employees/` | Create an employee |
| GET | `/api/v1/employees/<id>/` | Retrieve an employee |
| PUT | `/api/v1/employees/<id>/` | Update an employee |
| DELETE | `/api/v1/employees/<id>/` | Delete an employee |

## Run Locally

### 1. Backend

Open a terminal in the `employeehub` backend directory and activate your virtual environment.

Install dependencies:

```bash
pip install -r requirements.txt
```

Apply migrations:

```bash
python manage.py migrate
```

Start Django:

```bash
python manage.py runserver
```

Backend API: `http://127.0.0.1:8000/api/v1/employees/`

Django Admin: `http://127.0.0.1:8000/admin/`

### 2. Frontend

Open a second terminal in `employeehub-frontend`.

Install dependencies:

```bash
npm install
```

Create a local `.env` file containing:

```text
VITE_API_BASE_URL=http://127.0.0.1:8000/api/v1
```

Start React:

```bash
npm run dev
```

Frontend: `http://localhost:5173/`

Keep both development servers running while using the application locally.

## Deployment

The backend and frontend are deployed separately on Render from this repository.

- Backend: Render Web Service
- Database: PostgreSQL
- Frontend: Render Static Site

Production environment variables and service URLs must be configured in Render before the application can work online.

## Author

Developed as a full-stack portfolio project to practise REST APIs, database operations, React UI development, and deployment.
