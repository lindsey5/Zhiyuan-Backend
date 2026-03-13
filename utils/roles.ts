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
            'user:read:own',
            'user:update:own',
        ]
    }
}

export default ROLES