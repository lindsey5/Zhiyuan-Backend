import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "../config/db";
import {VariantAttributes } from "../types/model";

interface VariantCreationAttributes extends Optional<Variant, "id"> {}

class Variant extends Model<VariantAttributes, VariantCreationAttributes> implements VariantAttributes {
    public id!: number;
    public product_id!: number;
    public variant_name!: string;
    public variant_image!: string;
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
            notEmpty: { msg: "product_id is required." },
        }
    },

    variant_name: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            notEmpty: { msg: "variant name is required." },
        }
    },

    variant_image: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            notEmpty: { msg: "variant image is required." },
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