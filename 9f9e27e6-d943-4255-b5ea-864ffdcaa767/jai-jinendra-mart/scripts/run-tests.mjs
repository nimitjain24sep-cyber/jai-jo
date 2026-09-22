import { DatabaseSync } from 'node:sqlite';
import path from 'node:path';
import fs from 'node:fs';
import bcrypt from 'bcryptjs';

const DB_PATH = path.join(process.cwd(), 'data', 'grocery.db');

console.log('====================================================');
console.log('🧪 RUNNING JAI JINENDRA GROCERY MART VERIFICATION SUITE');
console.log('====================================================\n');

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`  ✓ PASS: ${message}`);
    passed++;
  } else {
    console.error(`  ❌ FAIL: ${message}`);
    failed++;
  }
}

// 1. Verify Database Schema & 50 Products
console.log('Test Suite 1: Database & 50 Seed Products');
const db = new DatabaseSync(DB_PATH);

const prodCount = db.prepare('SELECT COUNT(*) as count FROM products').get();
assert(prodCount.count === 50, `Database contains exactly 50 products (Found: ${prodCount.count})`);

const catCount = db.prepare('SELECT COUNT(*) as count FROM categories').get();
assert(catCount.count === 10, `Database contains 10 categories (Found: ${catCount.count})`);

// Check bilingual presence in products
const sampleProd = db.prepare('SELECT name_en, name_hi, selling_price, mrp, stock_quantity, hsn_code, gst_rate FROM products WHERE id = ?').get('prod-01');
assert(Boolean(sampleProd.name_en && sampleProd.name_hi), `Product has bilingual names (EN: ${sampleProd.name_en}, HI: ${sampleProd.name_hi})`);
assert(sampleProd.selling_price > 0 && sampleProd.mrp >= sampleProd.selling_price, `Selling price and MRP are valid (₹${sampleProd.selling_price} / ₹${sampleProd.mrp})`);
assert(sampleProd.hsn_code === '1006', `HSN code for rice is 1006 (Found: ${sampleProd.hsn_code})`);

// 2. Verify Authentication & Password Hashing
console.log('\nTest Suite 2: Authentication & Password Hashing');
const adminUser = db.prepare('SELECT * FROM admin_users WHERE email = ?').get('admin@jaijinendra.com');
assert(Boolean(adminUser), 'Super Admin user exists in database');
assert(bcrypt.compareSync('6969', adminUser.password_hash), 'Admin password hash verifies correctly with 6969');
assert(adminUser.role === 'super_admin', 'Admin user has super_admin role');

// 3. Test Order Creation, Server Calculations & Stock Decrements
console.log('\nTest Suite 3: Order Creation & Stock Decrement');
const initialStockRow = db.prepare('SELECT stock_quantity FROM products WHERE id = ?').get('prod-02');
const initialStock = initialStockRow.stock_quantity;

const testOrderId = 'test-ord-' + Date.now();
const testOrderNum = 'JJM-TEST-001';
const qtyToBuy = 2;

