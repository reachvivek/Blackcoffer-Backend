// Seeder Script to dump JSON to MongoDB
import dotenv from "dotenv";
dotenv.config({ path: "../.env" });
import mongoose from "mongoose";
import { DataModel } from "../model/data.js"; // Assuming you've defined your model/schema in a separate file
import { connectDB } from "../config/dbConn.js";
import fs from "fs";
import { dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

// Connect to MongoDB database
connectDB();

// Event listener for successful database connection
let jsonData;
mongoose.connection.on("connected", async () => {
  console.log("Connected to MongoDB");

  fs.readFile(`${__dirname}/../data/jsondata.json`, async (err, data) => {
    if (err) {
      console.log(err);
    } else {
      console.log("Reading JSON File...");
      jsonData = JSON.parse(data);
      console.log("Copying JSON File to MongoDB...");

      let count = 0;
      for (const entry of jsonData) {
        try {
          // Create a new Mongoose model instance for each entry
          const newData = new DataModel({
            end_year: entry.end_year,
            intensity: entry.intensity,
            sector: entry.sector,
            topic: entry.topic,
            insight: entry.insight,
            url: entry.url,
            region: entry.region,
            start_year: entry.start_year,
            impact: entry.impact,
            added: entry.added,
            published: entry.published,
            country: entry.country,
            relevance: entry.relevance,
            pestle: entry.pestle,
            source: entry.source,
            title: entry.title,
            likelihood: entry.likelihood,
          });

          // Save the new model instance to the database
          await newData.save();
          count += 1;
          console.log(
            `Copied ${count} of ${jsonData.length} entries. ${
              jsonData.length - count
            } remaining... `
          );
        } catch (error) {
          console.error("Error inserting data:", error);
        }
      }

      console.log(
        `Copied ${count} entries successfully! ${
          jsonData.length - count
        } failed.`
      );

      if (jsonData.length - count === 0) {
        console.log("Seeder script ran successfully!");
      }
      mongoose.connection.close();
    }
  });
});
