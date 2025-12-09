import { prisma } from "../utils/prisma.js"
import { cache } from "../utils/cache.js"
import { parse } from "csv-parse/sync"
import { Readable } from "stream"
import fs from "fs"
import path from "path"

/**
 * Parse CSV file and import transactions in batches
 * @param {string} filePath - Path to CSV file
 * @param {Function} progressCallback - Callback for progress updates
 * @returns {Promise<Object>} - Import results
 */
export async function importTransactionsFromCSV(filePath, progressCallback = null) {
  try {
    // Read and parse CSV file
    const fileContent = fs.readFileSync(filePath, "utf-8")
    const records = parse(fileContent, {
      columns: true,
      skip_empty_lines: true,
      trim: true,
    })

    const totalRecords = records.length
    let imported = 0
    let errors = 0
    const batchSize = 1000 // Process in batches of 1000

    // Process in batches to avoid memory issues
    for (let i = 0; i < totalRecords; i += batchSize) {
      const batch = records.slice(i, i + batchSize)
      const transactionData = batch.map((record) => {
        try {
          return {
            transactionId: record["Transaction ID"] || record["transaction_id"] || record["TransactionID"],
            date: parseDate(record["Date"] || record["date"]),
            customerId: record["Customer ID"] || record["customer_id"] || record["CustomerID"],
            customerName: record["Customer Name"] || record["customer_name"] || record["CustomerName"],
            phoneNumber: record["Phone Number"] || record["phone_number"] || record["PhoneNumber"],
            gender: record["Gender"] || record["gender"],
            age: parseInt(record["Age"] || record["age"] || "0", 10),
            customerRegion: record["Customer Region"] || record["customer_region"] || record["CustomerRegion"],
            customerType: record["Customer Type"] || record["customer_type"] || record["CustomerType"] || null,
            productId: record["Product ID"] || record["product_id"] || record["ProductID"],
            productName: record["Product Name"] || record["product_name"] || record["ProductName"] || null,
            brand: record["Brand"] || record["brand"] || null,
            productCategory: record["Product Category"] || record["product_category"] || record["ProductCategory"],
            tags: record["Tags"] || record["tags"] || null,
            quantity: parseInt(record["Quantity"] || record["quantity"] || "0", 10),
            pricePerUnit: parseFloat(record["Price per Unit"] || record["price_per_unit"] || record["PricePerUnit"] || "0"),
            discountPercentage: parseFloat(record["Discount Percentage"] || record["discount_percentage"] || record["DiscountPercentage"] || "0"),
            totalAmount: parseFloat(record["Total Amount"] || record["total_amount"] || record["TotalAmount"] || "0"),
            finalAmount: parseFloat(record["Final Amount"] || record["final_amount"] || record["FinalAmount"] || "0"),
            paymentMethod: record["Payment Method"] || record["payment_method"] || record["PaymentMethod"],
            orderStatus: record["Order Status"] || record["order_status"] || record["OrderStatus"] || null,
            deliveryType: record["Delivery Type"] || record["delivery_type"] || record["DeliveryType"] || null,
            storeId: record["Store ID"] || record["store_id"] || record["StoreID"] || null,
            storeLocation: record["Store Location"] || record["store_location"] || record["StoreLocation"] || null,
            salespersonId: record["Salesperson ID"] || record["salesperson_id"] || record["SalespersonID"] || null,
            employeeName: record["Employee Name"] || record["employee_name"] || record["EmployeeName"],
          }
        } catch (error) {
          console.error(`Error parsing record ${i}:`, error.message)
          return null
        }
      }).filter((item) => item !== null)

      // Use createMany with skipDuplicates to handle duplicates
      try {
        await prisma.transaction.createMany({
          data: transactionData,
          skipDuplicates: true,
        })
        imported += transactionData.length
      } catch (error) {
        console.error(`Error inserting batch starting at ${i}:`, error.message)
        errors += batch.length
      }

      // Report progress
      if (progressCallback) {
        progressCallback({
          processed: Math.min(i + batchSize, totalRecords),
          total: totalRecords,
          imported,
          errors,
        })
      }
    }

    // Clear stats cache after importing new data
    cache.clear()

    return {
      success: true,
      totalRecords,
      imported,
      errors,
    }
  } catch (error) {
    console.error("CSV Import Error:", error)
    throw error
  }
}

/**
 * Parse date from various formats
 * @param {string} dateStr - Date string
 * @returns {Date} - Parsed date
 */
