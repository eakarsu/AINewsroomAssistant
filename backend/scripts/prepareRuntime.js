const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');
const db = require('../src/models/db');

async function main() {
  const migrationDirectory = path.join(__dirname, '..', 'migrations');
  for (const name of fs.readdirSync(migrationDirectory).filter((item) => item.endsWith('.sql')).sort()) {
    await db.query(fs.readFileSync(path.join(migrationDirectory, name), 'utf8'));
  }
  const email = process.env.PROVISION_ADMIN_EMAIL;
  const password = process.env.PROVISION_ADMIN_PASSWORD;
  if (!email || !password) throw new Error('Runtime administrator credentials are required');
  await db.query(
    `INSERT INTO users(email,password_hash,name,role) VALUES($1,$2,$3,'admin')
     ON CONFLICT(email) DO UPDATE SET password_hash=EXCLUDED.password_hash,name=EXCLUDED.name,role=EXCLUDED.role`,
    [email.toLowerCase(), await bcrypt.hash(password, 10), process.env.PROVISION_ADMIN_NAME || 'Runtime Administrator'],
  );
  await db.pool.end();
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
