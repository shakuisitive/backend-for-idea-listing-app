import express from "express";
const router = express.Router();

router
  .route("/")
  .get((req, res) => {
    const ideas = [
      { id: 1, title: "idea 1", description: "this is idea 1" },
      { id: 1, title: "idea 2", description: "this is idea 2" },
      { id: 1, title: "idea 3", description: "this is idea 3" },
    ];

    res.status(201).json(ideas);
  })
  .post((req, res) => {
    const { title, description } = req.body;

    res.send({ title, description });
  });

export default router;
