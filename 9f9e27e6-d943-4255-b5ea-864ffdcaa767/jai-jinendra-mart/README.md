# Jai Jinendra Grocery Mart (जय जिनेन्द्र किराना मार्ट)
### E-Commerce Web Application • Jaora, Madhya Pradesh, India (PIN: 457226)

A production-grade, bilingual (English & Hindi) grocery e-commerce web application engineered specifically for **Jai Jinendra Grocery Mart** in Jaora, MP. Built with Next.js 14+, React 18, TypeScript, Tailwind CSS, and Node.js built-in native SQLite (`node:sqlite`).

---

## 🏬 Store Overview & Context
- **Business**: General Grocery & Daily Essentials
- **Location**: Station Road, Near Jain Mandir, Jaora, Ratlam District, Madhya Pradesh - 457226
- **WhatsApp & Phone**: `9294646050`
- **Languages Supported**: English & हिन्दी (Full bilingual switch with persistent storage)
- **Home Delivery**: Yes (Same-day doorstep delivery within 45-60 mins across Jaora; Free delivery on orders above ₹499)

---

## 🚀 Key Features

### 1. Customer Application (3 Main Dedicated Routes)
- **Route 1: `/` (Home)**
  - Top local announcement strip with Jaora delivery promise and WhatsApp quick contact.
  - Sticky navbar with store branding, English-Hindi switcher, live search autocomplete, and cart counter.
  - Promotional hero banner, Jaora trust badges, category circular grid, and featured products shelf.
  - Local store hours (8:00 AM - 9:30 PM) and footer with customer policies modal.
- **Route 2: `/shop` (Shop)**
  - Searchable catalogue containing all **50 pre-seeded daily grocery items**.
  - Multi-faceted filtering: Category, Price range slider (up to ₹400), In-stock only filter, and Sorting (Price Low-High, High-Low, Name, Featured).
  - Product Card with discount badges, unit information, stock indicators, and quantity steppers clamped to available inventory.
  - Product specifications modal detailing bilingual descriptions, HSN codes, and GST slabs.
  - Responsive Cart Drawer with live subtotal, dynamic free delivery progress bar, and coupon application.
- **Route 3: `/checkout` (Checkout, Order Tracking & Contact)**
  - Form validation for 10-digit Indian mobile numbers (`^[6-9]\d{9}$`), customer name, Jaora delivery address, landmark, PIN code (`457226`), and language preference.
  - Server-calculated totals (subtotal, coupon discounts, delivery fees, GST tax breakdown, final total).
  - Payment modes: Cash on Delivery (COD) and Demo UPI/QR (with clear testing disclaimer).
  - Post-order confirmation with Order ID, status, and direct "Share Order on WhatsApp" button (`9294646050`).
  - **Secure Order Tracking**: Strict privacy verification requiring both Order ID + Phone Number to prevent cross-customer data exposure. Visual timeline tracker (`Received` ➔ `Confirmed` ➔ `Preparing` ➔ `Out for Delivery` ➔ `Delivered`).
  - Local contact section with store hours and shop location details.

### 2. Admin Management System (`/admin` & `/admin/login`)
- **Authentication & Security**:
  - Hashed passwords via `bcryptjs`.
  - Secure HTTP-only JWT session cookies.
  - Login rate limiting (sliding window prevention against brute-force attacks).
  - Role-Based Access Control (`super_admin`, `manager`, `staff`).
  - Optional 2FA code input.
  - Server-side authorization check guarding all admin API endpoints.
  - Immutable audit logs for all administrative actions.
- **14 Admin Sidebar Sections**:
  1. **Overview**: Metric summary cards (Revenue, Orders, Catalog, Low Stock), quick orders, and low-stock alerts.
  2. **Products**: Full CRUD modal, bilingual copy, image validation, units, MRP, selling price, GST rates, HSN codes, stock counts, reorder levels, and CSV export.
  3. **Categories**: Category management with icons and ordering.
  4. **Orders**: Status transition workflow, internal notes, cancel/refund with reason, printable GST tax invoice, and customer WhatsApp notification generator.
  5. **Customers**: Directory with order count, total spending, and addresses.
  6. **Delivery**: Jaora delivery zones, pincode rules, minimum order amount, and free delivery thresholds.
  7. **Coupons**: Discount code management (`WELCOME50`, `JAORA10`, `FESTIVE100`).
  8. **Reports**: Real-time sales, inventory, and GST/HSN tax summaries with CSV export.
  9. **Live Activity**: Near-realtime activity stream with severity tags and entity links.
  10. **AI Assistant**: Dashboard chat assistant with safe read tools (sales metrics, low stock, product copy, translations) and strict isolation for sensitive write operations (price changes, stock updates) requiring human-in-the-loop super-admin approval.
  11. **Website Content**: Announcements, hero banners, store policies, and opening hours.
  12. **Settings**: Store parameters, tax rates, payment placeholders, and backup export.
  13. **Admin Users**: Staff user administration.
  14. **Audit Logs**: Immutable log view.

---

## 📦 50 Pre-Seeded Local Grocery Products

