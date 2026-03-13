import PERMISSIONS from "./permissions";

const ROLES = {
    ADMIN: {
        name: 'Admin',
        description: 'Full access to the system',
        permissions: Object.values(PERMISSIONS)
    },
}

export default ROLES