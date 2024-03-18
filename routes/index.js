import { Router } from "express";

const router = Router();

router.get("/", (req, res) => {
  res.send("Welcome to Blackcoffer Server!");
});

export { router as indexRouter };
