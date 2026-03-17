
const PERMISSIONS = {
    // User management
    USER_CREATE: 'user:create',
    USER_READ: 'user:read',
    USER_READ_OWN: 'user:read:own',
    USER_READ_ALL: 'user:read:all',
    USER_UPDATE: 'user:update',
    USER_UPDATE_OWN: 'user:update:own',
    USER_DELETE: 'user:delete',

    // Role management
    ROLE_CREATE: 'role:create',
    ROLE_READ: 'role:read',
    ROLE_READ_ALL: 'role:read:all',
    ROLE_UPDATE: 'role:update',
    ROLE_DELETE: 'role:delete',

    // Product management
    PRODUCT_CREATE: 'product:create',
    PRODUCT_UPDATE: 'product:update',
    PRODUCT_DELETE: 'product:delete'
}
export default PERMISSIONS