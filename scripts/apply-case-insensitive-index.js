import { PrismaClient } from "@prisma/client"
import "dotenv/config"

const prisma = new PrismaClient()

async function applyIndex() {
  try {
    console.log("🔍 Applying case-insensitive index on customerName...\n")
    
    // Check if index already exists
    const indexCheck = await prisma.$queryRaw`
      SELECT indexname 
      FROM pg_indexes 
      WHERE tablename = 'transactions' 
      AND indexname = 'transactions_customerName_lower_idx'
    `
    
    if (indexCheck.length > 0) {
      console.log("✅ Index already exists!")
      return
    }
    
    // Create the index
    console.log("⏳ Creating index...")
    await prisma.$executeRaw`
      CREATE INDEX "transactions_customerName_lower_idx" 
      ON "transactions"(LOWER("customerName"))
    `
    
    console.log("✅ Case-insensitive index created successfully!")
    console.log("\n📊 This will significantly improve search performance for customer names.")
    
  } catch (error) {
    if (error.message.includes("already exists")) {
      console.log("✅ Index already exists!")
    } else {
      console.error("\n❌ Error creating index:")
      console.error(error.message)
      process.exit(1)
    }
  } finally {
    await prisma.$disconnect()
  }
}

applyIndex()


