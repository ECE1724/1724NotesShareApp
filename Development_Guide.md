# 1724NotesShareApp Development Guide

This guide provides step-by-step instructions to set up the development environment for the 1724NotesShareApp project, encompassing environment configuration, database initialization, cloud storage setup, and local development and testing.

## 1. Environment Setup and Configuration

The application is structured into a `backend` (Node.js/Express) and a `frontend` (React/Vite).

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- `npm` package manager
- PostgreSQL database instance (running locally or remotely)

### Installation
1. Clone the repository and navigate to the project directory:
   ```bash
   git clone <repository_url>
   cd 1724NotesShareApp
   ```
2. Install the backend dependencies:
   ```bash
   cd backend
   npm install
   ```
3. Install the frontend dependencies:
   ```bash
   cd ../frontend
   npm install
   ```

### Configuration
Create a `.env` file in the `backend/` directory.

> **Note:** The access keys for DigitalOcean Spaces and the API keys for Mailtrap have been **sent via email**. Please refer to that email to fill in the placeholders below.

Example `backend/.env` structure:
```env
# Database configuration
DATABASE_URL="postgresql://<user>:<password>@localhost:5433/notesharedb"

# DigitalOcean Spaces configuration (CHECK EMAIL FOR REAL KEYS)
DIGITALOCEAN_BASE="https://tor1.digitaloceanspaces.com"
DIGITALOCEAN_REGION="tor1"
DIGITALOCEAN_KEY="<paste_key_from_email>"
DIGITALOCEAN_SECRET="<paste_secret_from_email>"

# Mailtrap Configuration (CHECK EMAIL FOR REAL API KEY)
MAILTRAP_TOKEN="<paste_key_from_email>"

# Server Config
PORT=3000
BETTER_AUTH_URL="http://localhost:3000"
BETTER_AUTH_SECRET="noteshare-dev-secret-change-in-prod"
```

## 2. Database Initialization

The backend uses **Prisma** to manage the PostgreSQL database schema and migrations.

1. Ensure your PostgreSQL instance is running and your `DATABASE_URL` is correctly configured in your `.env`.
2. Generate the Prisma Client to sync types:
   ```bash
   cd backend
   npx prisma generate
   ```
3. Run migrations to initialize the database schema:
   ```bash
   npx prisma migrate dev
   ```
4. Seed the database with initial sample data (e.g., users, departments, courses):
   ```bash
   npx prisma db seed
   ```

## 3. Cloud Storage Configuration

We utilize **DigitalOcean Spaces** (S3-compatible storage) for storing course documents safely in the cloud.

1. Make sure you have placed the `DIGITALOCEAN_KEY` and `DIGITALOCEAN_SECRET` into your `.env` file from the TA email.
2. The endpoints and bucket names are already handled in the codebase. When the backend service spins up, it will connect to DigitalOcean and use these credentials to securely upload documents whenever the frontend dispatches a file. 

## 4. Local Development and Testing

### Start the Backend Server
1. Open a terminal and navigate to the `backend` folder:
   ```bash
   cd backend
   npm run dev
   ```
2. The backend server and API endpoints will be accessible at `http://localhost:3000`.

### Start the Frontend Application
1. Open a new terminal and navigate to the `frontend` folder:
   ```bash
   cd frontend
   npm run dev
   ```
2. The Vite development server will launch the application (typically at `http://localhost:5173`).

### Local API Testing

You can quickly verify that the core backend features are functioning correctly using `curl` commands in your terminal.

#### 1. Fetching Departments
Verify the database connection and seeding by retrieving the list of departments:
```bash
curl -i http://localhost:3000/api/departments
```
If the database was seeded properly, it should return a JSON array of departments (e.g., ECE, MIE).

#### 2. Fetching Courses
Using an ID (e.g., `1`) from the departments result, fetch the courses associated with it:
```bash
curl -i http://localhost:3000/api/courses/department/1
```
This correctly returns the courses along with the document count from Prisma relations.

#### 3. Fetching Files
Verify fetching all document items listed under a specific course:
```bash
curl -i http://localhost:3000/api/files/course/1
```

#### 4. Testing S3 Cloud Upload
Test if the DigitalOcean file upload endpoint is responding. Before executing, replace `<your_file_name.pdf>`, `<course_id>`, and `<owner_id>` with actual values (you can find user IDs in the Prisma Studio or the database test data):

```bash
curl -X POST http://localhost:3000/api/files \
  -F file=@<your_file_name.pdf> \
  -F courseId=<course_id> \
  -F ownerId=<owner_id>
```
If the environment keys are correctly configured, the backend will upload the specified file to the Space and return the created record.

#### 5. User Authentication Session verification (Better Auth)
Check if the local authentication engine intercepts APIs gracefully:
```bash
curl -i http://localhost:3000/api/auth/get-session
```

## 5. Individual Contributions

In alignment with our team's Git commit history, the specific contributions of each team member are outlined below:


### Ziqi Zhu (@zzq20010617)
- **Backend Architecture & Database Setup:** Created the initial backend layout, PostgreSQL schemas, and database seed data scripts.
- **REST APIs:** Implemented core backend endpoints for Departments, Courses (GET lists and by ID), and initial user registration/login endpoints.
- **Email Notifications:** Built the notification layer (via Mailtrap / Nodemailer) to dispatch emails when a user's annotation receives a reply.
- **Annotation APIs:** Architected the REST endpoint backend logic for retrieving and storing annotation metadata.

### Zhouhan Jin (@David)
- **Real-Time Textual Annotations:** Integrated real-time textual annotations connecting the frontend UI to the backend using Socket.IO, enabling live broadcasting of comments on PDF files.
- **Role-Based Access Control (RBAC):** Designed and implemented role-based permissions, including seeding standard and admin accounts, and implementing administrative actions (cascading deletes for departments, courses, and files).
- **UI Enhancements:** Polished visual elements, unified button consistencies, introduced feedback for unauthenticated actions, and added the application logo/icons ("Note4All").

### Shifang Zhao (@Shifang Zhao)
- **File Access System:** Engineered the backend data modeling and endpoints logic for creating, updating, and managing File Access Control Levels (viewing/editing permissions).
- **Core Entity Creation Methods:** Implemented foundational creation and hard-delete logic for core API domains (Files, Departments, and Courses).
- **Documentation:** Drafted and updated the initial repository README instructions. 

### Yidi Wang (@ED0925)
- **Frontend Architecture & UI Integration:** Scaffolded the initial Vite + React + Tailwind + Socket.IO client. Translated Figma wireframes into functional UI components (`Dashboard`, `CoursePage`, etc.).
- **Authentication System:** Integrated the `better-auth` system for secure session management across the entire stack.
- **API Integration & Core Logic:** Handled file uploading logic (S3 client configuration and UI modal), Course lookups, and Document viewer routing. 