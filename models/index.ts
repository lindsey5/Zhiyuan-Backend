import Permission from "./Permission";
import Role from "./Role";
import User from "./User";

Role.hasMany(User, { foreignKey: 'role_id', as: 'users' });
User.belongsTo(Role, { foreignKey: 'role_id', as: 'role' });

Role.hasMany(Permission, { foreignKey: 'role_id', as: 'permissions' });
Permission.belongsTo(Role, { foreignKey: 'role_id', as: 'role' });

export { Role, Permission, User };