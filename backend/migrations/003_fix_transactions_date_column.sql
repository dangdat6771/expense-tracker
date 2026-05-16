-- Fix: keep transactions date column aligned with the API field name.

DO $$
BEGIN
  IF to_regclass('public.transactions') IS NOT NULL THEN
    IF EXISTS (
      SELECT 1
      FROM information_schema.columns
      WHERE table_name = 'transactions'
        AND column_name = 'date'
    ) AND NOT EXISTS (
      SELECT 1
      FROM information_schema.columns
      WHERE table_name = 'transactions'
        AND column_name = 'transaction_date'
    ) THEN
      ALTER TABLE transactions RENAME COLUMN date TO transaction_date;
    END IF;

    IF NOT EXISTS (
      SELECT 1
      FROM information_schema.columns
      WHERE table_name = 'transactions'
        AND column_name = 'transaction_date'
    ) THEN
      ALTER TABLE transactions
        ADD COLUMN transaction_date DATE NOT NULL DEFAULT CURRENT_DATE;
    END IF;
  END IF;
END $$;
