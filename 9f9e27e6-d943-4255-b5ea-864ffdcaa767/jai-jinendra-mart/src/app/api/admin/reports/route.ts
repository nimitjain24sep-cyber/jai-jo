import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/db';
import { requireAdminRole } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const auth = requireAdminRole(req, ['super_admin', 'manager']);
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const { searchParams } = new URL(req.url);
    const format = searchParams.get('format');
    const reportType = searchParams.get('type') || 'overview';

    const db = getDatabase();

    // 1. Overall stats
    const totalRevenueRow = db.prepare('SELECT SUM(total) as revenue FROM orders WHERE order_status != "cancelled"').get() as any;
    const totalRevenue = totalRevenueRow?.revenue || 0;

    const totalOrdersRow = db.prepare('SELECT COUNT(*) as count FROM orders').get() as any;
    const totalOrders = totalOrdersRow?.count || 0;

    const activeProductsRow = db.prepare('SELECT COUNT(*) as count FROM products WHERE active = 1').get() as any;
    const activeProducts = activeProductsRow?.count || 0;

    const lowStockProducts = db.prepare('SELECT * FROM products WHERE stock_quantity <= reorder_level AND active = 1 ORDER BY stock_quantity ASC').all() as any[];

    // 2. Order status counts
    const statusCounts = db.prepare(`
      SELECT order_status, COUNT(*) as count, SUM(total) as revenue
      FROM orders
      GROUP BY order_status
    `).all();

    // 3. Payment methods
    const paymentCounts = db.prepare(`
      SELECT payment_method, COUNT(*) as count, SUM(total) as amount
      FROM orders
      GROUP BY payment_method
    `).all();

    // 4. GST Breakdown by HSN code
    const gstBreakdown = db.prepare(`
      SELECT
        hsn_code,
        gst_rate,
        SUM(total_price) as taxable_amount,
        SUM((total_price * gst_rate) / 100) as tax_amount
      FROM order_items
      GROUP BY hsn_code, gst_rate
    `).all();

    // 5. Top 5 Products by sales
    const topProducts = db.prepare(`
      SELECT
        product_name_en,
        unit,
        SUM(quantity) as units_sold,
        SUM(total_price) as revenue
      FROM order_items
      GROUP BY product_id
      ORDER BY units_sold DESC
      LIMIT 5
    `).all();

    // Handle CSV export request
    if (format === 'csv') {
      let csvContent = '';
      let filename = 'report.csv';

      if (reportType === 'sales') {
        filename = `jjm_sales_report_${Date.now()}.csv`;
        csvContent = 'Order Number,Customer Name,Phone,Date,Status,Payment Method,Subtotal,Discount,Delivery Fee,Total\n';
        const orders = db.prepare('SELECT * FROM orders ORDER BY created_at DESC').all() as any[];
        for (const o of orders) {
          csvContent += `"${o.order_number}","${o.customer_name}","${o.customer_phone}","${o.created_at}","${o.order_status}","${o.payment_method}",${o.subtotal},${o.discount},${o.delivery_fee},${o.total}\n`;
        }
      } else if (reportType === 'inventory' || reportType === 'stock') {
        filename = `jjm_inventory_report_${Date.now()}.csv`;
        csvContent = 'SKU,Product Name (EN),Product Name (HI),Category,Unit,MRP,Selling Price,Stock Quantity,Reorder Level,HSN,GST Rate\n';
        const products = db.prepare('SELECT p.*, c.name_en as cat_name FROM products p LEFT JOIN categories c ON p.category_id = c.id ORDER BY p.name_en ASC').all() as any[];
        for (const p of products) {
          csvContent += `"${p.sku}","${p.name_en}","${p.name_hi}","${p.cat_name || ''}","${p.unit}",${p.mrp},${p.selling_price},${p.stock_quantity},${p.reorder_level},"${p.hsn_code}",${p.gst_rate}%\n`;
        }
      } else if (reportType === 'gst') {
        filename = `jjm_gst_report_${Date.now()}.csv`;
        csvContent = 'HSN Code,GST Slab,Taxable Value (INR),Tax Collected (INR)\n';
        for (const g of gstBreakdown as any[]) {
          csvContent += `"${g.hsn_code}",${g.gst_rate}%,${g.taxable_amount || 0},${Math.round((g.tax_amount || 0) * 100) / 100}\n`;
        }
      }

      return new NextResponse(csvContent, {
        headers: {
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': `attachment; filename="${filename}"`,
        },
      });
    }

    return NextResponse.json({
      summary: {
        totalRevenue: Math.round(totalRevenue * 100) / 100,
        totalOrders,
        activeProducts,
        lowStockCount: lowStockProducts.length,
      },
      statusCounts,
      paymentCounts,
      gstBreakdown,
      topProducts,
      lowStockProducts: lowStockProducts.map((p) => ({
        id: p.id,
        name_en: p.name_en,
        name_hi: p.name_hi,
        sku: p.sku,
        unit: p.unit,
        stock_quantity: p.stock_quantity,
        reorder_level: p.reorder_level,
      })),
    });
  } catch (err: any) {
    return NextResponse.json({ error: 'Failed to generate report', details: err.message }, { status: 500 });
  }
}
