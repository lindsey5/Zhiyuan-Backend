import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "../../config/db";
import { StockTransferAttributes } from "../../types/model-attributes";

interface StockTransferCreationAttributes extends Optional<StockTransferAttributes, "id"> {}

class StockTransfer extends Model<StockTransferAttributes, StockTransferCreationAttributes> {}

StockTransfer.init(
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        transfer_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        user_id: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        sender_id: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        receiver_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        quantity: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        variant_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        price: {
            type: DataTypes.FLOAT,
            allowNull: false,
        },
        createdAt: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW,
        },
    },
    {
        sequelize,
        modelName: "StockTransfer",
        tableName: "stock_transfers",
        timestamps: false,
    }
);

export default StockTransfer;