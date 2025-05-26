# Online CV Builder

## Overview

The Online CV Builder is a web application designed to help users create, customize, and manage their curriculum vitae (CVs) with ease. Users can upload existing CVs (e.g., from LinkedIn PDFs), parse their content, choose from various templates, and customize them to create professional-looking CVs.

The application features a client-server architecture:
*   **Frontend:** Developed with React (using Vite), TypeScript, and Tailwind CSS.
*   **Backend:** Developed with Node.js, Express, TypeScript, PostgreSQL, and Sequelize ORM.

## Features Implemented So Far

### Backend
*   **Core CV Data Handling:**
    *   PDF parsing service for extracting text from uploaded CVs (initial heuristics implemented).
    *   API endpoints for CV upload (`POST /api/cvs/upload`) and update (`PUT /api/cvs/:id`).
*   **Authentication Flow:**
    *   User registration (`POST /api/auth/register`).
    *   User login (`POST /api/auth/login`) with JWT access tokens.
    *   Refresh token mechanism (`POST /api/auth/refresh-token`) for session persistence, including token rotation.
    *   Forgot password (`POST /api/auth/forgot-password`) functionality, generating a secure reset token.
    *   Reset password (`POST /api/auth/reset-password`) functionality using the token.
    *   Database models and migrations for `User`, `RefreshToken`, and `PasswordResetToken`.

### Frontend
*   **Landing Page (`/`):**
    *   Responsive header with navigation.
    *   Hero section with a clear Call to Action (CTA).
    *   "How it Works" section explaining the CV building process.
    *   "Template Preview" section showcasing available CV templates.
    *   Responsive footer with site links.
*   **Authentication Flow (UI & Logic):**
    *   Login page (`/login`) with API integration.
    *   Registration page (`/register`) with API integration and client-side validation.
    *   Forgot Password page (`/forgot-password`) to request a password reset link.
    *   Reset Password page (`/reset-password`) to set a new password using a token from the URL.
    *   `AuthContext` for global authentication state management (user, tokens, loading status).
    *   Axios instance with interceptors for:
        *   Automatically attaching JWT access tokens to outgoing requests.
        *   Handling 401 errors to automatically refresh access tokens using the refresh token.
    *   `ProtectedRoute` component to guard routes requiring authentication (e.g., `/dashboard`, `/cv-editor`).
*   **Basic Page Structure:** Placeholder pages for Dashboard and CV Editor.

## Backend Setup

### Prerequisites
*   **Node.js:** v18.x or later recommended.
*   **npm** (comes with Node.js) or **yarn**.
*   **PostgreSQL:** A running PostgreSQL server instance.

### Environment Variables
1.  Navigate to the `backend` directory: `cd backend`
2.  Copy the example environment file: `cp .env.example .env`
3.  Edit the `backend/.env` file and configure the following variables:
    *   `PORT`: Port for the backend server (e.g., `3001`).
    *   `DB_HOST`: Your PostgreSQL host (e.g., `localhost`).
    *   `DB_PORT`: Your PostgreSQL port (e.g., `5432`).
    *   `DB_USER`: Your PostgreSQL username.
    *   `DB_PASS`: Your PostgreSQL password.
    *   `DB_NAME`: The name of your PostgreSQL database (e.g., `cv_builder_db`).
    *   `DB_SSL`: Set to `true` if your PostgreSQL connection requires SSL (e.g., for some cloud providers), otherwise `false`.
    *   `JWT_SECRET`: A strong, unique secret key for signing JWTs.
    *   `JWT_EXPIRES_IN`: Expiration time for JWT access tokens (e.g., `1h`, `15m`).
    *   `REFRESH_TOKEN_EXPIRATION_DAYS`: Validity duration for refresh tokens (e.g., `7`).
    *   `PASSWORD_RESET_TOKEN_EXPIRATION_MINUTES`: Validity duration for password reset tokens (e.g., `60`).
    *   `FRONTEND_URL`: The base URL of your frontend application (e.g., `http://localhost:5173` or `http://localhost:3000`). This is used for constructing password reset links.
    *   `STRIPE_*` variables can be left blank if Stripe integration is not yet active.

