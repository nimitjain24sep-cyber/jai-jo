import { DatabaseSync } from 'node:sqlite';
import path from 'node:path';
import fs from 'node:fs';
import bcrypt from 'bcryptjs';

const DB_PATH = path.join(process.cwd(), 'data', 'grocery.db');
const db = new DatabaseSync(DB_PATH);

// Helper to seed
const now = new Date().toISOString();

// Check if store_settings exists
const settings = db.prepare('SELECT COUNT(*) as c FROM store_settings').get();
if (settings.c === 0) {
  const insertSettings = db.prepare(`
    INSERT INTO store_settings (
      id, store_name, store_name_hi, phone, whatsapp, address, address_hi,
      city, state, pincode, business_hours, business_hours_hi, currency,
      delivery_fee, min_order_amount, free_delivery_threshold, estimated_delivery_min,
      demo_payment_enabled, demo_upi_id, demo_account_name, demo_account_number, demo_ifsc,
      created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  insertSettings.run(
    'settings-01',
    'Jai Jinendra Grocery Mart',
    'जय जिनेन्द्र किराना मार्ट',
    '9294646050',
    '9294646050',
    'Station Road, Near Jain Mandir, Jaora',
    'स्टेशन रोड, जैन मंदिर के पास, जावरा',
    'Jaora',
    'Madhya Pradesh',
    '457226',
    '8:00 AM - 9:30 PM (All 7 Days)',
    'सुबह 8:00 से रात 9:30 (सातों दिन)',
    'INR',
    30.0,
    100.0,
    499.0,
    60,
    1,
    'jai.jinendra.demo@upi',
    'Jai Jinendra Grocery Mart DEMO',
    '000000000000',
    'DEMO0000000',
    now,
    now
  );
  console.log('Seeded store_settings.');
}

// Check admin_users
const adminCheck = db.prepare('SELECT COUNT(*) as c FROM admin_users').get();
if (adminCheck.c === 0) {
  const insertAdmin = db.prepare(`
    INSERT INTO admin_users (
      id, name, email, password_hash, role, two_factor_enabled, active, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  const passwordHash = bcrypt.hashSync('Admin@12345', 10);
  insertAdmin.run('admin-01', 'Super Admin Jaora', 'admin@jaijinendra.com', passwordHash, 'super_admin', 0, 1, now, now);
  insertAdmin.run('manager-01', 'Store Manager', 'manager@jaijinendra.com', passwordHash, 'manager', 0, 1, now, now);
  console.log('Seeded admin users.');
}

// Read products data from src/data/seedProducts.ts
// We will extract SEED_CATEGORIES and SEED_PRODUCTS
const seedCode = fs.readFileSync(path.join(process.cwd(), 'src/data/seedProducts.ts'), 'utf8');

// Parse categories
const catMatch = seedCode.match(/export const SEED_CATEGORIES: SeedCategory\[\] = (\[[\s\S]*?\]);/);
if (catMatch) {
  const categories = eval(catMatch[1]);
  const catCount = db.prepare('SELECT COUNT(*) as c FROM categories').get();
  if (catCount.c === 0) {
    const insertCat = db.prepare(`
      INSERT INTO categories (id, name_en, name_hi, slug, icon, sort_order, active, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    for (const c of categories) {
      insertCat.run(c.id, c.name_en, c.name_hi, c.slug, c.icon, c.sort_order, 1, now, now);
    }
    console.log(`Seeded ${categories.length} categories.`);
  }
}

// Parse products
const prodMatch = seedCode.match(/export const SEED_PRODUCTS: SeedProduct\[\] = (\[[\s\S]*?\]);/);
if (prodMatch) {
  const products = eval(prodMatch[1]);
  const prodCount = db.prepare('SELECT COUNT(*) as c FROM products').get();
  if (prodCount.c === 0) {
    const insertProd = db.prepare(`
      INSERT INTO products (
        id, name_en, name_hi, description_en, description_hi, image_urls_json,
        category_id, sku, barcode, unit, mrp, selling_price, discount_percent,
        gst_rate, hsn_code, stock_quantity, reorder_level, featured, active,
        sort_order, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    for (const p of products) {
      insertProd.run(
        p.id,
        p.name_en,
        p.name_hi,
        p.description_en,
        p.description_hi,
        JSON.stringify(p.image_urls),
        p.category_id,
        p.sku,
        p.barcode,
        p.unit,
        p.mrp,
        p.selling_price,
        p.discount_percent,
        p.gst_rate,
        p.hsn_code,
        p.stock_quantity,
        p.reorder_level,
        p.featured ? 1 : 0,
        p.active ? 1 : 0,
        p.sort_order,
        now,
        now
      );
    }
    console.log(`Seeded ${products.length} products.`);
  }
}

// Delivery rules
const delRules = db.prepare('SELECT COUNT(*) as c FROM delivery_rules').get();
if (delRules.c === 0) {
  const insertRule = db.prepare(`
    INSERT INTO delivery_rules (id, zone_name, pincode, base_fee, min_order, free_threshold, estimated_minutes, active)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);
  insertRule.run('rule-jaora-core', 'Jaora Town (Core)', '457226', 30, 100, 499, 45, 1);
  insertRule.run('rule-jaora-outer', 'Jaora Suburbs & Outskirts', '457226', 50, 200, 799, 90, 1);
  console.log('Seeded delivery rules.');
}

// Coupons
const couponCount = db.prepare('SELECT COUNT(*) as c FROM coupons').get();
if (couponCount.c === 0) {
  const insertCoupon = db.prepare(`
    INSERT INTO coupons (id, code, discount_type, discount_value, min_order_amount, max_discount, usage_limit, used_count, valid_from, valid_to, active, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  insertCoupon.run('cp-01', 'WELCOME50', 'fixed', 50, 300, 50, 500, 0, '2026-01-01', '2027-12-31', 1, now);
  insertCoupon.run('cp-02', 'JAORA10', 'percentage', 10, 500, 100, 500, 0, '2026-01-01', '2027-12-31', 1, now);
  insertCoupon.run('cp-03', 'FESTIVE100', 'fixed', 100, 999, 100, 200, 0, '2026-01-01', '2027-12-31', 1, now);
  console.log('Seeded coupons.');
}

// Final verification count
const totalProducts = db.prepare('SELECT COUNT(*) as count FROM products').get();
const totalCategories = db.prepare('SELECT COUNT(*) as count FROM categories').get();
console.log(`Verification: Database has ${totalProducts.count} products and ${totalCategories.count} categories ready!`);
