-- CreateTable
CREATE TABLE "transactions" (
    "id" UUID NOT NULL,
    "transactionId" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "customerId" TEXT NOT NULL,
    "customerName" TEXT NOT NULL,
    "phoneNumber" TEXT NOT NULL,
    "gender" TEXT NOT NULL,
    "age" INTEGER NOT NULL,
    "customerRegion" TEXT NOT NULL,
    "customerType" TEXT,
    "productId" TEXT NOT NULL,
    "productName" TEXT,
    "brand" TEXT,
    "productCategory" TEXT NOT NULL,
    "tags" TEXT,
    "quantity" INTEGER NOT NULL,
    "pricePerUnit" DECIMAL(12,2) NOT NULL,
    "discount_percentage" DECIMAL(5,2) NOT NULL,
    "totalAmount" DECIMAL(12,2) NOT NULL,
    "finalAmount" DECIMAL(12,2) NOT NULL,
    "paymentMethod" TEXT NOT NULL,
    "orderStatus" TEXT,
    "deliveryType" TEXT,
    "storeId" TEXT,
    "storeLocation" TEXT,
    "salespersonId" TEXT,
    "employeeName" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "transactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "csv_uploads" (
    "id" UUID NOT NULL,
    "fileName" TEXT NOT NULL,
    "file_size" BIGINT NOT NULL,
    "total_records" INTEGER NOT NULL,
    "imported_records" INTEGER NOT NULL,
    "failed_records" INTEGER NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL,
    "error_message" TEXT,
    "uploaded_by" TEXT,
    "uploaded_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "csv_uploads_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "transactions_transactionId_key" ON "transactions"("transactionId");

-- CreateIndex
CREATE INDEX "transactions_customerName_idx" ON "transactions"("customerName");

-- CreateIndex
CREATE INDEX "transactions_phoneNumber_idx" ON "transactions"("phoneNumber");

-- CreateIndex
CREATE INDEX "transactions_customerRegion_idx" ON "transactions"("customerRegion");

-- CreateIndex
CREATE INDEX "transactions_gender_idx" ON "transactions"("gender");

-- CreateIndex
CREATE INDEX "transactions_age_idx" ON "transactions"("age");

-- CreateIndex
CREATE INDEX "transactions_productCategory_idx" ON "transactions"("productCategory");

-- CreateIndex
CREATE INDEX "transactions_paymentMethod_idx" ON "transactions"("paymentMethod");

-- CreateIndex
CREATE INDEX "transactions_date_idx" ON "transactions"("date");

-- CreateIndex
CREATE INDEX "transactions_transactionId_idx" ON "transactions"("transactionId");

-- CreateIndex
CREATE INDEX "csv_uploads_uploaded_at_idx" ON "csv_uploads"("uploaded_at");

-- CreateIndex
CREATE INDEX "csv_uploads_status_idx" ON "csv_uploads"("status");
