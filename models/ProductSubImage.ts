import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "../config/db";
import { ProductSubImage } from "../types/model";

interface ProductSubImageCreationAttributes extends Optional<ProductSubImage, "id"> {}

class ProductSubImageModel extends Model<ProductSubImage, ProductSubImageCreationAttributes> implements ProductSubImage {
    public id!: number;
    public product_id!: number;
    public url!: string;
}

ProductSubImageModel.init(
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

    url: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            notEmpty: { msg: "image url is required." },
        }
    }

},
{
    sequelize,
    modelName: "ProductSubImage",
    tableName: "product_sub_images",
    timestamps: false
}
);

export default ProductSubImageModel;