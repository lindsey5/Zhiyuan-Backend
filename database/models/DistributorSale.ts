import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "../../config/db";
import { DistributorSaleAttributes } from "../../types/model-attributes";

interface DistributorSaleCreationAttributes extends Optional<DistributorSaleAttributes, "id"> {}

class DistributorSale extends Model<DistributorSaleAttributes, DistributorSaleCreationAttributes> {}

DistributorSale.init(
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        seller_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        quantity: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        total_amount: {
            type: DataTypes.DECIMAL(12, 2),
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
        modelName: "AgentSale",
        tableName: "agent_sales",
        timestamps: false,
    }
);

export default DistributorSale;