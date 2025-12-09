import { prisma } from "../utils/prisma.js"

/**
 * Get transactions with search, filter, sort, and pagination
 * @param {Object} params - Query parameters
 * @returns {Promise<Object>} - Transactions and metadata
 */
export async function getTransactions({
  page = 1,
  pageSize = 10,
  search = "",
  filters = {},
  sortBy = "customerName",
  sortOrder = "asc",
}) {
  const skip = (page - 1) * pageSize
  const take = pageSize

  // Build where clause
  const where = {}

  // Search: case-insensitive search on customerName and phoneNumber
  if (search) {
    where.OR = [
      {
        customerName: {
          contains: search,
          mode: "insensitive",
        },
      },
      {
        phoneNumber: {
          contains: search,
        },
      },
    ]
  }

  // Filters
  if (filters.regions && filters.regions.length > 0) {
    where.customerRegion = {
      in: filters.regions,
    }
  }

  if (filters.genders && filters.genders.length > 0) {
    where.gender = {
      in: filters.genders,
    }
  }

  if (filters.ageRange && filters.ageRange.length === 2) {
    where.age = {
      gte: filters.ageRange[0],
      lte: filters.ageRange[1],
    }
  }

  if (filters.categories && filters.categories.length > 0) {
    where.productCategory = {
      in: filters.categories,
    }
  }

  if (filters.tags && filters.tags.length > 0) {
    // Tags are stored as comma-separated string, so we use array overlap
    where.tags = {
      not: null,
    }
    // For PostgreSQL, we'll use a more complex query for tags
    // This will be handled in a separate condition
  }

  if (filters.paymentMethods && filters.paymentMethods.length > 0) {
    where.paymentMethod = {
      in: filters.paymentMethods,
    }
  }

  if (filters.dateRange && filters.dateRange.length === 2) {
    where.date = {
      gte: new Date(filters.dateRange[0]),
      lte: new Date(filters.dateRange[1]),
    }
  }

  // Build orderBy clause
  let orderBy = {}
  switch (sortBy) {
    case "date":
      orderBy = { date: sortOrder }
      break
    case "quantity":
      orderBy = { quantity: sortOrder }
      break
    case "customerName":
      orderBy = { customerName: sortOrder }
      break
    default:
      orderBy = { customerName: "asc" }
  }

  // Execute queries
  const [transactions, totalCount] = await Promise.all([
    prisma.transaction.findMany({
      where,
      orderBy,
      skip,
      take,
      select: {
        transactionId: true,
        date: true,
        customerId: true,
        customerName: true,
        phoneNumber: true,
        gender: true,
        age: true,
        productCategory: true,
        quantity: true,
        totalAmount: true,
        customerRegion: true,
        productId: true,
        employeeName: true,
      },
    }),
    prisma.transaction.count({ where }),
  ])

  // Convert Decimal to Number for JSON serialization
  const formattedTransactions = transactions.map((t) => ({
    ...t,
    totalAmount: Number(t.totalAmount),
    date: t.date.toISOString().split("T")[0],
  }))

  return {
    transactions: formattedTransactions,
    pagination: {
      page,
      pageSize,
      totalCount,
      totalPages: Math.ceil(totalCount / pageSize),
    },
  }
}

/**
 * Get filter options (unique values for dropdowns)
 * @returns {Promise<Object>} - Available filter options
 */
export async function getFilterOptions() {
  const [
    regions,
    genders,
    categories,
    paymentMethods,
    ageRange,
    tags,
  ] = await Promise.all([
    prisma.transaction.findMany({
      select: { customerRegion: true },
      distinct: ["customerRegion"],
    }),
    prisma.transaction.findMany({
      select: { gender: true },
      distinct: ["gender"],
    }),
    prisma.transaction.findMany({
      select: { productCategory: true },
      distinct: ["productCategory"],
    }),
    prisma.transaction.findMany({
      select: { paymentMethod: true },
      distinct: ["paymentMethod"],
    }),
    prisma.transaction.aggregate({
      _min: { age: true },
      _max: { age: true },
    }),
    prisma.transaction.findMany({
      where: { tags: { not: null } },
      select: { tags: true },
    }),
  ])

  // Extract unique tags from comma-separated strings
  const uniqueTags = new Set()
  tags.forEach((t) => {
    if (t.tags) {
      t.tags.split(",").forEach((tag) => uniqueTags.add(tag.trim()))
    }
  })

  return {
    regions: regions.map((r) => r.customerRegion).sort(),
    genders: genders.map((g) => g.gender).sort(),
    categories: categories.map((c) => c.productCategory).sort(),
    paymentMethods: paymentMethods.map((p) => p.paymentMethod).sort(),
    ageRange: {
      min: ageRange._min.age || 0,
      max: ageRange._max.age || 100,
    },
    tags: Array.from(uniqueTags).sort(),
  }
}

/**
 * Get aggregated statistics
 * @param {Object} filters - Same filters as getTransactions
 * @returns {Promise<Object>} - Statistics
 */
export async function getStats(filters = {}) {
  const where = {}

  // Apply same filters as transactions query
  if (filters.regions && filters.regions.length > 0) {
    where.customerRegion = { in: filters.regions }
  }
  if (filters.genders && filters.genders.length > 0) {
    where.gender = { in: filters.genders }
  }
  if (filters.ageRange && filters.ageRange.length === 2) {
    where.age = { gte: filters.ageRange[0], lte: filters.ageRange[1] }
  }
  if (filters.categories && filters.categories.length > 0) {
    where.productCategory = { in: filters.categories }
  }
  if (filters.paymentMethods && filters.paymentMethods.length > 0) {
    where.paymentMethod = { in: filters.paymentMethods }
  }
  if (filters.dateRange && filters.dateRange.length === 2) {
    where.date = {
      gte: new Date(filters.dateRange[0]),
      lte: new Date(filters.dateRange[1]),
    }
  }

  const [totalUnits, totalAmount, totalDiscount] = await Promise.all([
    prisma.transaction.aggregate({
      where,
      _sum: { quantity: true },
    }),
    prisma.transaction.aggregate({
      where,
      _sum: { totalAmount: true },
    }),
    prisma.transaction.aggregate({
      where,
      _sum: {
        totalAmount: true,
        finalAmount: true,
      },
    }),
  ])

  const discountTotal =
    Number(totalDiscount._sum.totalAmount || 0) -
    Number(totalDiscount._sum.finalAmount || 0)

  return {
    totalUnits: Number(totalUnits._sum.quantity || 0),
    totalAmount: Number(totalAmount._sum.totalAmount || 0),
    totalDiscount: discountTotal,
  }
}

