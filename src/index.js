import "dotenv/config"
import express from "express"
import cors from "cors"
import morgan from "morgan"
import cookieParser from "cookie-parser"

import authRoutes from "./routes/authRoutes.js"
import transactionRoutes from "./routes/transactionRoutes.js"

const app = express()
const PORT = process.env.PORT || 4000

app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:3000",
  credentials: true
}))
app.use(cookieParser())
app.use(express.json())
app.use(morgan("dev"))

app.get("/health", (_req, res) => res.json({ status: "ok" }))

// Log all requests for debugging
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`)
  next()
})

app.use("/api/auth", authRoutes)
app.use("/api/transactions", transactionRoutes)

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: "Route not found" })
})

// Global error handler (fallback)
app.use((err, _req, res, _next) => {
  // eslint-disable-next-line no-console
  console.error(err)
  res.status(500).json({ message: "Internal server error" })
})

app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`API listening on http://localhost:${PORT}`)
})



