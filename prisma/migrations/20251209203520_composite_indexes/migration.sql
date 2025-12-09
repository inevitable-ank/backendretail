-- CreateIndex
CREATE INDEX "transactions_customerRegion_date_idx" ON "transactions"("customerRegion", "date");

-- CreateIndex
CREATE INDEX "transactions_customerRegion_productCategory_idx" ON "transactions"("customerRegion", "productCategory");

-- CreateIndex
CREATE INDEX "transactions_customerRegion_gender_idx" ON "transactions"("customerRegion", "gender");

-- CreateIndex
CREATE INDEX "transactions_date_productCategory_idx" ON "transactions"("date", "productCategory");

-- CreateIndex
CREATE INDEX "transactions_customerRegion_date_productCategory_idx" ON "transactions"("customerRegion", "date", "productCategory");
