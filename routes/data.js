import { Router } from "express";
import { DataModel } from "../model/data.js";

const router = Router();

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
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

async function fetchAllFilters() {
  const filters = {
    start_year: [],
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
        start_year: { $addToSet: "$start_year" },
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
        start_year: 1,
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
    let distinctValuesForKey = distinctValues[0][key]
      .flat()
      .filter((value) => value !== null && value !== "");

    if (
      key === "start_year" ||
      key === "end_year" ||
      key === "topic" ||
      key === "sector" ||
      key === "source" ||
      key === "pestle" ||
      key === "region" ||
      key === "country"
    ) {
      filters[key] = distinctValuesForKey
        .map((value) => {
          if (typeof value === "string") {
            return { name: value && value[0].toUpperCase() + value.slice(1) };
          }
          return { name: value };
        })
        .sort((a, b) => {
          if (typeof a.name === "string" && typeof b.name === "string") {
            return a.name.localeCompare(b.name);
          }
          return a.name - b.name;
        });
    } else {
      filters[key] = distinctValuesForKey.sort((a, b) => {
        if (typeof a === "string" && typeof b === "string") {
          return a.localeCompare(b);
        }
        return a - b;
      });
    }
  });
  return filters;
}

export { router as dataRouter };
