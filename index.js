import express from "express";
import fs from "fs/promises";
import cors from "cors";
import connection from "./database.js";
import { getArtists, getArtistsID, createArtist, updateArtist, deleteArtist } from "./controllers.js";

const app = express();
const port = 3333;

app.use(express.json());
app.use(cors());

app.listen(port, () => {
  console.log(`App listening on http://localhost:${port}`);
});

app.get("/", (request, response) => {
  response.send("Node.js artists REST API 🎉");
});

// READ all artists
app.get("/artists", getArtists);

// READ one user
app.get("/artists/:id", getArtistsID);

// CREATE user
app.post("/artists", createArtist);

// UPDATE user
app.put("/artists/:id", updateArtist);

// DELETE user
app.delete("/artists/:id", deleteArtist);
