# ECE1724 Project Team 35 - Note For All

## Team Members

| Name          | Student Number |
| ------------- | -------------- |
| Shifang Zhao  | 1005079451     |
| Yidi Wang     | 1008778716     |
| Zhouhan Jin   | 1006146699     |
| Ziqi Zhu      | 1006172204     |

## Motivation
Currently, students at universities can access only the materials instructors share on the course website, along with their personal notes from lectures. While additional resources such as practice problems and solution guides are available online, locating relevant and reliable materials often requires significant time and effort. As a result, students may struggle to efficiently find high-quality supplementary materials for specific courses.

To solve this problem, our project aims to create a centralized platform for students across majors and years to share course materials. The platform will make it simple for users to find study materials, practice questions, and notes, arranged first by major or department, then by specific courses. Students will be able to share their learning experiences, annotate documents, and access materials. This project increases accessibility to academic resources, decreases duplication of effort, and fosters collaborative learning. By developing an "open source" platform that enables students to learn more efficiently and get ready for tests confidently.

Our target users are university students, with an initial focus on students at the University of Toronto. Support both students and instructors who want to contribute and users seeking study materials. There will also be an administrator who is accessible to all files to maintain data integrity.

## Objectives
The primary objective of this project is to develop a centralized, open-source collaborative platform for university students to efficiently share and annotate course materials.

Our web application accomplishes this by providing a structured repository organized by department and course code, enabling users to easily find and contribute practice materials. Everyone can view the content without logging in, but can only comment after logging in. By integrating real-time annotations and a Role-Based Access Control system, the project fosters a secure, collaborative learning environment that reduces duplication of effort and helps students prepare for exams.

## Technical Stack
The approach we use is a separate frontend-backend architecture. The key technologies we use include: 
- Backend
Node.js with Express.js and TypeScript is used to implement all the backend APIs, including creating, reading, updating, and deleting certain data.

- Prisma ORM is used together with PostgreSQL for database access and managing data.

- Frontend
  - Frontend is developed using React and TypeScript, with Vite as the build tool and development server. The user interface is supported by Material UI, Radix UI, and Tailwind CSS

- Other Technologies
  - Socket.io is used to handle real-time updates when multiple users comment on the same document.

  - Files are stored with Digital Ocean Spaces Object Storage, with metadata stored in the database
  - bcrypt for password hashing
  - multer for file upload handling
  - nodemailer for email services
  - AWS S3 SDK for connecting to DigitalOcean Spaces as the file storage service
  - react-pdf and pdfjs-dist for PDF rendering on the frontend
  - Better-auth for user authentication

## Features

### Core Features

- File Uploads

An authenticated user can upload a file, and the file will be stored in DigitalOcean, and the file URL will be stored in PostgreSQL.

This satisfies the course project requirement because the application supports file upload. In addition, PostgreSQL and DigitalOcean are used. Also, this feature achieves our objective because this application aims to allow students to upload files for collaboration.

- File Annotation and Comments

Authenticated users can add annotations to any part of a file. In addition, the user can add a comment or reply to a comment sent by another user.

This satisfies the course project requirement because students can add annotations, comments, and replies in a file. Also, it achieves our objective because our application aims to allow students to collaborate effectively through annotations.


### Advanced Features
**User Authentication and Authorization**

A user needs to register an account to login. In addition, there is a format check on the email when a user registers an account. If a user is not logged in, the user cannot upload files, add annotations, or post comments. In addition, there is an admin account that can manage all files.

This satisfies the User Authentication and Authorization feature because there is user registration and login. In addition, there is an admin role which can manage all files. In addition, this feature achieves our objective because we just want registered users to upload files, add annotations, and post comments. In addition, an admin account would help with organizing files.


**Real-Time Functionality**

When a user adds an annotation or comment to a file, every user viewing that file would see it instantly without refreshing the page. In addition, when a user replies to another user's comment, the user will also see the reply instantly without refreshing the page. In addition, when a user replies to a comment from another user, the commenter will receive a real-time email notification.

This satisfies the Real-Time Functionality feature because real-time annotation, commenting, and replying support real-time collaboration. In addition, this feature achieves our goal because this application aims to provide a real-time update for effective collaboration.

**Integration with External APIs or Services**

The application integrates with services outside the team’s own API in two main ways. Uploaded course materials are stored in DigitalOcean Spaces using the S3-compatible API (via the AWS SDK), so persistence and public URLs depend on that cloud object store rather than local disk alone. For messaging, the backend uses Nodemailer over SMTP (e.g. Mailtrap in development) to send notification emails when a user replies to another user's annotation.

