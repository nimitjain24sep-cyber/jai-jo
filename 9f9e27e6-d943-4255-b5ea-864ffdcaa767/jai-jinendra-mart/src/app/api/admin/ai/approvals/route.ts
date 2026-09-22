import { NextRequest, NextResponse } from 'next/server';
import { getDatabase, logActivity, logAudit } from '@/lib/db';
import { requireAdminRole } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const auth = requireAdminRole(req, ['super_admin', 'manager', 'staff']);
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const db = getDatabase();
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status') || 'pending';

    let query = 'SELECT * FROM ai_approvals';
    const params: any[] = [];

    if (status !== 'all') {
      query += ' WHERE status = ?';
      params.push(status);
    }
    query += ' ORDER BY created_at DESC LIMIT 50';

    const approvals = db.prepare(query).all(...params).map((a: any) => ({
      ...a,
      preview_data: JSON.parse(a.preview_data_json || '{}'),
    }));

    return NextResponse.json({ approvals });
  } catch (err: any) {
    return NextResponse.json({ error: 'Failed to fetch approvals', details: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    // Only super_admin can approve or reject sensitive AI proposals
    const auth = requireAdminRole(req, ['super_admin']);
    if (auth.error) {
      return NextResponse.json(
        { error: 'Strict Security Violation: Only Super-Admins can approve or reject AI-proposed changes.' },
        { status: 403 }
      );
    }

    const { approval_id, action } = await req.json();

    if (!approval_id || (action !== 'approve' && action !== 'reject')) {
      return NextResponse.json({ error: 'Valid approval_id and action (approve/reject) are required' }, { status: 400 });
    }

    const db = getDatabase();
    const item = db.prepare('SELECT * FROM ai_approvals WHERE id = ?').get(approval_id) as any;
    if (!item) {
      return NextResponse.json({ error: 'Approval request not found' }, { status: 404 });
    }

    if (item.status !== 'pending') {
      return NextResponse.json({ error: `Approval already resolved as '${item.status}'` }, { status: 400 });
    }

    const now = new Date().toISOString();
    const preview = JSON.parse(item.preview_data_json || '{}');
    const payload = preview.action_payload || {};

    if (action === 'reject') {
      db.prepare(`
        UPDATE ai_approvals
        SET status = 'rejected',
            reviewed_by = ?,
            reviewed_at = ?,
            result_summary = 'Proposal rejected by Super-Admin'
        WHERE id = ?
      `).run(auth.session!.name, now, approval_id);

      logActivity('ai_approval', 'warning', auth.session!.name, 'admin', `AI proposal rejected: ${item.proposed_action}`, 'ai_approval', approval_id, '/admin');
      logAudit('REJECT_AI_PROPOSAL', 'ai_approvals', auth.session!.email, auth.session!.id, { approval_id, action: item.proposed_action });

      return NextResponse.json({ success: true, status: 'rejected', message: 'Proposal has been rejected.' });
    }

    // Action is APPROVE -> Execute atomically
    db.exec('BEGIN TRANSACTION;');
    let executionSummary = '';

    try {
      if (payload.type === 'UPDATE_PRODUCT_PRICE') {
        const prod = db.prepare('SELECT mrp, name_en FROM products WHERE id = ?').get(payload.productId) as any;
        const discountPercent = prod.mrp > 0 ? Math.round(((prod.mrp - payload.newPrice) / prod.mrp) * 100) : 0;

        db.prepare(`
          UPDATE products
          SET selling_price = ?,
              discount_percent = ?,
              updated_at = ?
          WHERE id = ?
        `).run(Number(payload.newPrice), discountPercent, now, payload.productId);

        executionSummary = `Price updated to ₹${payload.newPrice} for ${prod.name_en}`;
      } else if (payload.type === 'UPDATE_STOCK_QUANTITY') {
        const prod = db.prepare('SELECT name_en FROM products WHERE id = ?').get(payload.productId) as any;
        db.prepare(`
          UPDATE products
          SET stock_quantity = ?,
              updated_at = ?
          WHERE id = ?
        `).run(Number(payload.newStock), now, payload.productId);

        executionSummary = `Stock quantity updated to ${payload.newStock} for ${prod.name_en}`;
      } else {
        executionSummary = `Executed action: ${payload.type}`;
      }

      db.prepare(`
        UPDATE ai_approvals
        SET status = 'approved',
            reviewed_by = ?,
            reviewed_at = ?,
            result_summary = ?
        WHERE id = ?
      `).run(auth.session!.name, now, executionSummary, approval_id);

      db.exec('COMMIT;');
    } catch (execErr: any) {
      db.exec('ROLLBACK;');
      return NextResponse.json({ error: 'Execution failed: ' + execErr.message }, { status: 500 });
    }

    logActivity('ai_approval', 'success', auth.session!.name, 'admin', `Super-Admin approved AI action: ${executionSummary}`, 'ai_approval', approval_id, '/admin');
    logAudit('APPROVE_AI_PROPOSAL', 'ai_approvals', auth.session!.email, auth.session!.id, { approval_id, executionSummary });

    return NextResponse.json({
      success: true,
      status: 'approved',
      message: executionSummary,
    });
  } catch (err: any) {
    return NextResponse.json({ error: 'Failed to process approval', details: err.message }, { status: 500 });
  }
}
