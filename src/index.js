import "dotenv/config"
import express from "express"
import cors from "cors"
import morgan from "morgan"
import cookieParser from "cookie-parser"

import authRoutes from "./routes/authRoutes.js"
import transactionRoutes from "./routes/transactionRoutes.js"

const app = express()
const PORT = process.env.PORT || 4000

// Normalize FRONTEND_URL by removing trailing slashes
const frontendUrl = process.env.FRONTEND_URL?.replace(/\/+$/, "") || "http://localhost:3000"

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true)
    
    // Normalize the origin by removing trailing slashes
    const normalizedOrigin = origin.replace(/\/+$/, "")
    
    // Check if the normalized origin matches the allowed frontend URL
    if (normalizedOrigin === frontendUrl) {
      callback(null, true)
    } else {
      callback(new Error("Not allowed by CORS"))
    }
  },
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



