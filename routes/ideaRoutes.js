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
    } catch (err) {
      next(err);
    }
  })
  .post(async (req, res, next) => {
    try {
      const { title, description, summary, tags } = req.body;

      if (!title?.trim() || !description?.trim() || !summary?.trim()) {
        res.status(400);
        throw new Error("Title, description and summary are required");
      }

      const newIdea = new Idea({
        title,
        description,
        summary,
        tags:
          typeof tags === "string"
            ? tags
                .split(",")
                .map((tag) => tag.trim())
                .filter(Boolean)
            : Array.isArray(tags)
            ? tags
            : [],
      });

      const savedIdea = await newIdea.save();

      res.status(201).json(savedIdea);
    } catch (err) {
      next(err);
    }
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
  } catch (err) {
    next(err);
  }
});

export default router;
