#!/usr/bin/env node

/**
 * Database Setup Script
 * 
 * This script helps you set up your database connection and run migrations.
 * 
 * Usage:
 *   node scripts/setup-db.js
 * 
 * Or use npm scripts:
 *   npm run prisma:migrate      - Create and apply migrations
 *   npm run prisma:migrate:deploy - Apply migrations (production)
 *   npm run prisma:push         - Push schema changes without migrations
 */

import { execSync } from "child_process"
import { readFileSync, writeFileSync, existsSync } from "fs"
import { fileURLToPath } from "url"
import { dirname, join } from "path"

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const rootDir = join(__dirname, "..")

console.log("🚀 Prisma Database Setup\n")

// Check if .env exists
const envPath = join(rootDir, ".env")
if (!existsSync(envPath)) {
  console.log("⚠️  .env file not found. Creating template...")
  const envTemplate = `# Supabase Database Connection
# Get your connection string from Supabase Dashboard -> Settings -> Database -> Connection String
# Use the "Connection pooling" or "Direct connection" URI
# Format: postgresql://postgres:[YOUR-PASSWORD]@[YOUR-PROJECT-REF].supabase.co:5432/postgres

DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@[YOUR-PROJECT-REF].supabase.co:5432/postgres?pgbouncer=true&connection_limit=1"

# Supabase Auth (for authentication)
SUPABASE_URL="https://[YOUR-PROJECT-REF].supabase.co"
SUPABASE_ANON_KEY="your-anon-key-here"

# Frontend URL
FRONTEND_URL="http://localhost:3001"
`
  writeFileSync(envPath, envTemplate)
  console.log("✅ Created .env file. Please update it with your Supabase credentials.\n")
  console.log("📝 Next steps:")
  console.log("   1. Open .env file")
  console.log("   2. Add your DATABASE_URL from Supabase Dashboard")
  console.log("   3. Add your SUPABASE_URL and SUPABASE_ANON_KEY")
  console.log("   4. Run: npm run prisma:migrate\n")
  process.exit(0)
}

// Check if DATABASE_URL is set
try {
  const envContent = readFileSync(envPath, "utf-8")
  if (!envContent.includes("DATABASE_URL=") || envContent.includes("[YOUR-PASSWORD]")) {
    console.log("⚠️  DATABASE_URL not configured in .env file")
    console.log("📝 Please update .env with your Supabase database connection string\n")
    process.exit(1)
  }
} catch (error) {
  console.error("Error reading .env file:", error)
  process.exit(1)
}

console.log("✅ .env file found\n")

// Run Prisma commands
try {
  console.log("📦 Generating Prisma Client...")
  execSync("npm run prisma:generate", { stdio: "inherit", cwd: rootDir })
  
  console.log("\n📊 Running migrations...")
  console.log("💡 This will create the users table in your database\n")
  execSync("npm run prisma:migrate", { stdio: "inherit", cwd: rootDir })
  
  console.log("\n✅ Database setup complete!")
  console.log("\n📚 Available commands:")
  console.log("   npm run prisma:studio    - Open Prisma Studio (database GUI)")
  console.log("   npm run prisma:migrate   - Create new migration")
  console.log("   npm run prisma:push      - Push schema changes (dev only)\n")
} catch (error) {
  console.error("\n❌ Error:", error.message)
  process.exit(1)
}