### Database Setup
1.  Ensure your PostgreSQL server is running.
2.  Create the database specified in `DB_NAME` if it doesn't already exist. You can use a tool like `psql` or pgAdmin.
    ```sql
    -- Example using psql:
    -- CREATE DATABASE cv_builder_db;
    ```
3.  Run database migrations:
    *   Navigate to the backend directory: `cd backend`
    *   Ensure `sequelize-cli` is installed as a dev dependency (it should be if you followed previous steps or run `npm install`).
    *   Execute: `npx sequelize-cli db:migrate`
        *   This command uses the `config/config.json` for `sequelize-cli`. Ensure this file is present and correctly configured if you customized the `sequelize-cli init` process. By default, it might expect environment variables like `DB_USER`, `DB_PASS`, etc., to be directly available, or you might need to adjust `config/config.json` to use the settings from your `.env` file (though `sequelize-cli` doesn't directly load `.env` files in the same way the application does without custom configuration). The application's `src/config/index.ts` is used at runtime, not by the CLI directly for migrations without specific setup.

### Dependencies
1.  Navigate to the backend directory: `cd backend`
2.  Install dependencies: `npm install` (or `yarn install`)

### Running the Development Server
1.  Navigate to the backend directory: `cd backend`
2.  Start the server: `npm run dev` (or `yarn dev`)
3.  The backend server should typically be running on the `PORT` specified in your `.env` file (e.g., `http://localhost:3001`).

### API Endpoints
API routes are defined in `backend/src/routes` and are generally prefixed with `/api`.
Key examples:
*   Auth: `/api/auth/register`, `/api/auth/login`, `/api/auth/refresh-token`, `/api/auth/forgot-password`, `/api/auth/reset-password`
*   CVs: `/api/cvs/upload`, `/api/cvs/:id` (PUT)

## Frontend Setup

### Prerequisites
*   **Node.js:** v18.x or later recommended.
*   **npm** (comes with Node.js) or **yarn**.

### Environment Variables
1.  Navigate to the `frontend` directory: `cd frontend`
2.  Create a `.env` file in the `frontend` directory (e.g., `frontend/.env`).
3.  Add the following variable, adjusting the port if your backend runs on a different one:
    ```
    REACT_APP_API_BASE_URL=http://localhost:3001/api
    ```
    *   Note: For Vite-based React projects (which this is), environment variables should be prefixed with `VITE_` (e.g., `VITE_API_BASE_URL`) instead of `REACT_APP_`. The `axiosInstance.ts` file has been updated to reflect this. Create a `.env` file in the `frontend` directory with:
        ```
        VITE_API_BASE_URL=http://localhost:3001/api
        ```

### Dependencies
1.  Navigate to the frontend directory: `cd frontend`
2.  Install dependencies: `npm install` (or `yarn install`)

### Running the Development Server
1.  Navigate to the frontend directory: `cd frontend`
2.  Start the server: `npm run dev` (or `yarn dev` for Vite, or `npm start` / `yarn start` for Create React App)
3.  The frontend development server typically runs on `http://localhost:5173` (Vite default) or `http://localhost:3000` (CRA default).

## Project Structure Overview

*   **`/backend`**: Contains the Node.js/Express.js server-side application.
    *   `src/`: Source code (controllers, services, models, routes, config, etc.).
    *   `migrations/`: Database migration files generated by Sequelize.
    *   `config/config.json`: Sequelize CLI configuration (primarily for migrations).
    *   `.env.example`: Example environment variables.
*   **`/frontend`**: Contains the React (Vite) client-side application.
    *   `src/`: Source code (components, pages, context, utils, etc.).
    *   `.env`: (To be created by user) for environment-specific variables like `VITE_API_BASE_URL`.

---

This README provides a comprehensive guide to getting the Online CV Builder application up and running.
If you encounter any issues, please ensure all prerequisites are met and environment variables are correctly configured.
```