function parseDate(dateStr) {
  if (!dateStr) return new Date()

  // Handle DD-MM-YYYY format
  if (dateStr.includes("-")) {
    const parts = dateStr.split("-")
    if (parts.length === 3) {
      // DD-MM-YYYY
      if (parts[0].length === 2) {
        return new Date(`${parts[2]}-${parts[1]}-${parts[0]}`)
      }
      // YYYY-MM-DD
      return new Date(dateStr)
    }
  }

  // Handle other formats
  const date = new Date(dateStr)
  if (isNaN(date.getTime())) {
    return new Date()
  }
  return date
}

/**
 * Import from uploaded file buffer
 * @param {Buffer} fileBuffer - File buffer
 * @param {Function} progressCallback - Progress callback
 * @returns {Promise<Object>} - Import results
 */
export async function importTransactionsFromBuffer(fileBuffer, progressCallback = null) {
  try {
    const records = parse(fileBuffer.toString("utf-8"), {
      columns: true,
      skip_empty_lines: true,
      trim: true,
    })

    const totalRecords = records.length
    let imported = 0
    let errors = 0
    const batchSize = 1000

    for (let i = 0; i < totalRecords; i += batchSize) {
      const batch = records.slice(i, i + batchSize)
      const transactionData = batch.map((record) => {
        try {
          return {
            transactionId: record["Transaction ID"] || record["transaction_id"] || record["TransactionID"],
            date: parseDate(record["Date"] || record["date"]),
            customerId: record["Customer ID"] || record["customer_id"] || record["CustomerID"],
            customerName: record["Customer Name"] || record["customer_name"] || record["CustomerName"],
            phoneNumber: record["Phone Number"] || record["phone_number"] || record["PhoneNumber"],
            gender: record["Gender"] || record["gender"],
            age: parseInt(record["Age"] || record["age"] || "0", 10),
            customerRegion: record["Customer Region"] || record["customer_region"] || record["CustomerRegion"],
            customerType: record["Customer Type"] || record["customer_type"] || record["CustomerType"] || null,
            productId: record["Product ID"] || record["product_id"] || record["ProductID"],
            productName: record["Product Name"] || record["product_name"] || record["ProductName"] || null,
            brand: record["Brand"] || record["brand"] || null,
            productCategory: record["Product Category"] || record["product_category"] || record["ProductCategory"],
            tags: record["Tags"] || record["tags"] || null,
            quantity: parseInt(record["Quantity"] || record["quantity"] || "0", 10),
            pricePerUnit: parseFloat(record["Price per Unit"] || record["price_per_unit"] || record["PricePerUnit"] || "0"),
            discountPercentage: parseFloat(record["Discount Percentage"] || record["discount_percentage"] || record["DiscountPercentage"] || "0"),
            totalAmount: parseFloat(record["Total Amount"] || record["total_amount"] || record["TotalAmount"] || "0"),
            finalAmount: parseFloat(record["Final Amount"] || record["final_amount"] || record["FinalAmount"] || "0"),
            paymentMethod: record["Payment Method"] || record["payment_method"] || record["PaymentMethod"],
            orderStatus: record["Order Status"] || record["order_status"] || record["OrderStatus"] || null,
            deliveryType: record["Delivery Type"] || record["delivery_type"] || record["DeliveryType"] || null,
            storeId: record["Store ID"] || record["store_id"] || record["StoreID"] || null,
            storeLocation: record["Store Location"] || record["store_location"] || record["StoreLocation"] || null,
            salespersonId: record["Salesperson ID"] || record["salesperson_id"] || record["SalespersonID"] || null,
            employeeName: record["Employee Name"] || record["employee_name"] || record["EmployeeName"],
          }
        } catch (error) {
          return null
        }
      }).filter((item) => item !== null)

      try {
        await prisma.transaction.createMany({
          data: transactionData,
          skipDuplicates: true,
        })
        imported += transactionData.length
      } catch (error) {
        errors += batch.length
      }

      if (progressCallback) {
        progressCallback({
          processed: Math.min(i + batchSize, totalRecords),
          total: totalRecords,
          imported,
          errors,
        })
      }
    }

    // Clear stats cache after importing new data
    cache.clear()

    return {
      success: true,
      totalRecords,
      imported,
      errors,
    }
  } catch (error) {
    console.error("CSV Import Error:", error)
    throw error
  }
}

