# Implementation Plan: Jai Jinendra Grocery Mart

Build a full-stack, responsive, bilingual (English & Hindi) e-commerce web application for **Jai Jinendra Grocery Mart** located in Jaora, Madhya Pradesh, India (WhatsApp: `9294646050`). The application will feature three dedicated customer-facing routes, 50 pre-seeded grocery products, Cash on Delivery & Demo UPI/QR flows, customer order tracking, a protected role-based admin management system, a live activity feed, an AI assistant with a strict super-admin approval workflow for sensitive actions, and an automated verification suite.

---

## User Review Required

> [!IMPORTANT]
> **Workspace Directory Recommendation**:
> Currently there is no active workspace opened in Antigravity. We will create the project inside:
> `C:\Users\sky\.gemini\antigravity\scratch\jai-jinendra-mart`
> We recommend opening this folder as your workspace in Antigravity for seamless file navigation and terminal commands.

> [!NOTE]
> **Demo Payments Warning**:
> In accordance with the project specification, UPI ID `jai.jinendra.demo@upi`, Account Number `000000000000`, and IFSC `DEMO0000000` are strictly simulated demo values accompanied by a prominent user warning. No real money will be transferred, and the architecture is prepared for seamless drop-in of real payment gateways (Razorpay, Cashfree, or PhonePe PG) with server-side webhooks.

---

## Proposed System Architecture

```mermaid
graph TD
    Client[Customer Device - Mobile/Desktop] -->|Bilingual UI / EN & HI| NextApp[Next.js 14+ App Router]
    Admin[Store Admin / Staff] -->|Protected Session & 2FA| AdminApp[/admin Dashboard]
    
    subgraph Core Web Application
        NextApp --> Routes[Customer Routes: / , /shop , /checkout]
        AdminApp --> AdminModules[Overview, Products, Orders, Customers, Reports, AI, Activity, Settings]
        
        Routes --> APILayer[Next.js API Route Handlers]
        AdminModules --> APILayer
        
        APILayer --> ServerValidation[Server Validation, Totals & Auth Guard]
        ServerValidation --> DB[(Node.js Built-in SQLite Database)]
        
        APILayer --> AIAssistant[AI Assistant Engine]
        AIAssistant --> SafeReadTools[Safe Read Tools: Sales, Stock, Copy, Translations]
        AIAssistant --> SensitiveWriteQueue[Pending Approvals Queue: Price, Stock, Refunds]
        SensitiveWriteQueue -->|Explicit Super-Admin Approval| DB
    end

    subgraph External & Live Integrations
        NextApp --> WhatsApp[WhatsApp Direct Ordering: 9294646050]
        AdminApp --> LiveFeed[Live Activity Stream & Audit Logs]
    end
```

---

## 8-Phase Execution Roadmap

### Phase 1: Project Setup, Theme, Responsive Shell & Environment Template
- Initialize a TypeScript + Tailwind CSS project at `C:\Users\sky\.gemini\antigravity\scratch\jai-jinendra-mart`.
- Configure custom theme colors:
  - **Forest Green** (`#15803d` / `#166534`)
  - **Saffron / Marigold** (`#ea580c` / `#f59e0b`)
  - **Fresh Cream** (`#fefce8` / `#f8fafc`)
  - **Dark Slate Text** (`#0f172a`)
- Implement responsive layout with mobile-first navigation, sticky header, bilingual switcher (English / हिन्दी), search trigger, and floating cart drawer.
- Create `.env.example` with safe placeholder configuration values and documentation.

### Phase 2: Database Schema, Migrations & 50 Seed Products
- Implement a zero-dependency relational persistence layer using Node 24's native `node:sqlite` (`data/grocery.db`).
- Define and migrate all 20 required entities with `created_at` and `updated_at`:
  1. `StoreSettings`
  2. `AdminUser`
  3. `Role`
  4. `Product`
  5. `Category`
  6. `Customer`
  7. `Address`
  8. `Cart`
  9. `CartItem`
  10. `Order`
  11. `OrderItem`
  12. `Payment`
  13. `Coupon`
  14. `DeliveryRule`
  15. `ActivityEvent`
  16. `AuditLog`
  17. `AiConversation`
  18. `AiToolCall`
  19. `AiApproval`
  20. `ReportExport` and `Notification`
- Seed the exact **50 specified products** across 8 local categories (Grains & Flours, Pulses & Dals, Staples, Cooking Oils & Ghee, Beverages, Dairy & Fresh, Snacks & Instant Foods, Personal Care, Household & Cleaning) with bilingual names, realistic Jaora prices in ₹, HSN codes, GST slabs (0%, 5%, 12%, 18%), and stock levels.

### Phase 3: Customer Pages, Cart & Bilingual UI
- **Route 1: `/` (Home)**:
  - Top delivery promise strip for Jaora (PIN 457226), free delivery alert (> ₹499).
  - Bilingual navigation header, live search autocomplete, cart toggle.
  - Hero banner with grocery deals, quick WhatsApp order link (`9294646050`).
  - Category circular grid with Hindi/English tags and counts.
  - Featured products grid with stock indicators and quantity steppers.
  - Delivery trust badges, store hours (8:00 AM - 9:30 PM), Jaora address, and footer.
- **Route 2: `/shop` (Shop)**:
  - 50-product searchable catalogue with category tabs, price range filters, in-stock filter, and sorting (Price, Name, Popularity).
  - Product details modal with full bilingual description, HSN code, GST rate, unit, and shelf life.
  - Cart drawer with live subtotal, dynamic free delivery meter, and quantity limits clamped to available inventory.
- Complete English/Hindi i18n dictionaries for all customer-facing elements.