All 50 products specified in the master prompt are seeded with bilingual names, realistic Jaora market prices, units, HSN codes, GST slabs, and initial inventory:
1. Rice 5kg (`1006`, 0% GST)
2. Wheat flour/Atta 5kg (`1101`, 0% GST)
3. Toor dal 1kg (`0713`, 0% GST)
4. Moong dal 1kg (`0713`, 0% GST)
5. Chana dal 1kg (`0713`, 0% GST)
6. Masoor dal 1kg (`0713`, 0% GST)
7. Rajma 1kg (`0713`, 0% GST)
8. Kabuli chana 1kg (`0713`, 0% GST)
9. Sugar 1kg (`1701`, 5% GST)
10. Salt 1kg (`2501`, 0% GST)
11. Refined cooking oil 1L (`1507`, 5% GST)
12. Mustard oil 1L (`1514`, 5% GST)
13. Tea 250g (`0902`, 5% GST)
14. Instant coffee 100g (`2101`, 18% GST)
15. Milk 1L (`0401`, 0% GST)
16. Curd 500g (`0403`, 0% GST)
17. Butter 100g (`0405`, 12% GST)
18. Bread 400g (`1905`, 0% GST)
19. Biscuits pack (`1905`, 18% GST)
20. Namkeen pack (Ratlami Sev) (`2106`, 12% GST)
21. Poha 1kg (`1104`, 0% GST)
22. Sooji/rava 1kg (`1103`, 0% GST)
23. Besan 1kg (`1106`, 0% GST)
24. Maida 1kg (`1101`, 0% GST)
25. Spices combo pack (`0910`, 5% GST)
26. Turmeric powder 100g (`0910`, 5% GST)
27. Red chilli powder 100g (`0904`, 5% GST)
28. Coriander powder 100g (`0909`, 5% GST)
29. Garam masala 100g (`0910`, 5% GST)
30. Cumin seeds 100g (`0909`, 5% GST)
31. Black pepper 50g (`0904`, 5% GST)
32. Pickle 500g (`2001`, 12% GST)
33. Tomato ketchup 500g (`2103`, 12% GST)
34. Jam 500g (`2007`, 12% GST)
35. Noodles pack (`1902`, 18% GST)
36. Vermicelli/seviyan 200g (`1902`, 5% GST)
37. Bath soap pack (`3401`, 18% GST)
38. Toothpaste 150g (`3306`, 18% GST)
39. Toothbrush pack (`9603`, 18% GST)
40. Shampoo 180ml (`3305`, 18% GST)
41. Hair oil 200ml (`3305`, 18% GST)
42. Washing powder 1kg (`3402`, 18% GST)
43. Dishwashing liquid 500ml (`3402`, 18% GST)
44. Toilet cleaner 500ml (`3402`, 18% GST)
45. Floor cleaner 1L (`3402`, 18% GST)
46. Laundry soap bar pack (`3401`, 18% GST)
47. Tissue/napkin pack (`4818`, 12% GST)
48. Garbage bags pack (`3923`, 18% GST)
49. Matchbox pack (`3605`, 12% GST)
50. Aluminium foil pack (`7607`, 18% GST)

---

## 🛠️ Setup and Execution Instructions

### Prerequisites
- Node.js v22+ or v24+ (Node 24 includes built-in `node:sqlite`)
- npm v10+

### Quick Start
```bash
# 1. Navigate to the project folder
cd C:\Users\sky\.gemini\antigravity\scratch\jai-jinendra-mart

# 2. Install dependencies
npm install

# 3. Initialize database and seed 50 products
node scripts/init-db.mjs

# 4. Run automated test suite
npm test

# 5. Start the local development server
npm run dev
```

Visit the application:
- Customer Storefront: `http://localhost:3000`
- Shop Catalogue: `http://localhost:3000/shop`
- Checkout & Order Tracking: `http://localhost:3000/checkout`
- Admin Login: `http://localhost:3000/admin/login`

---

## 🔑 Default Admin Credentials
- **Email**: `admin@jaijinendra.com`
- **Password**: `Admin@12345`
- **Role**: `super_admin` (Full store authority + AI approvals)
- **Store Manager**: `manager@jaijinendra.com` / `Admin@12345`

---

## ⚠️ Demo Payment Notice
As specified in the build requirements, all digital UPI and bank credentials in this application are strictly simulated for testing:
- **Demo UPI ID**: `jai.jinendra.demo@upi`
- **Demo Beneficiary**: `Jai Jinendra Grocery Mart DEMO`
- **Demo Account**: `000000000000`
- **Demo IFSC**: `DEMO0000000`

Never transfer real currency to these placeholder accounts.

---

## 🛡️ Pre-Launch Production Checklist
Before launching in a live production environment with real customers in Jaora:
1. [ ] **Payment Gateway**: Replace demo UPI with a verified server-side payment gateway (Razorpay, PhonePe PG, or Cashfree) with webhook verification.
2. [ ] **Domain & SSL**: Secure custom domain (e.g. `jaijinendragrocery.in`) with HTTPS / TLS certificates.
3. [ ] **Database Backups**: Schedule automated daily snapshots of `data/grocery.db`.
4. [ ] **Secrets Management**: Update `JWT_SECRET` in `.env.local` to a cryptographically secure 256-bit key.
5. [ ] **WhatsApp Business API**: Transition from web links to official WhatsApp Business API if high volume messaging is required.
6. [ ] **Regulatory Compliance**: Review FSSAI food licensing, local trade licenses, and state GST registrations with a qualified tax professional.
