import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "../../config/db";
import { CategoryAttributes } from "../../types/model-attributes";

interface CategoryCreationAttributes extends Optional<CategoryAttributes, "id"> {}

class Category extends Model<CategoryAttributes, CategoryCreationAttributes> {}

Category.init(
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
            validate: {
                notEmpty: { msg: "name is required." },
                len: {
                args: [3, 100],
                msg: "name must be between 3 and 100 characters."
            }
            },
        },
        createdAt: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW
        },
    },
    {
        sequelize,
        modelName: "Category",
        tableName: "categories",
        timestamps: false,
    }
);

export default Category;