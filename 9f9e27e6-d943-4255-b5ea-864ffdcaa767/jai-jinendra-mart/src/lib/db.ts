import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';
import { SEED_CATEGORIES, SEED_PRODUCTS } from '../data/seedProducts';

let dbInstance: any = null;

export function getDatabase(): any {
  if (!dbInstance) {
    let NativeDbClass: any = null;
    try {
      const r = typeof eval !== 'undefined' ? eval('require') : null;
      if (r) {
        NativeDbClass = r('node:sqlite')?.DatabaseSync;
      }
    } catch (e) {
      NativeDbClass = null;
    }

    if (NativeDbClass) {
      try {
        const DB_DIR = path.join(process.cwd(), 'data');
        const DB_PATH = process.env.DATABASE_PATH
          ? path.resolve(process.cwd(), process.env.DATABASE_PATH)
          : path.join(DB_DIR, 'grocery.db');

        if (!fs.existsSync(path.dirname(DB_PATH))) {
          fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });
        }

        const nativeDb = new NativeDbClass(DB_PATH);
        nativeDb.exec('PRAGMA foreign_keys = ON;');
        initDatabase(nativeDb);
        dbInstance = nativeDb;
      } catch (e) {
        dbInstance = new UniversalDatabaseAdapter();
      }
    } else {
      dbInstance = new UniversalDatabaseAdapter();
    }
  }
  return dbInstance;
}

class UniversalDatabaseAdapter {
  private tables: Record<string, any[]> = {};

  constructor() {
    this.init();
  }

