
import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "../../config/db";
import { DistributorAttributes } from "../../types/model-attributes";
import { hashPassword } from "../../utils/auth";
import bcrypt from 'bcrypt';

interface DistributorCreationAttributes extends Optional<DistributorAttributes, "id"> {}

class Distributor extends Model<DistributorAttributes, DistributorCreationAttributes> {

    public async matchPassword(plainPassword: string): Promise<boolean> {
        return await bcrypt.compare(plainPassword, this.toJSON().password);
    }
}

Distributor.init(
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        parent_distributor_id: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        creator: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        distributor_name: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                notEmpty: { msg: "agent name is required." },
                len: {
                    args: [1, 100],
                    msg: "agent name must be between 1 and 100 characters."
                }
            },
        },
        commission_rate: {
            type: DataTypes.FLOAT,
            defaultValue: 5,
            allowNull: false,
        },
        wallet_balance: {
            type: DataTypes.FLOAT,
            allowNull: false,
            defaultValue: 0,
        },
        email: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
            validate: {
                notEmpty: { msg: "email is required." },
                isEmail: { msg: "invalid email address" },
                len: {
                    args: [5, 100],
                    msg: "email must be between 5 and 100 characters."
                }
            },
        },
        password: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
            notEmpty: { msg: 'password is required'},
                len: {
                    args: [5, 100],
                    msg: "password must be between 6 to 50 characters."
                }
            }
        },
        status: {
            type: DataTypes.ENUM('active', 'deleted'),
            allowNull: false,
            defaultValue: 'active'
        },
        createdAt: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW
        },
    },
    {
        sequelize,
        modelName: "Distributor",
        tableName: "distributors",
        timestamps: false,
        hooks: {
            beforeCreate: async (account: Distributor) => {
                console.log("account about to be created & saved:", account);

                if (account.toJSON().password) account.set({ password: await hashPassword(account.toJSON().password)});
            },
        },
    }
);

export default Distributor;