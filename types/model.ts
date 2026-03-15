import { Role, Permission } from '../models/index';

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

export interface UserWithRole extends UserAttributes {
    role?: Role & {
        permissions?: Permission[];
    };
}

export interface ProductAttributes {
    id: number;
    product_name: string;
    description: string;
    thumbnail: string;
}

export interface VariantAttributes {
    id: number;
    product_id: number;
    variant_name: string;
    variant_image: string;
    stock: number;
}