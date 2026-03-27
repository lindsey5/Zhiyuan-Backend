import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "../../config/db";
import { ProductAttributes } from "../../types/model-attributes";

interface ProductCreationAttributes extends Optional<ProductAttributes, "id"> {}

class Product extends Model<ProductAttributes, ProductCreationAttributes> {}

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

    thumbnail_public_id: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            notNull: { msg: "Thumbnail Public Id is required." },
            notEmpty: { msg: "Thumbnail Public Id cannot be empty." },
        }
    },

    thumbnail_url: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            notNull: { msg: "Thumbnail URL is required." },
            notEmpty: { msg: "Thumbnail URL cannot be empty." },
            isUrl: { msg: "Thumbnail URL must be a valid URL." }
        }
    },

    category: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            notNull: { msg: "Category is required." },
            notEmpty: { msg: "Category cannot be empty." },
        }
    },

    createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
    },
    status: {
        type: DataTypes.ENUM('active', 'deleted'),
        allowNull: false,
        defaultValue: 'active'
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