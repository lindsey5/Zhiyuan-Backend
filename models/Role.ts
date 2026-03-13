import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "../config/db";

interface RoleAttributes {
    id: number;
    name: string; 
    description: string;
}

interface RoleCreationAttributes extends Optional<RoleAttributes, "id"> {}

class Role extends Model<RoleAttributes, RoleCreationAttributes> implements RoleAttributes {
    public id!: number;
    public name!: string;
    public description!: string;
}

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
            },
        },
        description: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                notEmpty: { msg: "description is required." },
            },
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