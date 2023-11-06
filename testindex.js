import express from "express";
import cors from "cors";
import tracksRouter from "./routes/tracks.js";

const app = express();
const port = process.env.PORT || 3333;

app.use(express.json());
app.use(cors());

app.use("/tracks", tracksRouter);

app.listen(port, () => {
  console.log(`App listening on port ${port}, http://localhost:${port}`);
});

app.get("/", (request, response) => {
  response.send("MusicBase rest api 🎉");
});
