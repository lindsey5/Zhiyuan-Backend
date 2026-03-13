interface PermissionAttributes {
    id: number;
    action: string;
    role_id: number;
}

interface RoleAttributes {
    id: number;
    name: string; 
    description: string;
}

interface UserAttributes {
    id: number;
    firstname: string;
    lastname: string;
    email: string;
    password: string;
    role_id: number;
}