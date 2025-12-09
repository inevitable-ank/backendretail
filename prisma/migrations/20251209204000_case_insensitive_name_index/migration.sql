-- Create case-insensitive index on customerName for faster ILIKE searches
-- This significantly improves performance for case-insensitive text searches
CREATE INDEX IF NOT EXISTS "transactions_customerName_lower_idx" ON "transactions"(LOWER("customerName"));


