import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "../../config/db";
import { DistributorStockAttributes } from "../../types/model-attributes";

interface DistributorStockCreationAttributes extends Optional<DistributorStockAttributes, "id"> {}

class DistributorStock extends Model<DistributorStockAttributes, DistributorStockCreationAttributes> {}

DistributorStock.init(
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        distributor_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        variant_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        quantity: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0,
        },
    },
    {
        sequelize,
        modelName: "DistributorStock",
        tableName: "distributor_stocks",
        timestamps: false,
    }
);

export default DistributorStock;