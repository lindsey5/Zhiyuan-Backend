import Permission from "./Permission";
import Role from "./Role";
import User from "./User";

Role.hasMany(User, { foreignKey: 'role_id' })
User.belongsTo(Role, { foreignKey: 'role_id'})

Role.hasMany(Permission, { foreignKey: 'role_id' })
Permission.belongsTo(Role, { foreignKey: 'role_id' })

export { Role, Permission, User }