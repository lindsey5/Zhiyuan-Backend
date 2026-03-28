import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "../../config/db";
import { RoleAttributes } from "../../types/model-attributes";

interface RoleCreationAttributes extends Optional<RoleAttributes, "id"> {}

class Role extends Model<RoleAttributes, RoleCreationAttributes> {}

Role.init(
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
            validate: {
                notEmpty: { msg: "name is required." },
                len: {
                    args: [3, 100],
                    msg: "name must be between 3 and 50 characters."
                }
            },
        },
        description: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                notEmpty: { msg: "description is required." },
                len: {
                args: [3, 100],
                msg: "description must be between 10 and 100 characters."
            }
            },
        },
        createdAt: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW
        },
    },
    {
        sequelize,
        modelName: "Role",
        tableName: "roles",
        timestamps: false,
    }
);

export default Role;