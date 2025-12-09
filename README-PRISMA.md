# Prisma ORM Setup Guide

Prisma is now set up to manage your database schema and migrations. No need to manually run SQL queries in Supabase dashboard!

## Quick Start

1. **Set up your database connection**:
   ```bash
   node scripts/setup-db.js
   ```
   This will create a `.env` file template if it doesn't exist.

2. **Add your Supabase connection string to `.env`**:
   - Go to Supabase Dashboard → Settings → Database
   - Copy your connection string (use "Connection pooling" for better performance)
   - Add it to `.env` as `DATABASE_URL`
   - Format: `postgresql://postgres:[PASSWORD]@[PROJECT-REF].supabase.co:5432/postgres?pgbouncer=true&connection_limit=1`

3. **Run migrations**:
   ```bash
   npm run prisma:migrate
   ```
   This will create the `users` table in your database.

## Available Commands

- `npm run prisma:generate` - Generate Prisma Client (run after schema changes)
- `npm run prisma:migrate` - Create and apply a new migration
- `npm run prisma:migrate:deploy` - Apply migrations (for production)
- `npm run prisma:push` - Push schema changes without creating migration (dev only)
- `npm run prisma:studio` - Open Prisma Studio (visual database browser)

## How It Works

1. **Schema Definition**: Database schema is defined in `prisma/schema.prisma`
2. **Migrations**: When you change the schema, run `npm run prisma:migrate` to create a migration
3. **Auto-generation**: Prisma Client is automatically generated and used in your code
4. **Type Safety**: Full TypeScript support for database queries

## Current Schema

The `users` table includes:
- `id` (UUID) - Primary key, references auth.users
- `email` (String) - User email (unique)
- `name` (String?) - User name (optional)
- `createdAt` - Timestamp
- `updatedAt` - Auto-updated timestamp

## Adding New Tables/Fields

1. Edit `prisma/schema.prisma`
2. Run `npm run prisma:migrate`
3. Give your migration a name
4. Done! The migration is applied automatically

## Example: Adding a Field

```prisma
model User {
  id        String   @id @db.Uuid
  email     String   @unique @db.Text
  name      String?  @db.Text
  phone     String?  @db.Text  // Add this line
  createdAt DateTime @default(now()) @map("created_at") @db.Timestamptz(6)
  updatedAt DateTime @updatedAt @map("updated_at") @db.Timestamptz(6)

  @@map("users")
}
```

Then run: `npm run prisma:migrate`

## Using Prisma in Your Code

```javascript
import { prisma } from "./utils/prisma.js"

// Create user
const user = await prisma.user.create({
  data: {
    id: "uuid-here",
    email: "user@example.com",
    name: "John Doe"
  }
})

// Find user
const user = await prisma.user.findUnique({
  where: { id: "uuid-here" }
})

// Update user
const user = await prisma.user.update({
  where: { id: "uuid-here" },
  data: { name: "Jane Doe" }
})
```

## Troubleshooting

- **Connection Error**: Make sure `DATABASE_URL` in `.env` is correct
- **Migration Fails**: Check if table already exists in Supabase
- **Client Not Found**: Run `npm run prisma:generate`

