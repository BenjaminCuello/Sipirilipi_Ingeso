-- Enable pg_trgm extension for trigram indexing (idempotent)
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Trigram GIN index on Product.name to accelerate ILIKE/contains
CREATE INDEX IF NOT EXISTS idx_products_name_trgm ON "Product" USING GIN ("name" gin_trgm_ops);

-- Optional: Trigram GIN index on Product.description
CREATE INDEX IF NOT EXISTS idx_products_description_trgm ON "Product" USING GIN ("description" gin_trgm_ops);