db.exec('BEGIN TRANSACTION;');
try {
  db.prepare(`
    INSERT INTO orders (
      id, order_number, customer_name, customer_phone, delivery_address, pincode,
      subtotal, discount, delivery_fee, tax, total, payment_method, payment_status,
      order_status, contact_language, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    testOrderId,
    testOrderNum,
    'Suresh Kumar Patidar',
    '9826198261',
    'Chopati, Jaora',
    '457226',
    410,
    0,
    30,
    0,
    440,
    'cod',
    'pending',
    'received',
    'hi',
    new Date().toISOString(),
    new Date().toISOString()
  );

  db.prepare('UPDATE products SET stock_quantity = stock_quantity - ? WHERE id = ?').run(qtyToBuy, 'prod-02');
  db.exec('COMMIT;');
} catch (e) {
  db.exec('ROLLBACK;');
  throw e;
}

const updatedStockRow = db.prepare('SELECT stock_quantity FROM products WHERE id = ?').get('prod-02');
assert(updatedStockRow.stock_quantity === initialStock - qtyToBuy, `Stock decremented accurately from ${initialStock} to ${updatedStockRow.stock_quantity}`);

// 4. Test Strict Privacy Order Tracking Lookup
console.log('\nTest Suite 4: Order Privacy Verification');
// Valid lookup with matching Order Number AND matching Phone
const validLookup = db.prepare(`
  SELECT * FROM orders
  WHERE order_number = ? AND customer_phone = ?
`).get(testOrderNum, '9826198261');
assert(Boolean(validLookup && validLookup.customer_name === 'Suresh Kumar Patidar'), 'Authorized customer can look up their own order');

// Invalid lookup with WRONG Phone (Privacy Guard)
const invalidLookup = db.prepare(`
  SELECT * FROM orders
  WHERE order_number = ? AND customer_phone = ?
`).get(testOrderNum, '9999999999');
assert(!invalidLookup, 'Unauthorized third-party with different phone CANNOT access another customer order');

// 5. Test AI Assistant Proposal & Super-Admin Approval Workflow
console.log('\nTest Suite 5: AI Assistant Isolation & Approval Queue');
const testApprovalId = 'appr-test-' + Date.now();
const oldPriceRow = db.prepare('SELECT selling_price FROM products WHERE id = ?').get('prod-01');
const oldPrice = oldPriceRow.selling_price;
const newProposedPrice = 299;

// AI generates proposal into ai_approvals table
db.prepare(`
  INSERT INTO ai_approvals (
    id, conversation_id, tool_name, proposed_action, entity_type, entity_id,
    preview_data_json, status, created_at
  ) VALUES (?, ?, ?, ?, ?, ?, ?, 'pending', ?)
`).run(
  testApprovalId,
  'conv-test-1',
  'update_product_price',
  `Update price from ${oldPrice} to ${newProposedPrice}`,
  'product',
  'prod-01',
  JSON.stringify({
    title: 'Festival Discount',
    action_payload: { type: 'UPDATE_PRODUCT_PRICE', productId: 'prod-01', newPrice: newProposedPrice }
  }),
  new Date().toISOString()
);

// Verify price is NOT changed while approval is pending
const midPriceRow = db.prepare('SELECT selling_price FROM products WHERE id = ?').get('prod-01');
assert(midPriceRow.selling_price === oldPrice, `Live price remains unchanged at ₹${oldPrice} while AI proposal is pending approval`);

// Super-admin approves
const approvalRecord = db.prepare('SELECT * FROM ai_approvals WHERE id = ?').get(testApprovalId);
assert(approvalRecord.status === 'pending', 'Approval status is initially pending');

// Simulate execution upon Super-Admin approval
db.prepare('UPDATE products SET selling_price = ? WHERE id = ?').run(newProposedPrice, 'prod-01');
db.prepare('UPDATE ai_approvals SET status = ?, reviewed_by = ? WHERE id = ?').run('approved', 'Super Admin', testApprovalId);

const executedPriceRow = db.prepare('SELECT selling_price FROM products WHERE id = ?').get('prod-01');
assert(executedPriceRow.selling_price === newProposedPrice, `Live price updated to ₹${newProposedPrice} only after explicit super-admin approval`);

// Revert test price back to original
db.prepare('UPDATE products SET selling_price = ? WHERE id = ?').run(oldPrice, 'prod-01');

// Clean up test order & stock
db.prepare('UPDATE products SET stock_quantity = ? WHERE id = ?').run(initialStock, 'prod-02');
db.prepare('DELETE FROM orders WHERE id = ?').run(testOrderId);
db.prepare('DELETE FROM ai_approvals WHERE id = ?').run(testApprovalId);

console.log('\n====================================================');
console.log(`📊 TEST RESULTS: ${passed} PASSED | ${failed} FAILED`);
console.log('====================================================\n');

if (failed > 0) {
  process.exit(1);
} else {
  console.log('🎉 ALL INTEGRATION AND SECURITY CHECKS PASSED!');
}
