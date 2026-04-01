import { Sequelize } from "sequelize";
import dotenv from "dotenv";

dotenv.config();

const sequelize = new Sequelize({
  dialect: "sqlite",
  storage: process.env.SQLITE_PATH,
  logging: false,
});

(async () => {
    await sequelize.authenticate();
    // Enable foreign key enforcement
    await sequelize.query("PRAGMA foreign_keys = ON;");
    console.log("Foreign key enforcement enabled!");
})();

export default sequelize;