import { getTransactions, getFilterOptions, getStats } from "../services/transactionService.js"
import { importTransactionsFromBuffer } from "../services/csvImportService.js"

/**
 * Get transactions with filters, search, sort, and pagination
 */
export async function getTransactionsHandler(req, res) {
  try {
    const {
      page = 1,
      pageSize = 10,
      search = "",
      sortBy = "customerName",
      sortOrder = "asc",
    } = req.query

    // Parse filters from query string
    const filters = {
      regions: req.query.regions ? (Array.isArray(req.query.regions) ? req.query.regions : [req.query.regions]) : [],
      genders: req.query.genders ? (Array.isArray(req.query.genders) ? req.query.genders : [req.query.genders]) : [],
      ageRange: req.query.ageMin && req.query.ageMax ? [parseInt(req.query.ageMin), parseInt(req.query.ageMax)] : null,
      categories: req.query.categories ? (Array.isArray(req.query.categories) ? req.query.categories : [req.query.categories]) : [],
      tags: req.query.tags ? (Array.isArray(req.query.tags) ? req.query.tags : [req.query.tags]) : [],
      paymentMethods: req.query.paymentMethods ? (Array.isArray(req.query.paymentMethods) ? req.query.paymentMethods : [req.query.paymentMethods]) : [],
      dateRange: req.query.dateFrom && req.query.dateTo ? [req.query.dateFrom, req.query.dateTo] : null,
    }

    // Remove empty arrays
    Object.keys(filters).forEach((key) => {
      if (Array.isArray(filters[key]) && filters[key].length === 0) {
        delete filters[key]
      }
      if (filters[key] === null) {
        delete filters[key]
      }
    })

    const result = await getTransactions({
      page: parseInt(page, 10),
      pageSize: parseInt(pageSize, 10),
      search: search.trim(),
      filters,
      sortBy,
      sortOrder,
    })

    res.json(result)
  } catch (error) {
    console.error("Error fetching transactions:", error)
    res.status(500).json({ message: "Failed to fetch transactions", error: error.message })
  }
}

/**
 * Get filter options for dropdowns
 */
export async function getFilterOptionsHandler(req, res) {
  try {
    const options = await getFilterOptions()
    res.json(options)
  } catch (error) {
    console.error("Error fetching filter options:", error)
    res.status(500).json({ message: "Failed to fetch filter options", error: error.message })
  }
}

/**
 * Get statistics
 */
export async function getStatsHandler(req, res) {
  try {
    // Parse filters from query string (same as transactions)
    const filters = {
      regions: req.query.regions ? (Array.isArray(req.query.regions) ? req.query.regions : [req.query.regions]) : [],
      genders: req.query.genders ? (Array.isArray(req.query.genders) ? req.query.genders : [req.query.genders]) : [],
      ageRange: req.query.ageMin && req.query.ageMax ? [parseInt(req.query.ageMin), parseInt(req.query.ageMax)] : null,
      categories: req.query.categories ? (Array.isArray(req.query.categories) ? req.query.categories : [req.query.categories]) : [],
      tags: req.query.tags ? (Array.isArray(req.query.tags) ? req.query.tags : [req.query.tags]) : [],
      paymentMethods: req.query.paymentMethods ? (Array.isArray(req.query.paymentMethods) ? req.query.paymentMethods : [req.query.paymentMethods]) : [],
      dateRange: req.query.dateFrom && req.query.dateTo ? [req.query.dateFrom, req.query.dateTo] : null,
    }

    // Remove empty arrays
    Object.keys(filters).forEach((key) => {
      if (Array.isArray(filters[key]) && filters[key].length === 0) {
        delete filters[key]
      }
      if (filters[key] === null) {
        delete filters[key]
      }
    })

    const stats = await getStats(filters)
    res.json(stats)
  } catch (error) {
    console.error("Error fetching stats:", error)
    res.status(500).json({ message: "Failed to fetch statistics", error: error.message })
  }
}

/**
 * Upload and import CSV file
 */
export async function uploadTransactionsHandler(req, res) {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" })
    }

    if (req.file.mimetype !== "text/csv" && !req.file.originalname.endsWith(".csv")) {
      return res.status(400).json({ message: "Invalid file type. Please upload a CSV file." })
    }

    const result = await importTransactionsFromBuffer(req.file.buffer)

    res.json({
      message: "File uploaded and processed successfully",
      ...result,
    })
  } catch (error) {
    console.error("Error uploading transactions:", error)
    res.status(500).json({ message: "Failed to upload transactions", error: error.message })
  }
}

