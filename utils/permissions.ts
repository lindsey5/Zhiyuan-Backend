const PERMISSIONS = {
    DASHBOARD_VIEW: 'dashboard:view',
    AUDIT_VIEW_ALL: 'audit:view:all',

    // User management
    USER_CREATE: 'user:create',
    USER_READ_ALL: 'user:read:all',
    USER_UPDATE: 'user:update',
    USER_DELETE: 'user:delete',

    // Role management
    ROLE_CREATE: 'role:create',
    ROLE_READ_ALL: 'role:read:all',
    ROLE_UPDATE: 'role:update',
    ROLE_DELETE: 'role:delete',

    // Product management
    PRODUCT_READ_ALL: 'product:read:all',
    PRODUCT_CREATE: 'product:create',
    PRODUCT_UPDATE: 'product:update',
    PRODUCT_DELETE: 'product:delete',

    // Order management
    ORDER_READ_ALL: 'order:read:all',
    ORDER_UPDATE: 'order:update',

    //Category management
    CATEGORY_READ_ALL: 'category:read:all',
    CATEGORY_CREATE: 'category:create',
    CATEGORY_UPDATE: 'category:update',
    CATEGORY_DELETE: 'category:delete',

    // Distributor Management
    DISTRIBUTOR_READ_ALL: 'distributor:read:all',
    DISTRIBUTOR_CREATE: 'distrubutor:create',
    DISTRIBUTOR_DELETE: 'distributor:delete',
    
    // Distributor Stock Management
    DISTRIBUTOR_STOCK_VIEW: 'distributor-stock:view',

    // Distributor Stats
    DISTRIBUTOR_STATS_VIEW: 'distributor-stats:view',

    // Distributor Sales
    DISTRIBUTOR_SALES_VIEW: 'distributor-sales:view',

    DISTRIBUTOR_COMMISSIONS_VIEW: 'distributor-commissions:view',

    DISTRIBUTOR_RETURN_REQUEST_VIEW: 'distributor-return:view',
    DISTRIBUTOR_RETURN_REQUEST_UPDATE: 'distributor-return:update',

    // Distributor Reports
    DISTRIBUTOR_REPORTS_VIEW: 'distributor-reports:view',

    // Sponsored Items
    SPONSORED_PRODUCT_UPDATE: 'sponsored-items:update',
    SPONSORED_PRODUCT_VIEW_ALL: 'sponsored-items:view:all',

    // Transfer Logs
    STOCK_DISTRIBUTION_HISTORY_VIEW_ALL: 'tranfer-logs:view:all',
    STOCK_DISTRIBUTION_HISTORY_VIEW_OWN: 'tranfer-logs:view:own',
    STOCK_DISTRIBUTION_HISTORY_UPDATE: 'transfer-logs:update',
    STOCK_DISTRIBUTION_CREATE: 'transfer-logs:create',

    // Stock Orders
    STOCK_ORDERS_VIEW_ALL: 'stock-orders:view:all',
    STOCK_ORDERS_UPDATE: 'stock-orders:update',
}
export default PERMISSIONS