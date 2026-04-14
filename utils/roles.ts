import PERMISSIONS from "./permissions";

const ROLES = {
    ADMIN: {
        name: 'Admin',
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
        name: 'Inventory Supervisor',
        description: 'Supervises and manages inventory operations.',
        permissions: [
            'product:create',
            'product:update',
            'product:delete',
        ]
    }
}

export default ROLES;