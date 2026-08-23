// import "reflect-metadata";
// import dotenv from "dotenv";
// import app from "./app";

// dotenv.config();

// const PORT = process.env.PORT || 5000;

// app.listen(PORT, () => {
//   console.log(`DokanSathi backend running on port ${PORT}`);
// });

import "reflect-metadata";
import dotenv from "dotenv";

import app from "./app";
import { AppDataSource } from "./config/data-source";

dotenv.config();

const PORT = process.env.PORT || 5000;

AppDataSource.initialize()
  .then(() => {
    console.log("Database connected successfully");

    app.listen(PORT, () => {
      console.log(`DokanSathi backend running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error("Database connection failed:", error);
  });