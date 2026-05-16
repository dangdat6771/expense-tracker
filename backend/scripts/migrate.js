const fs = require("fs");
const path = require("path");
const pool = require("../src/db");

const migrationsDir = path.join(__dirname, "..", "migrations");

async function runMigrations() {
  const client = await pool.connect();

  try {
    await client.query("SELECT pg_advisory_lock(742001)");

    await client.query(`
      CREATE TABLE IF NOT EXISTS schema_migrations (
        filename TEXT PRIMARY KEY,
        applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);

    const files = fs
      .readdirSync(migrationsDir)
      .filter((file) => file.endsWith(".sql"))
      .sort();

    for (const file of files) {
      const applied = await client.query(
        "SELECT 1 FROM schema_migrations WHERE filename = $1",
        [file]
      );

      if (applied.rowCount > 0) {
        console.log(`Skipping migration ${file}`);
        continue;
      }

      const sql = fs.readFileSync(path.join(migrationsDir, file), "utf8");

      console.log(`Running migration ${file}`);
      await client.query("BEGIN");
      try {
        await client.query(sql);
        await client.query(
          "INSERT INTO schema_migrations (filename) VALUES ($1)",
          [file]
        );
        await client.query("COMMIT");
      } catch (error) {
        await client.query("ROLLBACK");
        throw error;
      }
    }

    console.log("Database migrations completed");
  } finally {
    await client.query("SELECT pg_advisory_unlock(742001)").catch(() => {});
    client.release();
    await pool.end();
  }
}

runMigrations().catch((error) => {
  console.error("Database migration failed");
  console.error(error);
  process.exit(1);
});
