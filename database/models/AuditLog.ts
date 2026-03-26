import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "../../config/db";
import { AuditLogAttributes } from "../../types/model-attributes";

interface AuditLogCreationAttributes
  extends Optional<
    AuditLogAttributes,"id" | "old_values" | "new_values" | "createdAt"
  > {}

class AuditLog extends Model<AuditLogAttributes, AuditLogCreationAttributes> {}

AuditLog.init(
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },

        user_id: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },

        role: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                notEmpty: { msg: "role is required." },
            },
        },

        action: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                notEmpty: { msg: "action is required." },
            },
        },

        description: {
            type: DataTypes.TEXT,
            allowNull: false,
        },

        severity: {
            type: DataTypes.ENUM("LOW", "MEDIUM", "HIGH", "CRITICAL"),
            allowNull: false,
            defaultValue: "LOW",
        },

        ip_address: {
            type: DataTypes.STRING,
            allowNull: false,
        },

        user_agent: {
            type: DataTypes.STRING,
            allowNull: false,
        },

        old_values: {
            type: DataTypes.JSON,
            allowNull: true,
        },

        new_values: {
            type: DataTypes.JSON,
            allowNull: true,
        },

        createdAt: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW,
        },
    },
    {
        sequelize,
        modelName: "AuditLog",
        tableName: "audit_logs",
        timestamps: false,
    }
);

export default AuditLog;