# User Guide


This section walks through every main feature of Note4All from a user's perspective.


## 1. Registration and Login

When you first visit the app, you will see the Dashboard. To access write features (uploading files, adding annotations), you must create an account.


1. Click the **Sign Up** or **Log In** button in the top-right corner of the Dashboard.
2. On the **Register** page (`/register`), enter your name, email, and password, then click **Sign Up**.
3. On the **Login** page (`/login`), enter your email and password, then click **Sign In**.
4. Once logged in, you are redirected back to the Dashboard. Your name appears in the top-right corner, along with a **Log Out** button.


## 2. Browsing Departments and Courses

The **Dashboard** (`/`) is the home page. It displays all departments in the left sidebar and all courses in the main area.

- **Filter by department:** Click a department name in the sidebar to show only courses belonging to that department. Click **All Departments** to reset the filter.
- **Search courses:** Use the search bar at the top to filter courses by code or title in real time.
- **View a course:** Click any course card to navigate to the Course Page.

Each course card displays a cover image, the course code, course title, department badge, and document count.


## 3. Creating Departments and Courses

Logged-in users can create new departments and courses from the Dashboard sidebar.

**Create a department:**
1. Scroll to the bottom of the left sidebar.
2. Under **Add department**, enter the department name and code (e.g., "Computer Science" / "CSC").
3. Click **Add Department**. The new department appears immediately in the sidebar.


**Create a course:**
1. Under **Add course** in the sidebar, enter the course code (e.g., "CSC148"), the course title (e.g., "Intro to CS"), and select a department from the dropdown.
2. Click **Add**. The new course appears in the main grid.


> **Admin only:** Admin users see a **✕** button next to each department and course card for deletion.


## 4. Uploading Files

From the **Course Page** (`/course/:courseCode`), logged-in users can upload files to a course.


1. Click **Choose file** to open the file picker, then select a PDF or other document.
2. The selected file name appears. Click **Upload** to upload it to cloud storage.
3. The uploaded file appears in the file list. You are automatically granted **Owner** permission on the file.


## 5. Viewing and Managing Files

The Course Page lists all files for a course. Each file card shows:
- The file title and uploader
- An **Open** button — navigates to the in-app Document Viewer
- A **Download** button — opens the raw file from cloud storage in a new tab
- A **Delete** button (visible only to the file Owner or an Admin) — permanently deletes the file and all its annotations


## 6. Reading PDFs in the Document Viewer

Clicking **Open** on a file takes you to the **Document Viewer** (`/course/:courseCode/file/:fileId`).


- The PDF is rendered page-by-page directly in the browser.
- Use the scroll to navigate through pages.
- Click **Download** in the top-right header to download the original file.
- Click **Back** to return to the Course Page.


## 7. Creating Text-Anchored Annotations

The Document Viewer features a right sidebar for annotations. Logged-in users can annotate specific text passages:

1. **Select text** on the PDF by clicking and dragging across a passage.
2. A dark **"Annotate"** button appears near your selection.
3. Click **Annotate**. The sidebar shows a yellow banner quoting the selected text and the page number.
4. Type your comment in the text box and press **Enter** or click the **Send** button.
5. The annotation is saved and appears in the sidebar with a yellow highlight badge showing the quoted text.
6. The highlighted text on the PDF page is overlaid with a colored highlight that persists for all users.


You can also post **general comments** (not anchored to specific text) by simply typing in the text box without selecting any text first.


## 8. Replying to Annotations

Annotations support threaded replies:

1. Click the **Reply** button on any annotation in the sidebar.
2. A blue "Replying to annotation #..." banner appears above the text input.
3. Type your reply and press **Enter** or click **Send**.
4. The reply appears indented under the parent annotation.

Click **✕** on the reply banner to cancel and return to general comment mode.


## 9. Real-Time Collaboration

Annotations and replies update in real time via Socket.IO:

- When another user posts an annotation or reply on the same document, it appears instantly in your sidebar without refreshing.
- Highlight overlays on the PDF also update automatically.
- To test this, open the same document URL in two browser tabs (or two different browsers with different accounts).


## 10. Interacting with Highlights

- **Click an annotation** in the sidebar to highlight it in yellow and scroll the PDF to the corresponding page.
- **Click the highlight overlay** on the PDF to highlight the corresponding annotation in the sidebar.
- Click the same annotation again to deselect it.


## 11. Deleting Annotations

- Each annotation and reply shows a **trash icon** (🗑). Click it to delete.
- You can only delete **your own** annotations. If you try to delete someone else's, a teal toast notification appears: *"You can only delete your own annotations."*
- **Admin users** can delete any annotation.
- Deleting a parent annotation automatically deletes all its replies.

