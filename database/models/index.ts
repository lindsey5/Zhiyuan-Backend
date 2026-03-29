import AuditLog from "./AuditLog";
import Order from "./Order";
import OrderItem from "./OrderItem";
import Permission from "./Permission";
import Product from "./Product";
import Role from "./Role";
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

export { 
    Role, 
    Permission, 
    User, 
    Product, 
    AuditLog,
    Variant,
    Order,
    OrderItem
};