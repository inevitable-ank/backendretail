import express from "express"
import multer from "multer"
import {
  getTransactionsHandler,
  getFilterOptionsHandler,
  getStatsHandler,
  uploadTransactionsHandler,
} from "../controllers/transactionController.js"

const router = express.Router()

// Configure multer for file uploads (memory storage)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 500 * 1024 * 1024, // 500MB limit
  },
})

// Get transactions with filters, search, sort, pagination
router.get("/", getTransactionsHandler)

// Get filter options
router.get("/filters", getFilterOptionsHandler)

// Get statistics
router.get("/stats", getStatsHandler)

// Upload CSV file
router.post("/upload", upload.single("file"), uploadTransactionsHandler)

export default router

