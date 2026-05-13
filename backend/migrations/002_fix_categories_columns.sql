-- Fix: Add missing columns to categories table
-- Run this if your categories table is missing type / color / icon columns

ALTER TABLE categories
  ADD COLUMN IF NOT EXISTS type    VARCHAR(10)  NOT NULL DEFAULT 'expense' CHECK (type IN ('income', 'expense')),
  ADD COLUMN IF NOT EXISTS color   VARCHAR(20)  NOT NULL DEFAULT '#6366f1',
  ADD COLUMN IF NOT EXISTS icon    VARCHAR(10)  NOT NULL DEFAULT '📁';

-- Also ensure the unique constraint exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'categories_user_id_name_type_key'
  ) THEN
    ALTER TABLE categories
      ADD CONSTRAINT categories_user_id_name_type_key UNIQUE (user_id, name, type);
  END IF;
END $$;

-- Verify columns
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'categories'
ORDER BY ordinal_position;
