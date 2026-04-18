import PERMISSIONS from "./permissions";

const ROLES = {
    SUPER_ADMIN: {
        name: 'Super Admin',
        description: 'Full access to the system',
        permissions: Object.values(PERMISSIONS)
    },
    FRONT_DESK: {
        name: 'Front Desk',
        description: 'Handles day-to-day front desk operations.',
        permissions: [
            'order:read:all',
            'order:update',
            'product:read:all',
            'category:read:all'
        ]
    },
    INVENTORY_SUPERVISOR: {
        name: 'Distributor\'s Admin',
        description: 'Manages distributor operations.',
        permissions: [
            'tranfer-logs:view:all',

            // Product management
            'product:read:all',
            'product:create',
            'product:update',
            'product:delete',

            //Category management
            'category:read:all',
            'category:create',
            'category:update',
            'category:delete',

            // Distributor Management
            'distributor:read:all',
            'distrubutor:create',
            'distributor:delete',
            
            // Distributor Stock Management
            'distributor-stock:transfer',
            'distributor-stock:view',

            // Distributor Stats
            'distributor-stats:view',

            // Distributor Sales
            'distributor-sales:view',

            'distributor-return:view',
            'distributor-return:update',

            // Distributor Reports
            'distributor-reports:view',

            // Sponsored Items
            'sponsored-items:create',
            'sponsored-items:view:all',
        ]
    }
}

export default ROLES;