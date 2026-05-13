const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

async function run() {
  const client = await pool.connect();
  try {
    // Check current columns
    const cols = await client.query(
      `SELECT column_name, data_type
       FROM information_schema.columns
       WHERE table_name = 'categories'
       ORDER BY ordinal_position`
    );
    console.log('Current columns in categories:');
    console.table(cols.rows);

    // Add missing columns
    const fix = `
      ALTER TABLE categories
        ADD COLUMN IF NOT EXISTS type  VARCHAR(10) NOT NULL DEFAULT 'expense',
        ADD COLUMN IF NOT EXISTS color VARCHAR(20) NOT NULL DEFAULT '#6366f1',
        ADD COLUMN IF NOT EXISTS icon  VARCHAR(10) NOT NULL DEFAULT '📁';
    `;
    await client.query(fix);
    console.log('\n✅ ALTER TABLE ran successfully');

    // Add CHECK constraint if missing
    try {
      await client.query(`ALTER TABLE categories ADD CONSTRAINT categories_type_check CHECK (type IN ('income','expense'))`);
      console.log('✅ CHECK constraint added');
    } catch (e) {
      if (e.code === '42710') console.log('ℹ️  CHECK constraint already exists');
      else console.log('⚠️  CHECK constraint:', e.message);
    }

    // Add UNIQUE constraint if missing
    try {
      await client.query(`ALTER TABLE categories ADD CONSTRAINT categories_user_id_name_type_key UNIQUE (user_id, name, type)`);
      console.log('✅ UNIQUE constraint added');
    } catch (e) {
      if (e.code === '42710') console.log('ℹ️  UNIQUE constraint already exists');
      else console.log('⚠️  UNIQUE constraint:', e.message);
    }

    // Show final state
    const after = await client.query(
      `SELECT column_name, data_type
       FROM information_schema.columns
       WHERE table_name = 'categories'
       ORDER BY ordinal_position`
    );
    console.log('\nFinal columns:');
    console.table(after.rows);
  } finally {
    client.release();
    await pool.end();
  }
}

run().catch(console.error);
