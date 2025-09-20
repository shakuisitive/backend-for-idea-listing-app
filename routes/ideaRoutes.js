import express from "express";
import mongoose from "mongoose";
import { protect } from "../middleware/authMiddleware.js";
import Idea from "../models/Idea.js";
const router = express.Router();

router
  .route("/")
  .get(async (req, res, next) => {
    try {
      const limit = parseInt(req.query._limit);
      const query = Idea.find().sort({ createdAt: -1 });

      if (!isNaN(limit)) query.limit(limit);

      const ideas = await query.exec();
      res.status(200).json(ideas);
    } catch (err) {
      next(err);
    }
  })
  .post(protect, async (req, res, next) => {
    try {
      const { title, description, summary, tags } = req.body || {};

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

router
  .route("/:id")
  .get(async (req, res, next) => {
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
  })
  .delete(protect, async (req, res, next) => {
    try {
      const { id } = req.params;

      if (!mongoose.Types.ObjectId.isValid(id)) {
        res.status(400);
        throw new Error("Invalid Id");
      }

      const deletedIdea = await Idea.findByIdAndDelete(id);

      res.status(204);
      res.json({
        message: "Idea deleted successfully.",
        deletedIdea,
      });
    } catch (err) {
      next(err);
    }
  })
  .patch(protect, async (req, res, next) => {
    try {
      const { id } = req.params;

      if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new Error("Invalid Id");
      }

      const editableFields = ["title", "description", "summary", "tags"];
      const alteredReqBody = structuredClone(req.body || {});
      const keys = Object.keys(alteredReqBody);

      keys.forEach(
        (key) => !editableFields.includes(key) && delete alteredReqBody[key]
      );

      if (keys.includes("tags")) {
        alteredReqBody.tags = Array.isArray(alteredReqBody.tags)
          ? alteredReqBody.tags
          : alteredReqBody.tags
              .split(",")
              .map((item) => item.trim())
              .filter(Boolean);
      }

      const updatedIdea = await Idea.findByIdAndUpdate(id, alteredReqBody, {
        new: true,
        runValidators: true,
      });

      res.status(200).json(updatedIdea);
    } catch (err) {
      next(err);
    }
  });

export default router;
