import { DatabaseSync } from 'node:sqlite';
import path from 'node:path';
import fs from 'node:fs';

const DB_DIR = path.join(process.cwd(), 'data');
if (!fs.existsSync(DB_DIR)) {
  fs.mkdirSync(DB_DIR, { recursive: true });
}
const DB_PATH = path.join(DB_DIR, 'grocery.db');

console.log('Connecting to database at:', DB_PATH);
const db = new DatabaseSync(DB_PATH);

// Run a query to check products and categories
const prodCount = db.prepare('SELECT COUNT(*) as count FROM products').get();
const catCount = db.prepare('SELECT COUNT(*) as count FROM categories').get();
const adminCount = db.prepare('SELECT COUNT(*) as count FROM admin_users').get();
const settings = db.prepare('SELECT store_name, phone, whatsapp FROM store_settings LIMIT 1').get();

console.log('Database Status:');
console.log('- Total Categories:', catCount?.count);
console.log('- Total Products:', prodCount?.count);
console.log('- Admin Users:', adminCount?.count);
console.log('- Store Settings:', settings);
