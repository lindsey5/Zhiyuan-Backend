import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "../../config/db";
import { CommissionLogAttributes } from "../../types/model-attributes";

interface CommissionLogCreationAttributes extends Optional<CommissionLogAttributes, "id"> {}

class CommissionLog extends Model<CommissionLogAttributes, CommissionLogCreationAttributes> {}

CommissionLog.init(
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        sale_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        receiver_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        commission_rate: {
            type: DataTypes.DECIMAL(5, 2),
            allowNull: false,
        },
        commission_amount: {
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
        modelName: "CommissionLog",
        tableName: "commission_logs",
        timestamps: false,
    }
);

export default CommissionLog;