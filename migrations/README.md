# Database Setup Instructions

## User Data Storage

User information is now stored in a `users` table in Supabase database, not just in auth metadata.

## Setup Steps

1. **Run the migration SQL** in your Supabase SQL Editor:
   - Open Supabase Dashboard → SQL Editor
   - Copy and paste the contents of `create_users_table.sql`
   - Execute the SQL

2. **How it works**:
   - When a user signs up → User is created in auth AND automatically stored in `users` table via database trigger
   - The trigger function `handle_new_user()` runs securely with SECURITY DEFINER
   - When fetching user data → Backend queries `users` table first, falls back to auth user
   - User data persists in database and can be queried/updated
   - **Security**: RLS policies ensure users can only access their own data

## Table Structure

The `users` table has:
- `id` (UUID) - Primary key, references auth.users(id)
- `email` (TEXT) - User email
- `name` (TEXT) - User name
- `created_at` (TIMESTAMP) - When user was created
- `updated_at` (TIMESTAMP) - Last update time (auto-updated)

## Security

- Row Level Security (RLS) is enabled
- Users can only read/update their own data
- Backend uses service role key (if available) to insert user data

