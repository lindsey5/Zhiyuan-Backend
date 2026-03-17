import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "../config/db";
import { VariantAttributes } from "../types/model-attributes";

interface VariantCreationAttributes extends Optional<VariantAttributes, "id"> {}

class Variant extends Model<VariantAttributes, VariantCreationAttributes> implements VariantAttributes {
    public id!: number;
    public product_id!: number;
    public variant_name!: string;
    public variant_image!: string;
    public stock!: number;
    public price!: number;
    public image_public_id!: string;
    public image_url!: string;
    public sku!: string;
}

Variant.init(
{
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },

    product_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
            notNull: { msg: "Product ID is required." },
            isInt: { msg: "Product ID must be an integer." }
        }
    },

    variant_name: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            notNull: { msg: "Variant name is required." },
            notEmpty: { msg: "Variant name cannot be empty." },
            len: {
                args: [2, 100],
                msg: "Variant name must be between 2 and 100 characters."
            }
        }
    },

    image_url: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            notNull: { msg: "Variant image url is required." },
            notEmpty: { msg: "Variant image url cannot be empty." },
            isUrl: { msg: "Variant image url must be a valid URL." }
        }
    },

    image_public_id: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            notNull: { msg: "Variant image public id is required." },
            notEmpty: { msg: "Variant image public id cannot be empty." },
        }
    },
    
    stock: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
            notNull: { msg: "Stock is required." },
            isInt: { msg: "Stock must be a number." },
            min: {
                args: [0],
                msg: "Stock cannot be negative."
            }
        }
    },
    price: {
        type: DataTypes.FLOAT,
        allowNull: false,
        validate: {
            notNull: { msg: "Price is required." },
            min: {
                args: [0],
                msg: "Price cannot be negative."
            }
        }
    },

    sku: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
            notNull: { msg: "SKU is required." },
            notEmpty: { msg: "SKU cannot be empty." },
            len: {
                args: [3, 100],
                msg: "SKU must be between 3 and 100 characters."
            }
        }
    },

},
{
    sequelize,
    modelName: "Variant",
    tableName: "variants",
    timestamps: false
}
);

export default Variant;