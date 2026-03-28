import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "../../config/db";
import { PermissionAttributes } from "../../types/model-attributes";
import PERMISSIONS from "../../utils/permissions";

interface PermissionCreationAttributes extends Optional<PermissionAttributes, "id"> {}

class Permission extends Model<PermissionAttributes, PermissionCreationAttributes> {}

Permission.init(
{
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },

    action: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            notEmpty: { msg: "action is required." },
        },
    },

    role_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
            notEmpty: { msg: "role id is required." },
        },
    },
},
{
    sequelize,
    modelName: "Permission",
    tableName: "permissions",
    timestamps: false,
}
);

export default Permission;