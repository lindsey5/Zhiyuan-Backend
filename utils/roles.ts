import PERMISSIONS from "./permissions";

const ROLES = {
    SUPER_ADMIN: {
        name: 'Super Admin',
        description: 'Full access to the system',
        permissions: Object.values(PERMISSIONS)
    },
    Receptionist: {
        name: 'Receptionist',
        description: 'Handles day-to-day operations for walk-in customers',
        permissions: [
            'order:read:all',
            'order:update',
            "order:sales:view",
            'product:read:all',
            'product:low-stock:view',
            'category:read:all'
        ]
    },
    'Distributor\'s Admin': {
        name: 'Distributor\'s Admin',
        description: 'Manages distributor operations.',
        permissions: [
            // Product management
            'product:read:all',
            'product:low-stock:view',

            // Category management
            'category:read:all',

            // Distributor Management
            'distributor:read:all',
            'distrubutor:create',
            'distributor:delete',

            // Distributor Stock Management
            'distributor-stock:view',

            // Distributor Stats
            'distributor-stats:view',

            // Distributor Sales
            'distributor-sales:view',
            'distributor-sales:view:all',

            // Distributor Commissions
            'distributor-commissions:view',

            // Distributor Return Request
            'distributor-return:view',
            'distributor-return:update',

            // Distributor Reports
            'distributor-reports:view',

            // Sponsored Items
            'sponsored-items:update',
            'sponsored-items:view:all',

            // Transfer Logs
            'tranfer-logs:view:own',
            'transfer-logs:update',
            'transfer-logs:create',

            // Stock Orders
            'stock-orders:view:all',
            'stock-orders:update',
        ]
    },
    "Inventory": {
        name: 'Inventory',
        description: 'Manages Inventory',
        permissions: [
            // Product management
            'product:read:all',
            'product:low-stock:view',
            'product:create',
            'product:update',
            'product:delete',

            //Category management
            'category:read:all',
            'category:create',
            'category:update',
            'category:delete',
        ]
    }
}

export default ROLES;