  private init() {
    const now = new Date().toISOString();
    this.tables['store_settings'] = [{
      id: 'settings-01',
      store_name: 'Jai Jinendra Grocery Mart',
      store_name_hi: 'जय जिनेन्द्र किराना मार्ट',
      phone: '9294646050',
      whatsapp: '9294646050',
      address: 'Station Road, Near Jain Mandir, Jaora',
      address_hi: 'स्टेशन रोड, जैन मंदिर के पास, जावरा',
      city: 'Jaora',
      state: 'Madhya Pradesh',
      pincode: '457226',
      business_hours: '8:00 AM - 9:30 PM (All 7 Days)',
      business_hours_hi: 'सुबह 8:00 से रात 9:30 (सातों दिन)',
      currency: 'INR',
      delivery_fee: 30.0,
      min_order_amount: 100.0,
      free_delivery_threshold: 499.0,
      estimated_delivery_min: 60,
      demo_payment_enabled: 1,
      demo_upi_id: 'jai.jinendra.demo@upi',
      demo_account_name: 'Jai Jinendra Grocery Mart DEMO',
      demo_account_number: '000000000000',
      demo_ifsc: 'DEMO0000000',
      created_at: now,
      updated_at: now,
    }];

    this.tables['roles'] = [
      { id: 'role-super-admin', name: 'Super Admin', description: 'Full unrestricted store and approval control', permissions_json: JSON.stringify(['*']) },
      { id: 'role-manager', name: 'Store Manager', description: 'Catalog, orders, customers and reports control', permissions_json: JSON.stringify(['products:*', 'orders:*', 'customers:*', 'reports:*', 'ai:chat']) },
      { id: 'role-staff', name: 'Staff', description: 'Order view and stock checking', permissions_json: JSON.stringify(['orders:read', 'orders:status', 'products:read']) }
    ];

    const passwordHash = bcrypt.hashSync('Admin@12345', 10);
    this.tables['admin_users'] = [
      { id: 'admin-01', name: 'Super Admin Jaora', email: 'admin@jaijinendra.com', password_hash: passwordHash, role: 'super_admin', two_factor_enabled: 0, active: 1, created_at: now, updated_at: now },
      { id: 'manager-01', name: 'Store Manager', email: 'manager@jaijinendra.com', password_hash: passwordHash, role: 'manager', two_factor_enabled: 0, active: 1, created_at: now, updated_at: now }
    ];

    this.tables['categories'] = SEED_CATEGORIES.map(c => ({ ...c, active: 1, created_at: now, updated_at: now }));
    this.tables['products'] = SEED_PRODUCTS.map(p => ({
      ...p,
      image_urls_json: JSON.stringify(p.image_urls),
      featured: p.featured ? 1 : 0,
      active: p.active ? 1 : 0,
      created_at: now,
      updated_at: now
    }));

    this.tables['coupons'] = [
      { id: 'cp-01', code: 'WELCOME50', discount_type: 'fixed', discount_value: 50, min_order_amount: 300, max_discount: 50, usage_limit: 500, used_count: 0, valid_from: '2026-01-01', valid_to: '2027-12-31', active: 1, created_at: now },
      { id: 'cp-02', code: 'JAORA10', discount_type: 'percentage', discount_value: 10, min_order_amount: 500, max_discount: 100, usage_limit: 500, used_count: 0, valid_from: '2026-01-01', valid_to: '2027-12-31', active: 1, created_at: now },
      { id: 'cp-03', code: 'FESTIVE100', discount_type: 'fixed', discount_value: 100, min_order_amount: 999, max_discount: 100, usage_limit: 200, used_count: 0, valid_from: '2026-01-01', valid_to: '2027-12-31', active: 1, created_at: now }
    ];

    this.tables['delivery_rules'] = [
      { id: 'rule-jaora-core', zone_name: 'Jaora Main Market & Station Road', pincode: '457226', base_fee: 30, min_order: 100, free_threshold: 499, estimated_minutes: 45, active: 1 },
      { id: 'rule-jaora-outer', zone_name: 'Jaora Suburbs & Outskirts', pincode: '457226', base_fee: 50, min_order: 200, free_threshold: 799, estimated_minutes: 90, active: 1 }
    ];

    this.tables['offers'] = [
      { id: 'offer-01', title_en: 'Festival Special: 20% OFF Basmati Rice 5kg', title_hi: 'त्योहार स्पेशल ऑफर: बास्मती चावल पर 20% छूट', description_en: 'Get 20% off on all Premium Basmati Rice packs. Limited time deal!', description_hi: 'प्रीमियम बासमती चावल पैकों पर 20% तक की भारी बचत!', discount_badge: 'FLAT 20% OFF', promo_code: 'WELCOME50', banner_url: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=800', active: 1, sort_order: 1, created_at: now, updated_at: now },
      { id: 'offer-02', title_en: 'Jaora Super Saver: Save ₹50 on Fortune Oil 5L', title_hi: 'जावरा सुपर सेवर: फ़ॉर्च्यून तेल पर ₹50 की छूट', description_en: 'Save ₹50 instantly on Fortune Sunflower Oil 5L jar with code JAORA10.', description_hi: 'फ़ॉर्च्यून तेल 5L जार पर कोड JAORA10 से पायें ₹50 की सीधी छूट!', discount_badge: 'SAVE ₹50', promo_code: 'JAORA10', banner_url: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=800', active: 1, sort_order: 2, created_at: now, updated_at: now },
      { id: 'offer-03', title_en: 'Free 45-Min Express Delivery in Jaora', title_hi: 'जावरा शहर में 45 मिनट में मुफ़्त डिलीवरी', description_en: 'Zero delivery fee on all grocery orders above ₹499 within Jaora town.', description_hi: '₹499+ के सभी ऑर्डर्स पर 45-60 मिनट में मुफ़्त होम डिलीवरी!', discount_badge: 'FREE DELIVERY', promo_code: 'FREEDEL', banner_url: 'https://images.unsplash.com/photo-1585994192701-f1a505c8574a?w=800', active: 1, sort_order: 3, created_at: now, updated_at: now }
    ];

    this.tables['customers'] = [
      { id: 'cust-01', name: 'Sunita Jain', phone: '9425198765', email: 'sunita.jain@yahoo.com', addresses_json: JSON.stringify([{ street: 'Bajaj Khana, Main Market', landmark: 'Near Jain Mandir', city: 'Jaora', state: 'MP', pincode: '457226', is_default: 1 }]), total_orders: 14, total_spent: 5890.0, active: 1, created_at: now, updated_at: now },
      { id: 'cust-02', name: 'Rajesh Sharma', phone: '9826012345', email: 'rajesh.sharma@gmail.com', addresses_json: JSON.stringify([{ street: 'Station Road', landmark: 'Near Railway Station', city: 'Jaora', state: 'MP', pincode: '457226', is_default: 1 }]), total_orders: 8, total_spent: 3420.0, active: 1, created_at: now, updated_at: now }
    ];

    this.tables['customer_reviews'] = [
      { id: 'rev-01', customer_id: 'cust-01', customer_name: 'Sunita Jain', customer_phone: '9425198765', product_id: 'p1', product_name: 'Fortune Sunlite Sunflower Oil 5L', rating: 5, comment: 'बहुत ही ताज़ा तेल और केवल 30 मिनट में जावरा बजाज खाना में मुफ़्त होम डिलीवरी मिली। धन्यवाद जय जिनेन्द्र किराना मार्ट!', reply: 'धन्यवाद सुनीता जी! जय जिनेन्द्र किराना मार्ट सदैव आपकी सेवा में तत्पर है।', status: 'published', created_at: now },
      { id: 'rev-02', customer_id: 'cust-02', customer_name: 'Rajesh Sharma', customer_phone: '9826012345', product_id: 'p2', product_name: 'Premium Basmati Rice 5kg', rating: 5, comment: 'Basmati rice quality is top notch! Grains are long and aroma is fresh. Very good price in Jaora.', reply: 'Thank you Rajesh ji! Glad you loved the quality.', status: 'published', created_at: now }
    ];

    this.tables['visitor_sessions'] = [
      { id: 'vis-01', ip_address: '103.240.192.12', location: 'Station Road, Jaora', device: 'Mobile (Android / Chrome)', current_page: '/shop', last_active: now },
      { id: 'vis-02', ip_address: '49.36.14.88', location: 'Bajaj Khana, Jaora', device: 'Mobile (iPhone / Safari)', current_page: '/checkout', last_active: now }
    ];

    this.tables['orders'] = [];
    this.tables['order_items'] = [];
    this.tables['payments'] = [];
    this.tables['activity_events'] = [
      { id: 'evt-init-01', timestamp: now, event_type: 'stock_change', severity: 'info', actor_name: 'System Seed', actor_type: 'system', summary: 'Jai Jinendra Grocery Mart store database initialized with 50 products across Jaora.', entity_type: 'system', entity_id: 'system-01', link: '/admin' }
    ];
    this.tables['audit_logs'] = [];
    this.tables['ai_approvals'] = [];
  }

  exec(sql: string) {
    // Schema creation no-op
  }

  prepare(sql: string) {
    const self = this;
    const lowerSql = sql.trim().toLowerCase();

    let targetTable = '';
    const tableMatch = lowerSql.match(/from\s+([a_z0-9_]+)/i) || lowerSql.match(/into\s+([a_z0-9_]+)/i) || lowerSql.match(/update\s+([a_z0-9_]+)/i) || lowerSql.match(/delete\s+from\s+([a_z0-9_]+)/i);
    if (tableMatch) {
      targetTable = tableMatch[1];
    }

    return {
      get(...params: any[]) {
        const rows = self.queryRows(sql, params, targetTable);
        return rows[0] || null;
      },
      all(...params: any[]) {
        return self.queryRows(sql, params, targetTable);
      },
      run(...params: any[]) {
        return self.executeRun(sql, params, targetTable);
      }
    };
  }

  private queryRows(sql: string, params: any[], tableName: string): any[] {
    const lowerSql = sql.trim().toLowerCase();
    const table = this.tables[tableName] || [];

    if (lowerSql.includes('count(*)')) {
      let filtered = table;
      if (lowerSql.includes('where')) {
        filtered = this.filterRows(table, lowerSql, params);
      }
      return [{ count: filtered.length }];
    }

    if (lowerSql.includes('sum(total)')) {
      let filtered = table.filter((r: any) => r.order_status !== 'cancelled');
      const sum = filtered.reduce((acc: number, curr: any) => acc + (Number(curr.total) || 0), 0);
      return [{ rev: sum, count: filtered.length }];
    }

    let results = [...table];

    if (lowerSql.includes('where')) {
      results = this.filterRows(results, lowerSql, params);
    }

    if (lowerSql.includes('order by')) {
      if (lowerSql.includes('created_at desc') || lowerSql.includes('timestamp desc') || lowerSql.includes('last_active desc')) {
        results.sort((a, b) => (b.created_at || b.timestamp || b.last_active || '').localeCompare(a.created_at || a.timestamp || a.last_active || ''));
      } else if (lowerSql.includes('base_fee asc') || lowerSql.includes('selling_price asc')) {
        results.sort((a, b) => (Number(a.base_fee || a.selling_price || 0) - Number(b.base_fee || b.selling_price || 0)));
      }
    }

    const limitMatch = lowerSql.match(/limit\s+(\d+)/i);
    if (limitMatch) {
      const limitVal = parseInt(limitMatch[1], 10);
      results = results.slice(0, limitVal);
    }

    return results;
  }

  private filterRows(rows: any[], sql: string, params: any[]): any[] {
    return rows.filter((row) => {
      if (sql.includes('code =') && params.length > 0) {
        return String(row.code).toLowerCase() === String(params[0]).toLowerCase();
      }
      if (sql.includes('email =') && params.length > 0) {
        return String(row.email).toLowerCase() === String(params[0]).toLowerCase();
      }
      if (sql.includes('id =') && params.length > 0) {
        return String(row.id) === String(params[0]);
      }
      if (sql.includes('customer_phone =') && params.length > 0) {
        return String(row.customer_phone || row.phone) === String(params[0]);
      }
      if (sql.includes('active = 1') || sql.includes('active = ?')) {
        if (row.active !== undefined && row.active !== 1 && row.active !== true) return false;
      }
      return true;
    });
  }

  private executeRun(sql: string, params: any[], tableName: string): { changes: number } {
    const lowerSql = sql.trim().toLowerCase();
    if (!this.tables[tableName]) {
      this.tables[tableName] = [];
    }

    if (lowerSql.startsWith('insert')) {
      const newRecord: any = { id: 'gen-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6) };
      params.forEach((val, i) => {
        newRecord['param_' + i] = val;
      });
      if (params.length > 0 && typeof params[0] === 'string' && params[0].length > 2) {
        newRecord.id = params[0];
      }
      this.tables[tableName].push(newRecord);
      return { changes: 1 };
    }

    if (lowerSql.startsWith('update')) {
      const rows = this.tables[tableName] || [];
      rows.forEach((r) => {
        if (params.length > 0 && r.id === params[params.length - 1]) {
          r.updated_at = new Date().toISOString();
        }
      });
      return { changes: 1 };
    }

    if (lowerSql.startsWith('delete')) {
      if (params.length > 0) {
        this.tables[tableName] = (this.tables[tableName] || []).filter(r => r.id !== params[0]);
      }
      return { changes: 1 };
    }

    return { changes: 0 };
  }
}

function initDatabase(db: any) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS store_settings (
      id TEXT PRIMARY KEY,
      store_name TEXT NOT NULL,
      store_name_hi TEXT NOT NULL,
      phone TEXT NOT NULL,
      whatsapp TEXT NOT NULL,
      address TEXT NOT NULL,
      address_hi TEXT NOT NULL,
      city TEXT NOT NULL,
      state TEXT NOT NULL,
      pincode TEXT NOT NULL,
      business_hours TEXT NOT NULL,
      business_hours_hi TEXT NOT NULL,
      currency TEXT NOT NULL DEFAULT 'INR',
      delivery_fee REAL NOT NULL DEFAULT 30,
      min_order_amount REAL NOT NULL DEFAULT 100,
      free_delivery_threshold REAL NOT NULL DEFAULT 499,
      estimated_delivery_min INTEGER NOT NULL DEFAULT 60,
      demo_payment_enabled INTEGER NOT NULL DEFAULT 1,
      demo_upi_id TEXT NOT NULL,
      demo_account_name TEXT NOT NULL,
      demo_account_number TEXT NOT NULL,
      demo_ifsc TEXT NOT NULL,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS roles (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT,
      permissions_json TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS admin_users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'staff',
      two_factor_enabled INTEGER NOT NULL DEFAULT 0,
      two_factor_secret TEXT,
      active INTEGER NOT NULL DEFAULT 1,
      last_login TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS categories (
      id TEXT PRIMARY KEY,
      name_en TEXT NOT NULL,
      name_hi TEXT NOT NULL,
      slug TEXT UNIQUE NOT NULL,
      icon TEXT NOT NULL,
      sort_order INTEGER NOT NULL DEFAULT 0,
      active INTEGER NOT NULL DEFAULT 1,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS products (
      id TEXT PRIMARY KEY,
      name_en TEXT NOT NULL,
      name_hi TEXT NOT NULL,
      description_en TEXT NOT NULL,
      description_hi TEXT NOT NULL,
      image_urls_json TEXT NOT NULL,
      category_id TEXT NOT NULL,
      sku TEXT UNIQUE NOT NULL,
      barcode TEXT,
      unit TEXT NOT NULL,
      mrp REAL NOT NULL,
      selling_price REAL NOT NULL,
      discount_percent REAL NOT NULL DEFAULT 0,
      gst_rate REAL NOT NULL DEFAULT 0,
      hsn_code TEXT NOT NULL,
      stock_quantity INTEGER NOT NULL DEFAULT 0,
      reorder_level INTEGER NOT NULL DEFAULT 5,
      expiry_date TEXT,
      featured INTEGER NOT NULL DEFAULT 0,
      active INTEGER NOT NULL DEFAULT 1,
      sort_order INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      FOREIGN KEY (category_id) REFERENCES categories (id)
    );

    CREATE TABLE IF NOT EXISTS customers (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      phone TEXT UNIQUE NOT NULL,
      email TEXT,
      addresses_json TEXT,
      total_orders INTEGER NOT NULL DEFAULT 0,
      total_spent REAL NOT NULL DEFAULT 0,
      active INTEGER NOT NULL DEFAULT 1,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS addresses (
      id TEXT PRIMARY KEY,
      customer_id TEXT,
      street TEXT NOT NULL,
      landmark TEXT,
      city TEXT NOT NULL,
      state TEXT NOT NULL,
      pincode TEXT NOT NULL,
      is_default INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS carts (
      id TEXT PRIMARY KEY,
      session_id TEXT UNIQUE NOT NULL,
      customer_id TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS cart_items (
      id TEXT PRIMARY KEY,
      cart_id TEXT NOT NULL,
      product_id TEXT NOT NULL,
      quantity INTEGER NOT NULL,
      unit_price REAL NOT NULL,
      FOREIGN KEY (cart_id) REFERENCES carts (id) ON DELETE CASCADE,
      FOREIGN KEY (product_id) REFERENCES products (id)
    );

    CREATE TABLE IF NOT EXISTS coupons (
      id TEXT PRIMARY KEY,
      code TEXT UNIQUE NOT NULL,
      discount_type TEXT NOT NULL,
      discount_value REAL NOT NULL,
      min_order_amount REAL NOT NULL DEFAULT 0,
      max_discount REAL,
      usage_limit INTEGER NOT NULL DEFAULT 1000,
      used_count INTEGER NOT NULL DEFAULT 0,
      valid_from TEXT NOT NULL,
      valid_to TEXT NOT NULL,
      active INTEGER NOT NULL DEFAULT 1,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS delivery_rules (
      id TEXT PRIMARY KEY,
      zone_name TEXT NOT NULL,
      pincode TEXT NOT NULL,
      base_fee REAL NOT NULL,
      min_order REAL NOT NULL,
      free_threshold REAL NOT NULL,
      estimated_minutes INTEGER NOT NULL,
      active INTEGER NOT NULL DEFAULT 1
    );

    CREATE TABLE IF NOT EXISTS orders (
      id TEXT PRIMARY KEY,
      order_number TEXT UNIQUE NOT NULL,
      customer_name TEXT NOT NULL,
      customer_phone TEXT NOT NULL,
      customer_email TEXT,
      delivery_address TEXT NOT NULL,
      landmark TEXT,
      pincode TEXT NOT NULL,
      delivery_note TEXT,
      contact_language TEXT NOT NULL DEFAULT 'en',
      subtotal REAL NOT NULL,
      discount REAL NOT NULL DEFAULT 0,
      coupon_code TEXT,
      delivery_fee REAL NOT NULL DEFAULT 0,
      tax REAL NOT NULL DEFAULT 0,
      total REAL NOT NULL,
      payment_method TEXT NOT NULL,
      payment_status TEXT NOT NULL,
      order_status TEXT NOT NULL DEFAULT 'received',
      notes TEXT,
      cancel_reason TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS order_items (
      id TEXT PRIMARY KEY,
      order_id TEXT NOT NULL,
      product_id TEXT NOT NULL,
      product_name_en TEXT NOT NULL,
      product_name_hi TEXT NOT NULL,
      unit TEXT NOT NULL,
      quantity INTEGER NOT NULL,
      unit_price REAL NOT NULL,
      total_price REAL NOT NULL,
      gst_rate REAL NOT NULL,
      hsn_code TEXT NOT NULL,
      FOREIGN KEY (order_id) REFERENCES orders (id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS payments (
      id TEXT PRIMARY KEY,
      order_id TEXT NOT NULL,
      payment_method TEXT NOT NULL,
      payment_status TEXT NOT NULL,
      transaction_id TEXT NOT NULL,
      amount REAL NOT NULL,
      currency TEXT NOT NULL DEFAULT 'INR',
      details_json TEXT,
      created_at TEXT NOT NULL,
      FOREIGN KEY (order_id) REFERENCES orders (id)
    );

    CREATE TABLE IF NOT EXISTS activity_events (
      id TEXT PRIMARY KEY,
      timestamp TEXT NOT NULL,
      event_type TEXT NOT NULL,
      severity TEXT NOT NULL DEFAULT 'info',
      actor_name TEXT NOT NULL,
      actor_type TEXT NOT NULL DEFAULT 'system',
      summary TEXT NOT NULL,
      entity_type TEXT NOT NULL,
      entity_id TEXT NOT NULL,
      link TEXT NOT NULL,
      metadata_json TEXT
    );

    CREATE TABLE IF NOT EXISTS audit_logs (
      id TEXT PRIMARY KEY,
      timestamp TEXT NOT NULL,
      user_id TEXT,
      user_email TEXT,
      action TEXT NOT NULL,
      resource TEXT NOT NULL,
      details_json TEXT,
      ip_address TEXT
    );

    CREATE TABLE IF NOT EXISTS offers (
      id TEXT PRIMARY KEY,
      title_en TEXT NOT NULL,
      title_hi TEXT NOT NULL,
      description_en TEXT NOT NULL,
      description_hi TEXT NOT NULL,
      discount_badge TEXT NOT NULL,
      promo_code TEXT,
      banner_url TEXT,
      category_id TEXT,
      product_id TEXT,
      active INTEGER NOT NULL DEFAULT 1,
      sort_order INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS ai_conversations (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      title TEXT NOT NULL,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS ai_tool_calls (
      id TEXT PRIMARY KEY,
      conversation_id TEXT NOT NULL,
      tool_name TEXT NOT NULL,
      arguments_json TEXT NOT NULL,
      result_json TEXT,
      status TEXT NOT NULL,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS ai_approvals (
      id TEXT PRIMARY KEY,
      conversation_id TEXT NOT NULL,
      tool_name TEXT NOT NULL,
      proposed_action TEXT NOT NULL,
      entity_type TEXT NOT NULL,
      entity_id TEXT,
      preview_data_json TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'pending',
      reviewed_by TEXT,
      reviewed_at TEXT,
      result_summary TEXT,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS report_exports (
      id TEXT PRIMARY KEY,
      report_type TEXT NOT NULL,
      date_range TEXT NOT NULL,
      format TEXT NOT NULL,
      file_name TEXT NOT NULL,
      created_by TEXT NOT NULL,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS notifications (
      id TEXT PRIMARY KEY,
      type TEXT NOT NULL,
      title TEXT NOT NULL,
      message TEXT NOT NULL,
      read INTEGER NOT NULL DEFAULT 0,
      link TEXT,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS customer_reviews (
      id TEXT PRIMARY KEY,
      customer_id TEXT,
      customer_name TEXT NOT NULL,
      customer_phone TEXT NOT NULL,
      product_id TEXT,
      product_name TEXT NOT NULL,
      rating INTEGER NOT NULL DEFAULT 5,
      comment TEXT NOT NULL,
      reply TEXT,
      status TEXT NOT NULL DEFAULT 'published',
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS visitor_sessions (
      id TEXT PRIMARY KEY,
      ip_address TEXT NOT NULL,
      location TEXT NOT NULL,
      device TEXT NOT NULL,
      current_page TEXT NOT NULL,
      last_active TEXT NOT NULL
    );
  `);

  seedInitialData(db);
}

function seedInitialData(db: any) {
  const now = new Date().toISOString();

  // 1. Settings
  const settingsCount = db.prepare('SELECT COUNT(*) as count FROM store_settings').get() as { count: number };
  if (settingsCount.count === 0) {
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
  }

  // 2. Roles
  const rolesCount = db.prepare('SELECT COUNT(*) as count FROM roles').get() as { count: number };
  if (rolesCount.count === 0) {
    const insertRole = db.prepare('INSERT INTO roles (id, name, description, permissions_json) VALUES (?, ?, ?, ?)');
    insertRole.run('role-super-admin', 'Super Admin', 'Full unrestricted store and approval control', JSON.stringify(['*']));
    insertRole.run('role-manager', 'Store Manager', 'Catalog, orders, customers and reports control', JSON.stringify(['products:*', 'orders:*', 'customers:*', 'reports:*', 'ai:chat']));
    insertRole.run('role-staff', 'Staff', 'Order view and stock checking', JSON.stringify(['orders:read', 'orders:status', 'products:read']));
  }

  // 3. Admin Users
  const adminCount = db.prepare('SELECT COUNT(*) as count FROM admin_users').get() as { count: number };
  if (adminCount.count === 0) {
    const insertAdmin = db.prepare(`
      INSERT INTO admin_users (
        id, name, email, password_hash, role, two_factor_enabled, active, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const passwordHash = bcrypt.hashSync('Admin@12345', 10);
    insertAdmin.run('admin-01', 'Super Admin Jaora', 'admin@jaijinendra.com', passwordHash, 'super_admin', 0, 1, now, now);
    insertAdmin.run('manager-01', 'Store Manager', 'manager@jaijinendra.com', passwordHash, 'manager', 0, 1, now, now);
  }

  // 4. Categories
  const catCount = db.prepare('SELECT COUNT(*) as count FROM categories').get() as { count: number };
  if (catCount.count === 0) {
    const insertCat = db.prepare(`
      INSERT INTO categories (id, name_en, name_hi, slug, icon, sort_order, active, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    for (const cat of SEED_CATEGORIES) {
      insertCat.run(cat.id, cat.name_en, cat.name_hi, cat.slug, cat.icon, cat.sort_order, 1, now, now);
    }
  }

  // 5. Products (50 items)
  const prodCount = db.prepare('SELECT COUNT(*) as count FROM products').get() as { count: number };
  if (prodCount.count === 0) {
    const insertProd = db.prepare(`
      INSERT INTO products (
        id, name_en, name_hi, description_en, description_hi, image_urls_json,
        category_id, sku, barcode, unit, mrp, selling_price, discount_percent,
        gst_rate, hsn_code, stock_quantity, reorder_level, featured, active,
        sort_order, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    for (const p of SEED_PRODUCTS) {
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
  }

  // 6. Coupons
  const couponCount = db.prepare('SELECT COUNT(*) as count FROM coupons').get() as { count: number };
  if (couponCount.count === 0) {
    const insertCoupon = db.prepare(`
      INSERT INTO coupons (id, code, discount_type, discount_value, min_order_amount, max_discount, usage_limit, used_count, valid_from, valid_to, active, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    insertCoupon.run('cp-01', 'WELCOME50', 'fixed', 50, 300, 50, 500, 0, '2026-01-01', '2027-12-31', 1, now);
    insertCoupon.run('cp-02', 'JAORA10', 'percentage', 10, 500, 100, 500, 0, '2026-01-01', '2027-12-31', 1, now);
    insertCoupon.run('cp-03', 'FESTIVE100', 'fixed', 100, 999, 100, 200, 0, '2026-01-01', '2027-12-31', 1, now);
  }

  // 7. Delivery Rules
  const deliveryCount = db.prepare('SELECT COUNT(*) as count FROM delivery_rules').get() as { count: number };
  if (deliveryCount.count === 0) {
    const insertRule = db.prepare(`
      INSERT INTO delivery_rules (id, zone_name, pincode, base_fee, min_order, free_threshold, estimated_minutes, active)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);

    insertRule.run('rule-jaora-core', 'Jaora Town (Core)', '457226', 30, 100, 499, 45, 1);
    insertRule.run('rule-jaora-outer', 'Jaora Suburbs & Outskirts', '457226', 50, 200, 799, 90, 1);
  }

  // 8. Offers & Deals Seed
  const offerCount = db.prepare('SELECT COUNT(*) as count FROM offers').get() as { count: number };
  if (offerCount.count === 0) {
    const insertOffer = db.prepare(`
      INSERT INTO offers (id, title_en, title_hi, description_en, description_hi, discount_badge, promo_code, banner_url, active, sort_order, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    insertOffer.run(
      'offer-01',
      'Festival Special: 20% OFF Basmati Rice 5kg',
      'त्योहार स्पेशल ऑफर: बास्मती चावल पर 20% छूट',
      'Get 20% off on all Premium Basmati Rice packs. Limited time deal!',
      'प्रीमियम बासमती चावल पैकों पर 20% तक की भारी बचत!',
      'FLAT 20% OFF',
      'WELCOME50',
      'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=800',
      1,
      1,
      now,
      now
    );

    insertOffer.run(
      'offer-02',
      'Jaora Super Saver: Save ₹50 on Fortune Oil 5L',
      'जावरा सुपर सेवर: फ़ॉर्च्यून तेल पर ₹50 की छूट',
      'Save ₹50 instantly on Fortune Sunflower Oil 5L jar with code JAORA10.',
      'फ़ॉर्च्यून तेल 5L जार पर कोड JAORA10 से पायें ₹50 की सीधी छूट!',
      'SAVE ₹50',
      'JAORA10',
      'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=800',
      1,
      2,
      now,
      now
    );

    insertOffer.run(
      'offer-03',
      'Free 45-Min Express Delivery in Jaora',
      'जावरा शहर में 45 मिनट में मुफ़्त डिलीवरी',
      'Zero delivery fee on all grocery orders above ₹499 within Jaora town.',
      '₹499+ के सभी ऑर्डर्स पर 45-60 मिनट में मुफ़्त होम डिलीवरी!',
      'FREE DELIVERY',
      'FREEDEL',
      'https://images.unsplash.com/photo-1585994192701-f1a505c8574a?w=800',
      1,
      3,
      now,
      now
    );
  }

  // 9. Customers Seed
  const custCount = db.prepare('SELECT COUNT(*) as count FROM customers').get() as { count: number };
  if (custCount.count === 0) {
    const insertCust = db.prepare(`
      INSERT INTO customers (id, name, phone, email, addresses_json, total_orders, total_spent, active, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, 1, ?, ?)
    `);

    insertCust.run(
      'cust-01',
      'Sunita Jain',
      '9425198765',
      'sunita.jain@yahoo.com',
      JSON.stringify([{ street: 'Bajaj Khana, Main Market', landmark: 'Near Jain Mandir', city: 'Jaora', state: 'MP', pincode: '457226', is_default: 1 }]),
      14,
      5890.0,
      now,
      now
    );

    insertCust.run(
      'cust-02',
      'Rajesh Sharma',
      '9826012345',
      'rajesh.sharma@gmail.com',
      JSON.stringify([{ street: 'Station Road', landmark: 'Near Railway Station', city: 'Jaora', state: 'MP', pincode: '457226', is_default: 1 }]),
      8,
      3420.0,
      now,
      now
    );

    insertCust.run(
      'cust-03',
      'Amit Rathore',
      '9893211223',
      'amit.rathore@outlook.com',
      JSON.stringify([{ street: 'Jawahar Path', landmark: 'Near Bus Stand', city: 'Jaora', state: 'MP', pincode: '457226', is_default: 1 }]),
      4,
      1850.0,
      now,
      now
    );

    insertCust.run(
      'cust-04',
      'Priya Verma',
      '9753456789',
      'priya.verma@gmail.com',
      JSON.stringify([{ street: 'Court Colony', landmark: 'Behind Civil Court', city: 'Jaora', state: 'MP', pincode: '457226', is_default: 1 }]),
      5,
      2100.0,
      now,
      now
    );

    insertCust.run(
      'cust-05',
      'Rahul Oswal',
      '9179887766',
      'rahul.oswal@gmail.com',
      JSON.stringify([{ street: 'Piploda Road', landmark: 'Industrial Area', city: 'Jaora', state: 'MP', pincode: '457226', is_default: 1 }]),
      9,
      4250.0,
      now,
      now
    );
  }

  // 10. Customer Reviews Seed
  const revCount = db.prepare('SELECT COUNT(*) as count FROM customer_reviews').get() as { count: number };
  if (revCount.count === 0) {
    const insertRev = db.prepare(`
      INSERT INTO customer_reviews (id, customer_id, customer_name, customer_phone, product_id, product_name, rating, comment, reply, status, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'published', ?)
    `);

    insertRev.run(
      'rev-01',
      'cust-01',
      'Sunita Jain',
      '9425198765',
      'p1',
      'Fortune Sunlite Sunflower Oil 5L',
      5,
      'बहुत ही ताज़ा तेल और केवल 30 मिनट में जावरा बजाज खाना में मुफ़्त होम डिलीवरी मिली। धन्यवाद जय जिनेन्द्र किराना मार्ट!',
      'धन्यवाद सुनीता जी! जय जिनेन्द्र किराना मार्ट सदैव आपकी सेवा में तत्पर है।',
      now
    );

    insertRev.run(
      'rev-02',
      'cust-02',
      'Rajesh Sharma',
      '9826012345',
      'p2',
      'Premium Basmati Rice 5kg',
      5,
      'Basmati rice quality is top notch! Grains are long and aroma is fresh. Very good price in Jaora.',
      'Thank you Rajesh ji! Glad you loved the quality.',
      now
    );

    insertRev.run(
      'rev-03',
      'cust-05',
      'Rahul Oswal',
      '9179887766',
      'p3',
      'Aashirvaad Shudh Chakki Atta 10kg',
      5,
      'Fresh batch atta delivered straight to my home on Piploda Road. Excellent WhatsApp order notifications!',
      'Thank you Rahul ji for your feedback!',
      now
    );

    insertRev.run(
      'rev-04',
      'cust-04',
      'Priya Verma',
      '9753456789',
      'p4',
      'Amul Taaza T-Special Milk 1L',
      4,
      'Milk packets were fresh and cold. Great delivery speed near Court Colony.',
      'Thank you Priya ji!',
      now
    );

    insertRev.run(
      'rev-05',
      'cust-03',
      'Amit Rathore',
      '9893211223',
      'p5',
      'Tata Salt Vacuum Evaporated 1kg',
      5,
      'Quick Cash on Delivery service and genuine grocery items. Will order again!',
      'Thank you Amit ji!',
      now
    );
  }

  // 11. Visitor Sessions Seed
  const visCount = db.prepare('SELECT COUNT(*) as count FROM visitor_sessions').get() as { count: number };
  if (visCount.count === 0) {
    const insertVis = db.prepare(`
      INSERT INTO visitor_sessions (id, ip_address, location, device, current_page, last_active)
      VALUES (?, ?, ?, ?, ?, ?)
    `);

    insertVis.run('vis-01', '103.240.192.12', 'Station Road, Jaora', 'Mobile (Android / Chrome)', '/shop', now);
    insertVis.run('vis-02', '49.36.14.88', 'Bajaj Khana, Jaora', 'Mobile (iPhone / Safari)', '/checkout', now);
    insertVis.run('vis-03', '157.33.201.4', 'Jawahar Path, Jaora', 'Desktop (Windows / Edge)', '/', now);
    insertVis.run('vis-04', '106.213.89.55', 'Court Colony, Jaora', 'Mobile (Android / Samsung)', '/shop', now);
    insertVis.run('vis-05', '49.36.18.102', 'Piploda Road, Jaora', 'Mobile (iPhone / Safari)', '/', now);
  }

  // 12. Activity Events Seed
  const eventCount = db.prepare('SELECT COUNT(*) as count FROM activity_events').get() as { count: number };
  if (eventCount.count === 0) {
    const insertEvent = db.prepare(`
      INSERT INTO activity_events (id, timestamp, event_type, severity, actor_name, actor_type, summary, entity_type, entity_id, link)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    insertEvent.run(
      'evt-init-01',
      now,
      'stock_change',
      'info',
      'System Seed',
      'system',
      'Jai Jinendra Grocery Mart store database initialized with 50 products across Jaora.',
      'system',
      'system-01',
      '/admin'
    );

    insertEvent.run(
      'evt-init-02',
      now,
      'order_placed',
      'success',
      'Sunita Jain',
      'customer',
      'New Order #ORD-2026-1001 placed for Bajaj Khana, Jaora (Total: ₹780)',
      'order',
      'ORD-2026-1001',
      '/admin'
    );

    insertEvent.run(
      'evt-init-03',
      now,
      'review_submitted',
      'info',
      'Rajesh Sharma',
      'customer',
      '5-Star Customer Review submitted for Premium Basmati Rice 5kg',
      'review',
      'rev-02',
      '/admin'
    );
  }
}

export function logActivity(
  eventType: string,
  severity: 'info' | 'warning' | 'success' | 'critical',
  actorName: string,
  actorType: 'customer' | 'admin' | 'system' | 'ai',
  summary: string,
  entityType: string,
  entityId: string,
  link: string,
  metadata?: any
) {
  try {
    const db = getDatabase();
    const id = 'evt-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7);
    const stmt = db.prepare(`
      INSERT INTO activity_events (id, timestamp, event_type, severity, actor_name, actor_type, summary, entity_type, entity_id, link, metadata_json)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    stmt.run(
      id,
      new Date().toISOString(),
      eventType,
      severity,
      actorName,
      actorType,
      summary,
      entityType,
      entityId,
      link,
      metadata ? JSON.stringify(metadata) : null
    );
  } catch (err) {
    console.error('Error logging activity event:', err);
  }
}

export function logAudit(
  action: string,
  resource: string,
  userEmail?: string,
  userId?: string,
  details?: any,
  ipAddress?: string
) {
  try {
    const db = getDatabase();
    const id = 'aud-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7);
    const stmt = db.prepare(`
      INSERT INTO audit_logs (id, timestamp, user_id, user_email, action, resource, details_json, ip_address)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);
    stmt.run(
      id,
      new Date().toISOString(),
      userId || null,
      userEmail || 'system',
      action,
      resource,
      details ? JSON.stringify(details) : null,
      ipAddress || '127.0.0.1'
    );
  } catch (err) {
    console.error('Error logging audit:', err);
  }
}
