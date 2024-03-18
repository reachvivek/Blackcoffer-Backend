import "dotenv/config";
import express from "express";
import { dirname } from "path";
import fs from "fs";
import mongoose from "mongoose";
import { fileURLToPath } from "url";
import { connectDB } from "./config/dbConn.js";
import { dataRouter } from "./routes/data.js";
import { indexRouter } from "./routes/index.js";
import cors from "cors";

const app = express();

app.use(cors());

const indexRoutes = indexRouter;
const dataRoutes = dataRouter;

app.use("/", indexRoutes);
app.use("/data", dataRoutes);

const port = process.env.PORT || 3000;

connectDB();

mongoose.connection.on("connected", () => {
  console.log("Connected to MongoDB Successfully!");
  app.listen(port, () => {
    console.log(`Server started running on ${port}`);
  });
});
