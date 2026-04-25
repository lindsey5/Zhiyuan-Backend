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
            'product:read:all',
            'category:read:all'
        ]
    },
    'Distributor\'s Admin': {
        name: 'Distributor\'s Admin',
        description: 'Manages distributor operations.',
        permissions: [
            // Product management
            'product:read:all',
            'product:create',
            'product:update',
            'product:delete',

            // Category management
            'category:read:all',
            'category:create',
            'category:update',
            'category:delete',

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
            'tranfer-logs:view:all',
            'transfer-logs:update',
            'distributor-stock:transfer',

            // Stock Orders
            'stock-orders:view:all',
            'stock-orders:update',
        ]
    }
}

export default ROLES;