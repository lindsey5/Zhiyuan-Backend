export interface PermissionAttributes {
    id: number;
    action: string;
    role_id: number;
}

export interface RoleAttributes {
    id: number;
    name: string; 
    description: string;
    createdAt?: Date;
}

export interface UserAttributes {
    id: number;
    firstname: string;
    lastname: string;
    email: string;
    password: string;
    role_id: number;
    status?: 'active' | 'deleted';
    createdAt?: Date;
}

export interface ProductAttributes {
    id: number;
    product_name: string;
    description: string;
    thumbnail_public_id: string;
    thumbnail_url: string;
    category: string;
    createdAt?: Date;
    status?: 'active' | 'inactive'
}

export interface VariantAttributes {
    id: number;
    product_id: number;
    variant_name: string;
    stock: number;
    price: number;
    image_public_id: string;
    image_url: string;
    sku: string;
    status?: 'active' | 'inactive',
    createdAt?: Date;
}

export interface AuditLogAttributes{
    id: number;
    user_id: number;
    role: string;
    action: string;
    description: string;
    severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
    ip_address: string;
    user_agent: string;
    old_values: string | null;
    new_values: string | null;
    createdAt: Date;
}

export interface CategoryAttributes{
    id: number;
    name: string;
    createdAt?: Date;
    status?: 'active' | 'inactive'
}

export interface OrderAttributes {
    id: number;
    order_id: string;
    customer_name: string;
    status: 'pending' | 'processing' | 'completed' | 'cancelled';
    total_amount: number;
    order_date: Date;
    delivery_type: 'pickup' | 'delivery';
    payment_method: 'COD' | 'GCash' | 'Card';
    payment_status: 'paid' | 'unpaid';
}

export interface OrderItemAttributes {
    id: number;
    order_id: number;
    variant_id: number;
    quantity: number;
    amount: number;
    price: number;
}

export interface DistributorAttributes {
    id: number;
    parent_distributor_id?: number;
    creator?: number;
    distributor_name: string;
    email: string;
    password: string;
    commission_rate: number;
    wallet_balance: number;
    status: 'active' | 'deleted',
    createdAt: Date;
}

export interface DistributorStockAttributes {
    id: number;
    distributor_id: number;
    variant_id: number;
    quantity: number;
}

export interface StockTransferAttributes {
    id: number;
    transfer_id: number;
    user_id?: number;
    sender_id?: number;
    receiver_id: number;
    quantity: number;
    variant_id: number;
    price: number;
    createdAt: Date;
}

export interface DistributorSaleAttributes {
    id: number;
    seller_id: number;
    quantity: number;
    total_amount: number;
    createdAt: Date;
}

export interface CommissionLogAttributes {
    id: number;
    sale_id: number;
    receiver_id: number;
    commission_rate: number;
    commission_amount: number;
    createdAt: Date;
}