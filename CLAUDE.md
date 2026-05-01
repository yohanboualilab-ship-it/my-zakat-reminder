# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a French-language Zakat reminder web application that helps Muslims track when they need to pay Zakat based on current gold prices and the Islamic calendar. The application consists of:

- **Frontend**: Next.js 15 application with React components and TypeScript
- **Email Service**: Python service using Mailgun API for sending reminder emails
- **External APIs**: Supabase Edge Functions for gold prices and Hijri date conversion

## Project Structure

### Frontend (Next.js App)
- `frontend/` - Next.js application directory
  - `src/app/` - App Router directory structure
    - `page.tsx` - Home page displaying gold prices, nissab value, and Hijri date
    - `login/page.tsx` - User authentication page with Supabase auth
    - `dashboard/page.tsx` - Protected user dashboard for managing Zakat reminders
    - `api/` - API routes for server-side functionality
      - `gold-price/route.ts` - Proxy for gold price API
      - `hijri-date/route.ts` - Proxy for Hijri date API
    - `layout.tsx` - Root layout with Bootstrap, Font Awesome, and AuthProvider
    - `globals.css` - Custom CSS styles (converted from original style.css)
  - `src/components/` - Reusable React components
    - `HijriDatePicker.tsx` - Custom Hijri calendar date picker component
  - `src/contexts/` - React contexts for state management
    - `AuthContext.tsx` - Authentication context with Supabase integration
  - `src/lib/` - Utility libraries and configurations
    - `hijri-utils.ts` - Hijri/Gregorian date conversion utilities with built-in algorithms
    - `supabase/` - Supabase client configuration
      - `client.ts` - Client-side Supabase client
      - `server.ts` - Server-side Supabase client
  - `src/types/` - TypeScript type definitions
    - `database.ts` - Database schema types for Supabase
  - `middleware.ts` - Next.js middleware for route protection
  - `public/icons/` - Favicon and app icons for various platforms

### Legacy Files (Original Implementation)
- `old_front/` - Archived original static implementation
  - `index.html` - Original static landing page
  - `login.html` - Original static authentication page
  - `script.js` - Original vanilla JS logic
  - `login.js` - Original authentication toggle logic
  - `style.css` - Original CSS styles
  - `icons/` - Original favicon and app icons

### Email Service
- `email_sender/` - Python module for sending email reminders via Mailgun
  - `main.py` - Core email sending functionality
  - `pyproject.toml` - Python dependencies (requests library)
  - `uv.lock` - Dependency lock file

## Development Commands

### Next.js Frontend
```bash
# Navigate to frontend directory
cd frontend/

# Install dependencies
npm install

# Run development server (with Turbopack)
npm run dev

# Build for production (with Turbopack)
npm run build

# Start production server
npm start

# Run linting
npm run lint
```

### Python Email Service
```bash
# Navigate to email sender directory
cd email_sender/

# Install dependencies (requires uv)
uv install

# Run the email sender
python main.py
```

## Architecture Notes

### Frontend Architecture
- **Next.js 15** with App Router, TypeScript, and Turbopack for enhanced development performance
- **React 19** with client-side state management using hooks
- **Bootstrap 5.3.8** for responsive UI components (loaded via npm and CDN)
- **React Bootstrap 2.10.10** for React-compatible Bootstrap components
- **Font Awesome 6.4.0** for icons (loaded via CDN)
- **Google Fonts (Poppins)** for typography via Next.js font optimization
- **Hijri Date Libraries** for Islamic calendar functionality:
  - Custom built-in algorithms for Hijri/Gregorian date conversion
  - `hijri-date` and `moment-hijri` packages as fallbacks
- **Custom CSS** in globals.css preserving original design system

### API Integration
- **Internal API Routes**: `/api/gold-price` and `/api/hijri-date` (Next.js API routes)
- **External APIs**: Supabase Edge Functions proxied through internal routes
  - Gold Price: `https://dypkjnewrldcnpsegwxo.supabase.co/functions/v1/gold-price`
  - Hijri Date: `https://dypkjnewrldcnpsegwxo.functions.supabase.co/hijri-date`
- **Authentication**: Supabase bearer token (can be configured via `SUPABASE_ANON_KEY` env var)
- **Fallback Values**: Hardcoded in case of API failures (gold: 92.45€)

### Email Service
- Uses Mailgun API for transactional emails
- Environment variable `API_KEY` required for Mailgun authentication
- Hardcoded recipient and sandbox domain (development setup)

### Key Business Logic
- **Nissab Calculation**: 85 grams of gold × current gold price per gram
- **Zakat Rate**: 2.5% of wealth above nissab threshold (not implemented in current codebase)
- **Date Display**: Shows current Hijri date alongside Gregorian calendar
- **Hijri Calendar System**: Custom implementation using Islamic tabular calendar algorithms
  - 30-year cycle with leap years following Kuwaiti algorithm
  - Julian Day Number conversion for accuracy
  - Built-in month lengths and validation

### UI Components
- **HijriDatePicker**: Custom dropdown component for selecting Islamic calendar dates
  - Year/month/day selection with proper validation
  - Supports both French and Arabic month names
  - Integrated with hijri-utils for accurate date conversion
  - Fallback algorithms independent of external libraries

## Authentication

The application now includes full Supabase authentication with:

### Features Implemented
- **User Registration/Login**: Email and password authentication via Supabase
- **Protected Routes**: Dashboard accessible only to authenticated users  
- **Session Management**: Automatic session handling and persistence
- **Route Protection**: Middleware redirects unauthenticated users to login
- **User Context**: React context provides auth state throughout the app

### Authentication Flow
1. **Public Access**: Home page shows gold prices and Zakat information to all users
2. **Registration/Login**: Users can create accounts or sign in via `/login`
3. **Email Verification**: New users receive email confirmation (Supabase handles this)
4. **Protected Dashboard**: Authenticated users access `/dashboard` for reminder management
5. **Auto Redirect**: Middleware handles automatic redirects based on auth state

### Database Schema (Supabase)
- **Users Table**: Managed automatically by Supabase Auth
- **Profiles Table**: Extended user information (optional)
- **Zakat Reminders Table**: User reminder scheduling (structure defined, implementation pending)

### Missing Components
- Reminder email scheduling implementation (backend logic)
- Database operations for storing/retrieving user reminders
- Integration with email service for sending scheduled reminders

## Environment Variables
- `API_KEY` - Mailgun API key for email sending functionality
- `NEXT_PUBLIC_SUPABASE_URL` - Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anonymous key for client-side authentication

## Migration Notes
The project has been migrated from static HTML/CSS/JS to Next.js while preserving:
- Original design and styling (converted to Next.js compatible CSS)
- API endpoints and business logic
- French language content and Islamic financial calculations
- Responsive design and user experience

### Recent Updates
- **Enhanced Hijri Date Support**: Custom date picker component with built-in conversion algorithms
- **Upgraded Dependencies**: Latest Next.js 15, React 19, Bootstrap 5.3.8
- **Performance Improvements**: Turbopack integration for faster development builds
- **Improved Architecture**: Better component organization and utility libraries
- **Reliability**: Self-contained Hijri calendar calculations reducing external dependencies

The original static files have been moved to `old_front/` for reference. Active development should focus on the `frontend/` directory which contains the modern React-based implementation.