import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "../config/db";
import { VariantAttributes } from "../types/model";

interface VariantCreationAttributes extends Optional<VariantAttributes, "id"> {}

class Variant extends Model<VariantAttributes, VariantCreationAttributes> implements VariantAttributes {
    public id!: number;
    public product_id!: number;
    public variant_name!: string;
    public variant_image!: string;
    public stock!: number;
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

    variant_image: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            notNull: { msg: "Variant image is required." },
            notEmpty: { msg: "Variant image cannot be empty." },
            isUrl: { msg: "Variant image must be a valid URL." }
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
    }

},
{
    sequelize,
    modelName: "Variant",
    tableName: "variants",
    timestamps: false
}
);

export default Variant;