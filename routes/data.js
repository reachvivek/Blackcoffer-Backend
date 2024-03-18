import { Router } from "express";
import { DataModel } from "../model/data.js";

const router = Router();

/*
--> Filters to be added: 
Add end year filter in the dashboard ✅
Add topics filters in the dashboard ✅
Add sector filter in the dashboard ✅
Add region filter in the dashboard ✅
Add PEST filter in the dashboard ✅
Add Source filter in the dashboard ✅
Country ✅
Add SWOT filter in the dashboard 
City 
*/

router.get("/fetch_all_events", async (req, res) => {
  try {
    let query = {};

    // Add filters based on query parameters
    if (req.query.end_year) {
      query.end_year = parseInt(req.query.end_year);
    }
    if (req.query.intensity) {
      query.intensity = parseInt(req.query.intensity);
    }
    if (req.query.topic) {
      query.topic = req.query.topic;
    }
    if (req.query.sector) {
      query.sector = req.query.sector;
    }
    if (req.query.region) {
      query.region = req.query.region;
    }
    if (req.query.pestle) {
      query.pestle = req.query.pestle;
    }
    if (req.query.source) {
      query.source = req.query.source;
    }
    if (req.query.relevance) {
      query.relevance = parseInt(req.query.relevance);
    }

    const events = await DataModel.find(query);
    console.log(`Entries sent ${events.length}`);
    res.json(events);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.get("/fetch_all_filters", async (req, res) => {
  try {
    const filters = await fetchAllFilters();
    res.json(filters);
    console.log(`Filters sent!`);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

async function fetchAllFilters() {
  const filters = {
    end_year: [],
    topic: [],
    sector: [],
    region: [],
    pestle: [],
    source: [],
    country: [],
  };

  const distinctValues = await DataModel.aggregate([
    {
      $group: {
        _id: null,
        end_year: { $addToSet: "$end_year" },
        topic: { $addToSet: "$topic" },
        sector: { $addToSet: "$sector" },
        region: { $addToSet: "$region" },
        pestle: { $addToSet: "$pestle" },
        source: { $addToSet: "$source" },
        country: { $addToSet: "$country" },
      },
    },
    {
      $project: {
        _id: 0,
        end_year: 1,
        topic: 1,
        sector: 1,
        region: 1,
        pestle: 1,
        source: 1,
        country: 1,
      },
    },
  ]);

  Object.keys(filters).forEach((key) => {
    filters[key] = distinctValues[0][key]
      .flat()
      .filter((value) => value !== null)
      .sort((a, b) => {
        if (typeof a === "string" && typeof b === "string") {
          return a.localeCompare(b);
        }
        return a - b;
      });
  });
  return filters;
}

export { router as dataRouter };
