import { execSync } from "child_process"
import "dotenv/config"

// Run migrations before starting the server
console.log("Running database migrations...")
try {
  execSync("npx prisma migrate deploy", { stdio: "inherit" })
  console.log("✓ Migrations completed successfully")
} catch (error) {
  console.error("⚠ Migration failed, but continuing with server start...")
  console.error(error.message)
}

// Start the server
console.log("Starting server...")
import("../src/index.js").catch((err) => {
  console.error("Failed to start server:", err)
  process.exit(1)
})

