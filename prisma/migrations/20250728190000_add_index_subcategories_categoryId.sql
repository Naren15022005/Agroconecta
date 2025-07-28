-- Index for faster lookup by categoryId in subcategories
CREATE INDEX idx_subcategories_categoryId ON subcategories(categoryId);
