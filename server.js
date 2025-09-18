import express from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/api/ideas", (req, res) => {
  const ideas = [
    { id: 1, title: "idea 1", description: "this is idea 1" },
    { id: 1, title: "idea 2", description: "this is idea 2" },
    { id: 1, title: "idea 3", description: "this is idea 3" },
  ];

  res.status(201).json(ideas);
});

app.post("/api/ideas", (req, res) => {
  const { title, description } = req.body;

  res.send({ title, description });
});

app.listen(PORT, () => console.log(`Listening to port ${PORT}`));
