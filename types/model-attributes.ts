import { Document, Types } from "mongoose";

export interface PermissionAttributes extends Document {
    action: string;
    role_id: Types.ObjectId;
}

export interface RoleAttributes extends Document {
    name: string;
    description: string;
    permissions?: PermissionAttributes[];
}

export interface UserAttributes extends Document {
    firstname: string;
    lastname: string;
    email: string;
    password: string;
    role_id: Types.ObjectId;
    status?: "active" | "deleted";
    matchPassword(plainPassword: string): Promise<boolean>
    role: RoleAttributes;
}

export interface ProductAttributes extends Document {
    product_name: string;
    description: string;
    thumbnail_public_id: string;
    thumbnail_url: string;
    category: string;
    status?: "active" | "deleted";
    variants?: VariantAttributes[];
}

export interface VariantAttributes extends Document {
    product_id: Types.ObjectId;
    variant_name: string;
    stock: number;
    price: number;
    image_public_id: string;
    image_url: string;
    sku: string;
    status?: "active" | "deleted";
}

export interface AuditLogAttributes extends Document {
    user_id: Types.ObjectId;
    role: string;
    action: string;
    description: string;
    severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
    ip_address: string;
    user_agent: string;
    old_values: Record<string, any> | null; 
    new_values: Record<string, any> | null;
    user: UserAttributes;
}

export interface CategoryAttributes extends Document {
    name: string;
    status?: "active" | "inactive";
}

export interface OrderAttributes extends Document {
    order_id: string;
    customer_name: string;
    status: "pending" | "processing" | "completed" | "cancelled";
    total_amount: number;
    delivery_type: "pickup" | "delivery";
    payment_method: "COD" | "GCash" | "Card";
    payment_status: "paid" | "unpaid";
}

export interface OrderItemAttributes extends Document {
    order_id: Types.ObjectId;
    variant_id: Types.ObjectId;
    quantity: number;
    amount: number;
    price: number;
}

export interface DistributorAttributes extends Document {
    distributor_id: string;
    parent_distributor_id: Types.ObjectId | null;
    distributor_name: string;
    commission_rate: number;
    wallet_balance: number;
    email: string;
    password: string;
    status: "active" | "deleted";
    
    matchPassword(plainPassword: string): Promise<boolean>;
}