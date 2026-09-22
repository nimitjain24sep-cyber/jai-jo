export interface StoreSettings {
  id: string;
  store_name: string;
  store_name_hi: string;
  phone: string;
  whatsapp: string;
  address: string;
  address_hi: string;
  city: string;
  state: string;
  pincode: string;
  business_hours: string;
  business_hours_hi: string;
  currency: string;
  delivery_fee: number;
  min_order_amount: number;
  free_delivery_threshold: number;
  estimated_delivery_min: number;
  demo_payment_enabled: boolean;
  demo_upi_id: string;
  demo_account_name: string;
  demo_account_number: string;
  demo_ifsc: string;
  announcement_en?: string;
  announcement_hi?: string;
  hero_headline_en?: string;
  hero_headline_hi?: string;
  hero_subtitle_en?: string;
  hero_subtitle_hi?: string;
  created_at: string;
  updated_at: string;
}

export interface Offer {
  id: string;
  title_en: string;
  title_hi: string;
  description_en: string;
  description_hi: string;
  discount_badge: string;
  promo_code?: string;
  banner_url?: string;
  category_id?: string;
  product_id?: string;
  active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  password_hash: string;
  role: 'super_admin' | 'manager' | 'staff';
  two_factor_enabled: boolean;
  two_factor_secret?: string;
  active: boolean;
  last_login?: string;
  created_at: string;
  updated_at: string;
}

export interface Role {
  id: string;
  name: string;
  description: string;
  permissions: string[];
}

export interface Category {
  id: string;
  name_en: string;
  name_hi: string;
  slug: string;
  icon: string;
  sort_order: number;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Product {
  id: string;
  name_en: string;
  name_hi: string;
  description_en: string;
  description_hi: string;
  image_urls: string[]; // JSON string or parsed array
  category_id: string;
  sku: string;
  barcode: string;
  unit: string; // e.g. "5kg", "1kg", "1L", "500ml", "pack"
  mrp: number;
  selling_price: number;
  discount_percent: number;
  gst_rate: number; // e.g. 0, 5, 12, 18
  hsn_code: string;
  stock_quantity: number;
  reorder_level: number;
  expiry_date?: string;
  featured: boolean;
  active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  email?: string;
  addresses_json?: string;
  total_orders: number;
  total_spent: number;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Address {
  id: string;
  customer_id?: string;
  street: string;
  landmark: string;
  city: string;
  state: string;
  pincode: string;
  is_default: boolean;
  created_at: string;
}

export interface CartItem {
  product_id: string;
  product: Product;
  quantity: number;
  unit_price: number;
}

export interface Coupon {
  id: string;
  code: string;
  discount_type: 'percentage' | 'fixed';
  discount_value: number;
  min_order_amount: number;
  max_discount?: number;
  usage_limit: number;
  used_count: number;
  valid_from: string;
  valid_to: string;
  active: boolean;
  created_at: string;
}

export interface DeliveryRule {
  id: string;
  zone_name: string;
  pincode: string;
  base_fee: number;
  min_order: number;
  free_threshold: number;
  estimated_minutes: number;
  active: boolean;
}

export type OrderStatus =
  | 'received'
  | 'confirmed'
  | 'preparing'
  | 'out_for_delivery'
  | 'delivered'
  | 'cancelled'
  | 'refunded';

export type PaymentMethod = 'cod' | 'demo_upi';
export type PaymentStatus = 'pending' | 'completed' | 'failed' | 'refunded';

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  product_name_en: string;
  product_name_hi: string;
  unit: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  gst_rate: number;
  hsn_code: string;
}

export interface Order {
  id: string;
  order_number: string;
  customer_name: string;
  customer_phone: string;
  customer_email?: string;
  delivery_address: string;
  landmark?: string;
  pincode: string;
  delivery_note?: string;
  contact_language: 'en' | 'hi';
  subtotal: number;
  discount: number;
  coupon_code?: string;
  delivery_fee: number;
  tax: number;
  total: number;
  payment_method: PaymentMethod;
  payment_status: PaymentStatus;
  order_status: OrderStatus;
  notes?: string;
  cancel_reason?: string;
  items?: OrderItem[];
  created_at: string;
  updated_at: string;
}

export interface Payment {
  id: string;
  order_id: string;
  payment_method: PaymentMethod;
  payment_status: PaymentStatus;
  transaction_id: string;
  amount: number;
  currency: string;
  details_json?: string;
  created_at: string;
}

export interface ActivityEvent {
  id: string;
  timestamp: string;
  event_type:
    | 'new_order'
    | 'payment_update'
    | 'stock_change'
    | 'customer_registration'
    | 'admin_login'
    | 'product_edit'
    | 'order_status_change'
    | 'low_stock_alert'
    | 'report_export'
    | 'ai_recommendation'
    | 'ai_approval';
  severity: 'info' | 'warning' | 'success' | 'critical';
  actor_name: string;
  actor_type: 'customer' | 'admin' | 'system' | 'ai';
  summary: string;
  entity_type: string;
  entity_id: string;
  link: string;
  metadata_json?: string;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  user_id?: string;
  user_email?: string;
  action: string;
  resource: string;
  details_json?: string;
  ip_address?: string;
}

export interface AiConversation {
  id: string;
  user_id: string;
  title: string;
  created_at: string;
  updated_at: string;
}

export interface AiToolCall {
  id: string;
  conversation_id: string;
  tool_name: string;
  arguments_json: string;
  result_json?: string;
  status: 'pending' | 'success' | 'failed' | 'requires_approval';
  created_at: string;
}

export interface AiApproval {
  id: string;
  conversation_id: string;
  tool_name: string;
  proposed_action: string;
  entity_type: 'product' | 'order' | 'stock' | 'refund' | 'setting' | 'policy';
  entity_id?: string;
  preview_data: {
    title: string;
    description: string;
    target: string;
    current_value: any;
    proposed_value: any;
    impact_assessment: string;
    action_payload: any;
  };
  status: 'pending' | 'approved' | 'rejected';
  reviewed_by?: string;
  reviewed_at?: string;
  result_summary?: string;
  created_at: string;
}

export interface ReportExport {
  id: string;
  report_type: 'sales' | 'products' | 'categories' | 'stock' | 'low_stock' | 'cancellations' | 'payment_types' | 'customers' | 'gst';
  date_range: string;
  format: 'csv' | 'pdf';
  file_name: string;
  created_by: string;
  created_at: string;
}

export interface Notification {
  id: string;
  type: 'order' | 'stock' | 'approval' | 'system';
  title: string;
  message: string;
  read: boolean;
  link?: string;
  created_at: string;
}
