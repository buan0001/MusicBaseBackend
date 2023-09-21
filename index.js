import express from "express";
import cors from "cors";
import artistsRouter from "./routes/artists.js";
import tracksRouter from "./routes/tracks.js";
import albumsRouter from "./routes/albums.js";

const app = express();
const port = 3333;

app.use(express.json());
app.use(cors());

app.use("/artists", artistsRouter);
app.use("/tracks", tracksRouter);
app.use("/albums", albumsRouter);

app.listen(port, () => {
  console.log(`App listening on port ${port}, http://localhost:${port}`);
});

app.get("/", (request, response) => {
  response.send("MusicBase rest api 🎉");
});

app.use("/all", async (req, res) => {
  artistsRouter.get("/search", (request, response) => {
    const query = request.query.q;
    console.log(query);

    const queryString = `
       SELECT  artists.id, artists.name, artists.birthdate as time FROM artists
        where artists.name like '%n%'
        UNION
        SELECT  * FROM tracks
        where tracks.title like '%n%'
    UNION
        SELECT  * FROM albums
        where albums.title like '%n%';`;
    const values = [`%${query}%`];
  });
});
