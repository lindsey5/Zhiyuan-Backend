import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "../../config/db";
import { hashPassword } from "../../utils/auth";
import { UserAttributes } from "../../types/model-attributes";
import bcrypt from "bcrypt";

interface UserCreationAttributes extends Optional<UserAttributes, "id"> {}

class User extends Model<UserAttributes, UserCreationAttributes> {

    public async matchPassword(plainPassword: string): Promise<boolean> {
        return await bcrypt.compare(plainPassword, this.toJSON().password);
    }
}

User.init(
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },

        firstname: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                notEmpty: { msg: "firstname is required." },
        },
        },

        lastname: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                notEmpty: { msg: "lastname is required." },
            },
        },

        email: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
            validate: {
                notEmpty: { msg: "email is required." },
                isEmail: { msg: "invalid email address" }
            },
        },

        password: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                notEmpty: { msg: "password is required." },
            },
        },

        role_id: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                notEmpty: { msg: 'role id is required.'}
            }
        }
    },
    {
        sequelize,
        modelName: "User",
        tableName: "users",
        timestamps: false,

        hooks: {
            beforeCreate: async (account: User) => {
                console.log("account about to be created & saved:", account);

                if (account.toJSON().password) account.set({ password: await hashPassword(account.toJSON().password)});
            },
        },
    }
);

export default User;