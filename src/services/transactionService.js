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
  const andConditions = []

  // Search: case-insensitive search on customerName and phoneNumber
  if (search) {
    andConditions.push({
      OR: [
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
      ],
    })
  }

  // Tags filter: stored as comma-separated string
  if (filters.tags && filters.tags.length > 0) {
    const tagConditions = filters.tags.map((tag) => ({
      tags: {
        contains: tag,
      },
    }))
    andConditions.push({
      OR: tagConditions,
    })
  }

  // Region filter - add to AND conditions to ensure proper combination
  if (filters.regions && filters.regions.length > 0) {
    andConditions.push({
      customerRegion: {
        in: filters.regions,
      },
    })
  }

  // Gender filter
  if (filters.genders && filters.genders.length > 0) {
    andConditions.push({
      gender: {
        in: filters.genders,
      },
    })
  }

  // Age range filter
  if (filters.ageRange && filters.ageRange.length === 2) {
    andConditions.push({
      age: {
        gte: filters.ageRange[0],
        lte: filters.ageRange[1],
      },
    })
  }

  // Category filter
  if (filters.categories && filters.categories.length > 0) {
    andConditions.push({
      productCategory: {
        in: filters.categories,
      },
    })
  }

  // Payment method filter
  if (filters.paymentMethods && filters.paymentMethods.length > 0) {
    andConditions.push({
      paymentMethod: {
        in: filters.paymentMethods,
      },
    })
  }

  // Date range filter
  if (filters.dateRange && filters.dateRange.length === 2) {
    andConditions.push({
      date: {
        gte: new Date(filters.dateRange[0]),
        lte: new Date(filters.dateRange[1]),
      },
    })
  }

  // Combine all AND conditions
  if (andConditions.length > 0) {
    where.AND = andConditions
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
  const andConditions = []

  // Apply same filters as transactions query - use AND conditions for consistency
  if (filters.regions && filters.regions.length > 0) {
    andConditions.push({
      customerRegion: { in: filters.regions }
    })
  }
  if (filters.genders && filters.genders.length > 0) {
    andConditions.push({
      gender: { in: filters.genders }
    })
  }
  if (filters.ageRange && filters.ageRange.length === 2) {
    andConditions.push({
      age: { gte: filters.ageRange[0], lte: filters.ageRange[1] }
    })
  }
  if (filters.categories && filters.categories.length > 0) {
    andConditions.push({
      productCategory: { in: filters.categories }
    })
  }
  if (filters.paymentMethods && filters.paymentMethods.length > 0) {
    andConditions.push({
      paymentMethod: { in: filters.paymentMethods }
    })
  }
  if (filters.dateRange && filters.dateRange.length === 2) {
    andConditions.push({
      date: {
        gte: new Date(filters.dateRange[0]),
        lte: new Date(filters.dateRange[1]),
      }
    })
  }

  // Combine all AND conditions
  if (andConditions.length > 0) {
    where.AND = andConditions
  }

  // Use a single aggregate query to avoid connection pool exhaustion
  // This is more efficient and works with connection_limit=1
  const stats = await prisma.transaction.aggregate({
    where,
    _sum: {
      quantity: true,
      totalAmount: true,
      finalAmount: true,
    },
  })

  const totalUnits = Number(stats._sum.quantity || 0)
  const totalAmount = Number(stats._sum.totalAmount || 0)
  const totalDiscount = totalAmount - Number(stats._sum.finalAmount || 0)

  return {
    totalUnits,
    totalAmount,
    totalDiscount,
  }
}

