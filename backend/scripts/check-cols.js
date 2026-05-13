const { Pool } = require('pg');
require('dotenv').config();
const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});
pool.query(
  "SELECT column_name FROM information_schema.columns WHERE table_name='categories' ORDER BY ordinal_position"
).then(r => {
  const cols = r.rows.map(x => x.column_name);
  console.log('COLUMNS:', cols.join(', '));
  const hasType  = cols.includes('type');
  const hasColor = cols.includes('color');
  const hasIcon  = cols.includes('icon');
  console.log('type:', hasType ? 'OK' : 'MISSING');
  console.log('color:', hasColor ? 'OK' : 'MISSING');
  console.log('icon:', hasIcon ? 'OK' : 'MISSING');
  pool.end();
}).catch(e => { console.error('FAIL:', e.message); pool.end(); });
