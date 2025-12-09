import { PrismaClient } from "@prisma/client"
import "dotenv/config"

async function testConnection() {
  console.log("🔍 Testing Database Connection...\n")

  // Check if DATABASE_URL is set
  if (!process.env.DATABASE_URL) {
    console.error("❌ DATABASE_URL is not set in .env file")
    console.log("\n📝 Please add DATABASE_URL to your .env file:")
    console.log('DATABASE_URL="postgresql://postgres:[PASSWORD]@[PROJECT-REF].supabase.co:5432/postgres"')
    process.exit(1)
  }

  // Mask password in URL for display
  const maskedUrl = process.env.DATABASE_URL.replace(/:[^:@]+@/, ":****@")
  console.log(`📡 Connection String: ${maskedUrl}\n`)

  const prisma = new PrismaClient({
    log: ["error", "warn"],
  })

  try {
    console.log("⏳ Attempting to connect...")
    
    // Test connection
    await prisma.$connect()
    console.log("✅ Successfully connected to database!\n")

    // Test a simple query
    console.log("⏳ Testing query...")
    const result = await prisma.$queryRaw`SELECT 1 as test`
    console.log("✅ Query test successful!\n")

    // Check if tables exist
    console.log("⏳ Checking for tables...")
    const tables = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name
    `
    console.log("📊 Found tables:")
    if (tables.length === 0) {
      console.log("   ⚠️  No tables found. You may need to run migrations.")
      console.log("   Run: npm run prisma:migrate")
    } else {
      tables.forEach((table) => {
        console.log(`   ✓ ${table.table_name}`)
      })
    }

    console.log("\n✅ Database connection test completed successfully!")
  } catch (error) {
    console.error("\n❌ Database connection failed!\n")
    console.error("Error details:")
    console.error(error.message)

    if (error.message.includes("Can't reach database server")) {
      console.log("\n🔧 Troubleshooting steps:")
      console.log("1. Check if your Supabase project is active")
      console.log("2. Verify DATABASE_URL in .env file is correct")
      console.log("3. Check your internet connection")
      console.log("4. Verify database password is correct")
      console.log("5. Try using 'Direct connection' instead of 'Connection pooling'")
      console.log("\n📝 Connection string formats:")
      console.log("   Pooling: postgresql://postgres:[PASSWORD]@[PROJECT-REF].supabase.co:5432/postgres?pgbouncer=true&connection_limit=1")
      console.log("   Direct:  postgresql://postgres:[PASSWORD]@[PROJECT-REF].supabase.co:5432/postgres")
    } else if (error.message.includes("authentication failed")) {
      console.log("\n🔧 Authentication failed:")
      console.log("1. Check if database password is correct")
      console.log("2. Reset password in Supabase Dashboard if needed")
    } else if (error.message.includes("does not exist")) {
      console.log("\n🔧 Database does not exist:")
      console.log("1. Verify project reference in connection string")
      console.log("2. Check Supabase Dashboard for correct project")
    }

    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

testConnection()



