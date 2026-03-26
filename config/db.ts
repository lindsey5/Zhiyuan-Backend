import { Sequelize } from "sequelize";
import dotenv from "dotenv";

dotenv.config();

const sequelize = new Sequelize({
  dialect: "sqlite",
  storage: process.env.SQLITE_PATH,
  logging: false,
});

export default sequelize;