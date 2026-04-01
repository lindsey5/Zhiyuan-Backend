import AuditLog from "./AuditLog";
import CommissionLog from "./CommissionLog";
import Distributor from "./Distributor";
import DistributorSale from "./DistributorSale";
import DistributorStock from "./DistributorStock";
import Order from "./Order";
import OrderItem from "./OrderItem";
import Permission from "./Permission";
import Product from "./Product";
import Role from "./Role";
import StockTransfer from "./StockTransfer";
import User from "./User";
import Variant from "./Variant";

Role.hasMany(User, { 
    foreignKey: 'role_id', 
    as: 'users' 
});
User.belongsTo(Role, { 
    foreignKey: "role_id", 
    as: 'role', 
    onDelete: "SET NULL", 
});

Role.hasMany(Permission, {
    foreignKey: "role_id",
    as: "permissions",
    onDelete: "CASCADE",
    hooks: true,
});

Permission.belongsTo(Role, {
    foreignKey: "role_id",
    as: "role",
    onDelete: "CASCADE",
});

Product.hasMany(Variant, { 
    foreignKey: 'product_id', 
    as: 'variants' 
});
Variant.belongsTo(Product, { 
    foreignKey: 'product_id', 
    as: 'product' 
});

User.hasMany(AuditLog, { 
    foreignKey: 'user_id', 
    as: 'audit_logs' 
});
AuditLog.belongsTo(User, { 
    foreignKey: 'user_id', 
    as: 'user', 
    onDelete: "SET NULL"
 });

 Order.hasMany(OrderItem, {
    foreignKey: 'order_id',
    as: 'order_items',
    onDelete: 'CASCADE',
    hooks: true
 })

OrderItem.belongsTo(Order, {    
    foreignKey: 'order_id',
    as: 'order',
    onDelete: 'CASCADE'
})

// User → Distributor
User.hasMany(Distributor, {
    foreignKey: 'creator',
    as: 'distributors'
});

Distributor.belongsTo(User, {
    foreignKey: 'creator',
    as: 'user',
});

// Distributor Self-Reference (Parent → Children)
Distributor.hasMany(Distributor, {
    foreignKey: 'parent_distributor_id',
    as: 'recruits', // distributors recruited by this distributor
});
Distributor.belongsTo(Distributor, {
    foreignKey: 'parent_distributor_id',
    as: 'recruiter', // parent distributor
});

// Distributor → DistributorStock
Distributor.hasMany(DistributorStock, {
    foreignKey: 'distributor_id',
    as: 'stocks',
});
DistributorStock.belongsTo(Distributor, {
    foreignKey: 'distributor_id',
    as: 'distributor',
});

// Variant → DistributorStock
Variant.hasMany(DistributorStock, {
    foreignKey: 'variant_id',
    as: 'distributor_stocks',
});
DistributorStock.belongsTo(Variant, {
    foreignKey: 'variant_id',
    as: 'variant',
});

// Distributor → StockTransfer
Distributor.hasMany(StockTransfer, {
    foreignKey: 'sender_id',
    as: 'sent_transfers',
});
Distributor.hasMany(StockTransfer, {
    foreignKey: 'receiver_id',
    as: 'received_transfers',
});
StockTransfer.belongsTo(Distributor, {
    foreignKey: 'sender_id',
    as: 'sender',
});
StockTransfer.belongsTo(Distributor, {
    foreignKey: 'receiver_id',
    as: 'receiver',
});

// If StockTransfer also tracks a User (non-distributor) sender
User.hasMany(StockTransfer, {
    foreignKey: 'user_id',
    as: 'sent_transfers',
});
StockTransfer.belongsTo(User, {
    foreignKey: 'user_id',
    as: 'user',
});

// Variant → StockTransfer
Variant.hasMany(StockTransfer, {
    foreignKey: 'variant_id',
    as: 'transfers',
});
StockTransfer.belongsTo(Variant, {
    foreignKey: 'variant_id',
    as: 'variant',
});

// Distributor → DistributorSale
Distributor.hasMany(DistributorSale, {
    foreignKey: 'seller_id',
    as: 'sales',
});
DistributorSale.belongsTo(Distributor, {
    foreignKey: 'seller_id',
    as: 'seller',
});

// Distributor → CommissionLog
Distributor.hasMany(CommissionLog, {
    foreignKey: 'receiver_id',
    as: 'commission_logs',
});
CommissionLog.belongsTo(Distributor, {
    foreignKey: 'receiver_id',
    as: 'receiver',
});

// DistributorSale → CommissionLog 
DistributorSale.hasMany(CommissionLog, {
    foreignKey: 'sale_id',
    as: 'commission_logs',
});
CommissionLog.belongsTo(DistributorSale, {
    foreignKey: 'sale_id',
    as: 'sale',
});

export { 
    Role, 
    Permission, 
    User, 
    Product, 
    AuditLog,
    Variant,
    Order,
    OrderItem,
    Distributor,
    DistributorSale,
    DistributorStock,
    CommissionLog,
    StockTransfer
};