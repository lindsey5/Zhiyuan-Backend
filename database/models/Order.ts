import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "../../config/db";
import { OrderAttributes } from "../../types/model-attributes";

interface OrderCreationAttributes extends Optional<OrderAttributes, "id"> {}

class Order extends Model<OrderAttributes, OrderCreationAttributes> {}

Order.init(
{
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    order_id: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
    },
    customer_name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    status: {
        type: DataTypes.ENUM('pending', 'processing', 'completed', 'cancelled'),
        allowNull: false,
        defaultValue: 'pending',
    },
    total_amount: {
        type: DataTypes.FLOAT,
        allowNull: false,
    },
    order_date: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
    },
    delivery_type: {
        type: DataTypes.ENUM('pickup', 'delivery'),
        allowNull: false,
    },
    payment_method: {
        type: DataTypes.ENUM('COD', 'GCash', 'Card'),
        allowNull: false,
    },
    payment_status: {
        type: DataTypes.ENUM('paid', 'unpaid'),
        allowNull: false,        
        defaultValue: 'unpaid',
    },
},
{
    sequelize,
    modelName: "Order",
    tableName: "orders",
    timestamps: false,
}
);

export default Order;