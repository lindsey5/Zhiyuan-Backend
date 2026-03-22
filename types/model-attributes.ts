export interface PermissionAttributes {
    id: number;
    action: string;
    role_id: number;
}

export interface RoleAttributes {
    id: number;
    name: string; 
    description: string;
}

export interface UserAttributes {
    id: number;
    firstname: string;
    lastname: string;
    email: string;
    password: string;
    role_id: number;
}

export interface ProductAttributes {
    id: number;
    product_name: string;
    description: string;
    thumbnail_public_id: string;
    thumbnail_url: string;
    category: string;
    createdAt?: Date;
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
    old_values: Record<string, any> | null;
    new_values: Record<string, any> | null;
    createdAt: Date;
}