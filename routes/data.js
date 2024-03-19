import { Router } from "express";
import { DataModel } from "../model/data.js";

const router = Router();

function capitalizeFirstCharacter(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

async function fetchAllFilters() {
  const filters = {
    start_year: [],
    end_year: [],
    impact: [],
    intensity: [],
    relevance: [],
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
        impact: { $addToSet: "$impact" },
        intensity: { $addToSet: "$intensity" },
        relevance: { $addToSet: "$relevance" },
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
        impact: 1,
        intensity: 1,
        relevance: 1,
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
      key === "impact" ||
      key === "intensity" ||
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
    if (req.query.country) {
      query.country = req.query.country;
    }
    if (req.query.relevance) {
      query.relevance = parseInt(req.query.relevance);
    }

    console.log(req.query);
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

// Routes for Charts

router.get("/stacked_bar_chart_data", async (req, res) => {
  try {
    const dataArray = await DataModel.find(
      { impact: { $ne: null }, country: { $ne: "" } },
      "country impact intensity"
    );

    const transformedData = [];

    // Group data by country
    const groupedData = dataArray.reduce((acc, entry) => {
      acc[entry.country] = acc[entry.country] || [];
      acc[entry.country].push(entry);
      return acc;
    }, {});

    const impactMap = {
      2: "Low",
      3: "Low",
      4: "High",
    };

    for (const country in groupedData) {
      const countryData = groupedData[country];
      const series = [];

      for (const impactLevel in impactMap) {
        const impactData = countryData.filter(
          (entry) => entry.impact === parseInt(impactLevel)
        );
        impactData.forEach((entry) => {
          const existingSeries = series.find(
            (item) =>
              item.name === impactMap[impactLevel] &&
              item.value === entry.intensity
          );
          if (!existingSeries) {
            series.push({
              name: impactMap[impactLevel],
              value: entry.intensity,
            });
          }
        });
      }

      const truncatedCountry = country.split(" ").slice(0, 2).join(" ");

      transformedData.push({ name: truncatedCountry, series });
    }

    res.json(transformedData);

    // console.log(transformedData);
  } catch (err) {
    console.log(err);
  }
});

router.get("/line_chart_data", async (req, res) => {
  try {
    const data = await DataModel.find(
      { pestle: { $ne: "" }, intensity: { $ne: null }, added: { $ne: "" } },
      "pestle added intensity"
    );

    // Group data by country
    const groupedData = data.reduce((acc, entry) => {
      acc[entry.pestle] = acc[entry.pestle] || [];
      acc[entry.pestle].push(entry);
      return acc;
    }, {});

    const transformedData = data.reduce((acc, curr) => {
      const existingIndex = acc.findIndex((item) => item.name === curr.pestle);
      if (existingIndex !== -1) {
        acc[existingIndex].series.push({
          value: curr.intensity,
          name: curr.added, //Change to curr.published
        });
      } else {
        acc.push({
          name: curr.pestle,
          series: [
            {
              value: curr.intensity,
              name: curr.added, //Change to curr.published
            },
          ],
        });
      }
      return acc;
    }, []);

    console.log(groupedData);
    res.json(transformedData);

    // console.log(transformedData);
  } catch (err) {
    console.log(err);
  }
});

router.get("/pie_chart_data", async (req, res) => {
  try {
    const data = await DataModel.find(
      { region: { $ne: "" }, likelihood: { $ne: null } },
      "region likelihood relevance"
    );

    const groupedData = data.reduce((acc, curr) => {
      if (!acc[curr.region]) {
        acc[curr.region] = {
          name: curr.region,
          value: 0, // Initialize the value
          extra: {}, // Optional: Include extra attributes if needed
        };
      }
      // Sum the likelihood
      acc[curr.region].value += curr.likelihood;
      return acc;
    }, {});

    // Convert the grouped data into an array
    const transformedData = Object.values(groupedData);

    transformedData.sort((a, b) => b.value - a.value);

    console.log(transformedData);

    res.json(transformedData);
  } catch (err) {
    console.log(err);
  }
});

router.get("/vertical_bar_chart_data", async (req, res) => {
  try {
    const responseData = await DataModel.find(
      { topic: { $ne: "" }, relevance: { $ne: null } },
      "topic relevance"
    );

    const aggregatedData = {};

    responseData.forEach((entry) => {
      const { topic, relevance } = entry;

      if (aggregatedData.hasOwnProperty(topic)) {
        aggregatedData[topic] += relevance;
      } else {
        aggregatedData[topic] = relevance;
      }
    });

    const barChartData = Object.keys(aggregatedData).map((topic) => ({
      name: capitalizeFirstCharacter(topic),
      value: aggregatedData[topic],
    }));

    // Sort the array of objects based on relevance scores, if needed
    barChartData.sort((a, b) => b.value - a.value);

    res.json(barChartData);
  } catch (err) {
    console.log(err);
  }
});

export { router as dataRouter };
