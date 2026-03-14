import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "../config/db";
import { ProductAttributes } from "../types/model";

interface ProductCreationAttributes extends Optional<ProductAttributes, "id"> {}

class Product extends Model<ProductAttributes, ProductCreationAttributes> implements ProductAttributes {
    public id!: number;
    public product_name!: string;
    public description!: string;
    public thumbnail!: string;
    public stock!: number;
}

Product.init(
{
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },

    product_name: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            notEmpty: { msg: "product name is required." },
            len: {
                args: [3, 100],
                msg: "product name must be between 3 and 50 characters."
            }
        }
    },

    description: {
        type: DataTypes.TEXT,
        allowNull: false,
        validate: {
            notEmpty: { msg: "description is required." },
            len: {
                args: [10, 100],
                msg: "description must be between 10 and 100 characters."
            }
        }
    },

    thumbnail: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            notEmpty: { msg: "thumbnail is required." },
        }
    },
    
    stock: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
            notEmpty: { msg: "stock is required." },
            isInt: { msg: "stock must be a number." },
            min: {
                args: [0],
                msg: "stock cannot be negative."
            }
        }
    }

},
{
    sequelize,
    modelName: "Product",
    tableName: "products",
    timestamps: false
}
);

export default Product;