### Phase 4: Checkout, COD, Demo Payment & Order Tracking
- **Route 3: `/checkout` (Checkout, Tracking & Contact)**:
  - Form validation for Indian mobile numbers (`10 digits`), customer name, Jaora delivery address, landmark, PIN code (`457226`), and language preference.
  - Server-calculated checkout totals (subtotal, coupon discount, delivery fee, GST tax breakdown, final total).
  - Payment modes:
    - Cash on Delivery (COD).
    - Demo UPI/QR (with QR placeholder, `jai.jinendra.demo@upi`, Demo account `000000000000`, Demo IFSC `DEMO0000000`, and prominent demo warning).
  - Atomic order placement with stock decrements.
  - Post-order confirmation with Order ID, status, and direct "Share Order on WhatsApp" link.
  - Secure Order Lookup/Tracking section: requires Order ID + Phone Number to prevent cross-customer data exposure. Displays real-time timeline: `Received` ➔ `Confirmed` ➔ `Preparing` ➔ `Out for Delivery` ➔ `Delivered`.

### Phase 5: Admin Authentication & Role-Based Access Control
- Protected `/admin/login` and `/admin` routes.
- Secure session tokens, bcrypt/crypto-hashed passwords, login rate limiting, session expiry.
- Password reset simulation and optional 2FA verification.
- Roles: `Super Admin` (full access + AI approvals), `Store Manager` (catalog + order fulfillment), `Staff` (order view + stock count).
- Immutable audit logging for all authentication attempts and sensitive operations.

### Phase 6: Admin Dashboard, CRUD, Reports & Live Activity
- Build all 14 sidebar sections:
  1. **Overview**: Metric summary cards (Revenue, Orders, Products, Low Stock), sales charts, recent orders, quick actions.
  2. **Products**: Add/Edit/Archive modal, bilingual fields, GST/HSN, stock, reorder levels, CSV export, CSV import.
  3. **Categories**: Category manager with icons and ordering.
  4. **Orders**: Status workflow transitions (`received` ➔ `confirmed` ➔ `preparing` ➔ `out_for_delivery` ➔ `delivered` / `cancelled`), printable GST invoice, admin notes, WhatsApp message generator.
  5. **Customers**: Directory with order count, total spending, addresses.
  6. **Delivery**: Jaora delivery zones, pincode rules, minimum order, free delivery threshold.
  7. **Coupons**: Discount code management (e.g. `WELCOME50`, `JAORA10`).
  8. **Reports**: Sales, Inventory, GST/HSN tax summaries with CSV export and printable PDF layout.
  9. **Live Activity**: Near-realtime event feed with severity tags, timestamps, and entity links.
  10. **Website Content**: Announcements, hero banners, store policies (Refund, Privacy, Terms), WhatsApp CTA settings.
  11. **Settings**: Store settings, tax rates, payment placeholders, backup export.
  12. **Admin Users**: Staff user administration.
  13. **Audit Logs**: Immutable log view.
  14. **AI Assistant**: Discussed in Phase 7.

### Phase 7: AI Assistant with Human-in-the-Loop Approval Workflow
- AI chat interface inside `/admin`.
- **Safe Read Tools**:
  - `querySalesSummary`
  - `searchOrders`
  - `getLowStockAlerts`
  - `generateProductCopy` (English & Hindi)
  - `translateContent`
  - `draftWhatsAppMessage`
  - `restockSuggestions`
  - `analyzeCancellations`
- **Protected Sensitive Write Tools**:
  - `proposePriceChange`
  - `proposeStockAdjustment`
  - `proposeOrderCancellation`
  - `proposeRefund`
  - `proposePolicyUpdate`
- Structured 2-step approval workflow: Write actions generate an `AiApproval` request with before/after diffs and rationales. Only super-admins can click "Approve" or "Reject". No AI action directly mutates sensitive data without human sign-off.
- Full audit logging of all AI queries, tool calls, approvals, and executions.

### Phase 8: Testing, Security Review & Deployment Documentation
- Automated test suite:
  - Auth & access control tests (unauthenticated requests rejected).
  - Product CRUD & bilingual integrity.
  - Cart totals, GST calculations, and free delivery thresholds.
  - Order creation and atomic stock decrement.
  - Privacy verification: order tracking lookup rejects invalid phone/order pairs.
  - AI approval safety verification.
- Security review report and manual launch checklist.
- Production README with deployment guides, environment setup, backup instructions, and legal compliance notices (Indian GST, FSSAI / packaged food labeling guidelines).

---

## Verification Plan

### Automated Tests
Run test script verifying:
1. `test-auth.ts`: Authentication, session verification, and role guards.
2. `test-products.ts`: Product retrieval, stock decrement on order, out-of-stock prevention.
3. `test-order.ts`: Server-side total calculation, GST computation, coupon application, order creation.
4. `test-tracking.ts`: Order privacy check (lookup requires both correct order ID and customer phone).
5. `test-ai-approval.ts`: Verifies AI write tool generates pending approval and cannot execute directly.

### Manual Verification
1. Browse Home (`/`): Switch language between English and Hindi; verify all texts update seamlessly.
2. Browse Shop (`/shop`): Search for "Atta" or "आटा", filter by category "Grains & Flours", add items to cart, verify out-of-stock and quantity bounds.
3. Complete Checkout (`/checkout`): Place order via COD and Demo UPI; verify QR modal and disclaimer; check generated WhatsApp link.
4. Track Order: Enter order ID and phone number; test with wrong phone (should fail with privacy guard); verify timeline.
5. Admin Login (`/admin/login`): Log in as Super Admin; review dashboard, edit a product, transition order status, print invoice, and test AI assistant approval flow.
6. Verify production build succeeds (`npm run build`).