# Development Guide


This guide provides step-by-step instructions to set up the development environment for the project, encompassing environment configuration, database initialization, cloud storage setup, and local development and testing.


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
FILE_BUCKET_BASE="https://ece1724-final-project.tor1.digitaloceanspaces.com/"


# Mailtrap Configuration (CHECK EMAIL FOR REAL API KEY)
MAILTRAP_USER="<paste_key_from_email>"
MAILTRAP_PASS="<paste_key_from_email>"


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

We use Postman for endpoint testing, example template can be import from file `end_point_test.json` and set environment varaible `base_url` to `localhost:3000/api`. Frontend UI and file upload/download features are tested manually.

# AI Assistance & Verification
AI tools were used in various parts of the project and were overall very helpful, though they still required human judgment and were not always fully compatible with our implementation. The models we used include ChatGPT and Claude 4.6 Opus (via Cursor). These tools assisted with detailed technical tasks, such as suggesting database improvements (e.g., using `onDelete: Cascade` in the schema to simplify deletion logic), and helped us quickly implement new features we were initially unfamiliar with, such as the file upload functionality described in `ai-session.md`. Additionally, they supported parts of the debugging process, although their suggestions sometimes needed adjustment to fit our specific setup.

One example of limitation in AI is shown by the first session in `ai-session.md` where a member ask for how to implement file upload feature. The AI-generated solution focused primarily on backend implementation but failed to consider differences in client-side request formats across testing tools. In particular, it did not highlight that file upload endpoints using `multer` require properly formatted `multipart/form-data` requests. As a result, when testing with IntelliJ’s .http tool, the request was incorrectly formatted, causing the endpoint to fail even though the backend implementation was correct.



# Individual Contributions


In alignment with our team's Git commit history, the specific contributions of each team member are outlined below, all reports are edit together:


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
- **API Integration & Logic:** Handled file uploading logic (S3 client configuration and UI modal), Course lookups, and Document viewer routing.

# Lessons Learned and Concluding Remarks
Building Note4All reinforced how much of a full-stack project comes down to integration, not just individual features. Connecting Express, Prisma, PostgreSQL, DigitalOcean Spaces, Better Auth, Socket.IO, and a PDF-heavy React client meant that problems almost always showed up at the boundaries, like CORS and proxying for PDFs, credential loading order for SMTP, or migration state drifting from the actual data.

On the product side, combining role-based access at both the app level and the per-file level taught us to model permissions explicitly early; ambiguous rules become expensive to fix once annotations and real-time events depend on them. Besides, real-time annotations also surfaced UX and consistency challenges we hadn't fully anticipated, keeping sidebar state, highlights, and sockets in sync. PDF text selection for anchored comments pushed us into browser-level and react-pdf/pdf.js behavior that differs from typical form-based UIs.

On the team side, dividing ownership by domain (auth, files, annotations, real-time, UI) mapped well onto the architecture, but it required clear interfaces between front and back end and disciplined use of Git version control and branch.

With an increasingly AI-driven workflow, we learned that relying uncritically on any single tool or generated answer can cause more trouble than it solves. Following the course's "First Think, Then AI" principle is wise, we made our own design decisions first, then brought AI in to explore alternatives, debug integration issues, and speed up well-scoped implementation. Every suggestion was reviewed against our actual stack and verified with real runs and tests, since we found early on that no generated answer could be taken without independent thinking.

Overall, the project deepened our understanding of building a collaborative, data-backed web application under real constraints. We are proud to have delivered a working path from department and course organization through upload, in-browser reading, threaded annotations, live updates, and optional email notifications—steps toward the broader goal of making course materials easier to share and discuss. If we continued, we would invest in broader automated tests, stricter validation of uploads on the server, and clearer operational runbooks for deployment and secrets, so the platform remains maintainable as features and contributors grow.

# Video Demo
https://utoronto-my.sharepoint.com/:v:/g/personal/zhouhan_jin_mail_utoronto_ca/IQB22chwKXsNQpCwjubwC1F4ATofp1o0P-v8cc97sbFyJeM?nav=eyJyZWZlcnJhbEluZm8iOnsicmVmZXJyYWxBcHAiOiJPbmVEcml2ZUZvckJ1c2luZXNzIiwicmVmZXJyYWxBcHBQbGF0Zm9ybSI6IldlYiIsInJlZmVycmFsTW9kZSI6InZpZXciLCJyZWZlcnJhbFZpZXciOiJNeUZpbGVzTGlua0NvcHkifX0&e=8wsMJQ
