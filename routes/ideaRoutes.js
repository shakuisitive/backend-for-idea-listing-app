import express from "express";
import mongoose from "mongoose";
import Idea from "../models/Idea.js";
const router = express.Router();

router
  .route("/")
  .get(async (req, res, next) => {
    try {
      const ideas = await Idea.find();
      res.status(200).json(ideas);
    } catch (error) {
      next(error);
    }
  })
  .post((req, res) => {
    const { title, description } = req.body;
    res.send({ title, description });
  });

router.route("/:id").get(async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(404);
      throw new Error("Invalid Id");
    }

    const idea = await Idea.findById(id);
    if (!idea) {
      res.status(404);
      throw new Error("Idea Not Found");
    }
    res.json(idea);
  } catch (error) {
    next(error);
  }
});

export default router;
