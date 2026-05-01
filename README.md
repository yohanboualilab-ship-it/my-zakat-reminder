# My Zakat Reminder

Welcome to the My Zakat Reminder application! This guide is for anyone who wants to understand how this project is organized, especially if you're new to modern web development frameworks like Next.js.

## Preview

![Dashboard preview — signed-in user view](docs/dashboard-preview.png)

## What is this project built with?

This project is built using [Next.js](https://nextjs.org/), which is a popular framework for creating web applications with [React](https://react.dev/). Think of React as a library for building user interfaces (like buttons, forms, and text), and Next.js as a tool that organizes the React code into a full-fledged application with pages, navigation, and more. We also use [TypeScript](https://www.typescriptlang.org/), which adds extra safety features to JavaScript.

The backend (auth, database, storage) runs on [Supabase](https://supabase.com/). For local development, the project uses the Supabase CLI to run the entire backend stack in Docker — no cloud project needed.

## Run the project locally

### Prerequisites

- [Node.js](https://nodejs.org/) 18+ and npm
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (running)
- [Supabase CLI](https://supabase.com/docs/guides/local-development/cli/getting-started) (`brew install supabase/tap/supabase` on macOS)

### 1. Install frontend dependencies

```bash
cd frontend
npm install
```

### 2. Start the Supabase local stack

From the repo root:

```bash
supabase start
```

The first run pulls Docker images (~1 GB, a few minutes). Once it's up, `supabase status` prints the URLs and keys you need:

- **API URL**: `http://127.0.0.1:54321`
- **Studio (admin UI)**: `http://127.0.0.1:54323`
- **Mailpit (catches confirmation emails sent in local mode)**: `http://127.0.0.1:54324`
- **Postgres**: `postgresql://postgres:postgres@127.0.0.1:54322/postgres`
- **Publishable key**: `sb_publishable_...` (use this as the anon key)

### 3. Configure environment variables

Create `frontend/.env.local`:

```
NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=<publishable key from `supabase status`>
```

This file is git-ignored — never commit it.

### 4. Run the Next.js dev server

```bash
cd frontend
npm run dev
```

Open http://localhost:3000.

### Sign up flow in local mode

When you create an account, Supabase sends a confirmation email. Locally, that email is captured by **Mailpit** at http://127.0.0.1:54324 — open the message and click the link to confirm.

### Stopping everything

```bash
# Stop the dev server: Ctrl+C in its terminal
supabase stop      # stops the Docker containers (data persists)
supabase stop --no-backup   # stops and wipes local DB
```

## Project Structure

Here’s a breakdown of the most important files and folders in this project.

### `/public`

This folder contains static files that are directly accessible from the browser. This is the perfect place for images, icons (`favicon.ico`), and other assets that don't need to be processed by the application's code.

- `vercel.svg`, `next.svg`: Example images.
- `/icons`: Contains all the application icons for different devices (Android, Apple, etc.).

### `/src`

This is where all the source code for our application lives.

#### `/src/app`

This is the heart of our application. Next.js uses a file-system-based router, which means the folder structure inside `/app` defines the URL structure of our website.

- **`layout.tsx`**: This is the main template for all pages. It usually includes the basic HTML structure (`<html>`, `<body>` tags), the header, footer, and any navigation bars that should be present on every page.
- **`page.tsx`**: This is the homepage of the application (the one you see when you visit the main URL).
- **`globals.css`**: This file contains styles that apply to the entire application.
- **`/dashboard/page.tsx`**: This creates a new page at the URL `/dashboard`. Any file named `page.tsx` inside a folder creates a new public page.
- **`/login/page.tsx`**: This creates the login page at `/login`.
- **`/api`**: This folder is special. It's used to create backend API endpoints. For example, `/api/gold-price/route.ts` defines a server-side function that the frontend can call to get the current price of gold. These are like mini-servers running alongside our frontend.

#### `/src/components`

This folder holds reusable pieces of the user interface. For example, if we have a styled button or a date picker that we use in multiple places, we would define it here once and import it wherever we need it.

- **`HijriDatePicker.tsx`**: A custom component for picking a Hijri date.

#### `/src/contexts`

Contexts are a way to share data across many components without having to pass it down manually through every level.

- **`AuthContext.tsx`**: This likely manages the user's authentication state (e.g., whether the user is logged in or not) and makes this information available to any part of the app that needs it.

#### `/src/lib`

This folder contains helper functions, utility code, and connections to external services.

- **`hijri-utils.ts`**: Contains utility functions related to the Hijri calendar.
- **`/supabase`**: This folder contains code for connecting to [Supabase](https://supabase.com/), which is a backend service we use for things like database storage and user authentication.
  - `client.ts`: Code for connecting to Supabase from the user's browser.
  - `server.ts`: Code for connecting to Supabase from our server-side code (like in the `/api` routes).

#### `/src/types`

When using TypeScript, it's good practice to define the "shape" of our data. This folder holds these definitions.

- **`database.ts`**: This file likely contains TypeScript types that describe the structure of our database tables.

### Root-level Configuration Files

These files are in the main `frontend/` directory and configure how the project works.

- **`next.config.ts`**: The main configuration file for Next.js. You can use it to customize its behavior.
- **`package.json`**: This is a standard file in modern JavaScript projects. It lists all the external libraries (dependencies) the project needs to run, and also defines convenient scripts (e.g., `npm run dev` to start the development server).
- **`tsconfig.json`**: The configuration file for TypeScript. It tells the TypeScript compiler how to check our code for errors.

## How It All Works: A Simple Flow

1.  A user visits a URL in their browser (e.g., `https://your-app.com/dashboard`).
2.  Next.js looks inside the `/src/app` folder to find a matching page. It finds `/src/app/dashboard/page.tsx`.
3.  Next.js takes the `layout.tsx` file and wraps the content of `dashboard/page.tsx` inside it.
4.  If the page needs to fetch data (e.g., from our `/api/gold-price` endpoint or an external service), it does so.
5.  Next.js renders the complete HTML for the page and sends it to the user's browser.
6.  The browser displays the page. From this point on, React takes over to make the page interactive (e.g., handling button clicks, form submissions).

We hope this guide helps you navigate the