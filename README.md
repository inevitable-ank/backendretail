# Retail Sales Management System

## Overview

A comprehensive retail sales management system built with Next.js and Node.js that enables efficient management, search, filtering, sorting, and analysis of sales transaction data. The system provides a modern web interface for viewing transactions with advanced search capabilities, multi-criteria filtering, flexible sorting options, and paginated results. It supports CSV data import, real-time statistics, and handles large datasets with optimized database queries and caching mechanisms.

## Tech Stack

**Frontend:**
- Next.js 16.0.7 (React 19.2.0)
- TypeScript 5
- Tailwind CSS 4
- Lucide React (Icons)
- Supabase Auth

**Backend:**
- Node.js with Express 4.19.2
- Prisma 6.1.0 (ORM)
- PostgreSQL (Supabase)
- Multer (File uploads)
- CSV-Parse (Data processing)

**Database:**
- PostgreSQL (hosted on Supabase)
- Prisma Migrations for schema management

**DevOps:**
- Nodemon (Development)
- ESLint (Code quality)

## Search Implementation Summary

The search functionality implements full-text, case-insensitive search across Customer Name and Phone Number fields. The implementation uses optimized database queries with `startsWith` pattern matching for better index utilization. For multi-word searches (e.g., "John Doe"), the system intelligently extracts the first word for efficient prefix matching. Phone number searches are handled separately when the input contains only digits, using `startsWith` for optimal performance. The search is debounced on the frontend (500ms delay) to reduce unnecessary API calls. A case-insensitive database index on `LOWER(customerName)` ensures fast query execution even with large datasets. The system includes timeout protection (15 seconds) and gracefully returns empty results instead of errors when queries take too long.

## Filter Implementation Summary

The filtering system supports multi-select filters for Customer Region, Gender, Product Category, Tags, and Payment Method, along with range-based filters for Age and Date. All filters use AND logic when combined, ensuring precise result sets. Filter options are dynamically fetched from the database to reflect actual data values. The implementation uses Prisma's `in` operator for multi-select filters and `gte`/`lte` operators for range filters. Composite database indexes on common filter combinations (e.g., `customerRegion + date`, `customerRegion + productCategory`) optimize query performance. Filter state is maintained in the URL query parameters, allowing for shareable filtered views. The system includes a reset functionality to clear all active filters at once.

## Sorting Implementation Summary

Sorting is implemented for three fields: Date (newest first), Quantity, and Customer Name (A-Z). Each sortable field supports both ascending and descending order. The sorting logic is handled server-side using Prisma's `orderBy` clause, ensuring consistent results across paginated views. Sort state is preserved when applying filters or performing searches, maintaining user context. The frontend provides a dropdown interface for selecting the sort field and order. Database indexes on sortable fields (date, quantity, customerName) ensure efficient sorting operations even with large result sets.

## Pagination Implementation Summary

Pagination is implemented with a fixed page size of 10 items per page. The system calculates total pages based on filtered result counts and provides Next/Previous navigation controls. Pagination state is maintained alongside search, filter, and sort parameters, ensuring consistent navigation. The implementation uses Prisma's `skip` and `take` operators for efficient database pagination. The count query is optimized to skip execution when on the first page with fewer results than the page size. Pagination metadata (current page, total pages, total count) is returned with each response, enabling accurate UI state management.

## Setup Instructions

### Prerequisites
- Node.js 18+ and npm/pnpm
- PostgreSQL database (Supabase account recommended)
- Git

### Backend Setup

1. Navigate to backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file with database connection:
```env
DATABASE_URL="postgresql://postgres:[PASSWORD]@[PROJECT-REF].supabase.co:5432/postgres?pgbouncer=true&connection_limit=1"
SUPABASE_URL="https://[PROJECT-REF].supabase.co"
SUPABASE_ANON_KEY="your-anon-key-here"
FRONTEND_URL="http://localhost:3000"
PORT=4000
```

4. Run database migrations:
```bash
npm run prisma:generate
npm run prisma:migrate
```

5. Apply case-insensitive search index:
```bash
node scripts/apply-case-insensitive-index.js
```

6. Start backend server:
```bash
npm run dev
```

Backend will run on `http://localhost:4000`

### Frontend Setup

1. Navigate to frontend directory:
```bash
cd app_v1
```

2. Install dependencies:
```bash
pnpm install
```

3. Create `.env.local` file (optional):
```env
NEXT_PUBLIC_API_URL=http://localhost:4000/api
```

4. Start development server:
```bash
pnpm dev
```

Frontend will run on `http://localhost:3000`

### Data Import

1. Navigate to the Profile page after logging in
2. Click "Upload Data" button
3. Select your CSV file matching the required format
4. Wait for import to complete
5. View transactions on the main dashboard

### Test Credentials

A demo account with pre-loaded dataset is available for testing:

- **Email:** `cemewox288@asurad.com`
- **Password:** `Password@123`

This account contains sample transaction data that you can use to test the search, filtering, sorting, and pagination features.

### Verification

- Backend health check: `http://localhost:4000/health`
- Frontend: `http://localhost:3000`
- Test search, filters, sorting, and pagination functionality

