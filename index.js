import express from "express";
import cors from "cors";
import artistsRouter from "./routes/artists.js";
import tracksRouter from "./routes/tracks.js";
import albumsRouter from "./routes/albums.js";
import { tryExcecute } from "./helpers.js";


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

app.get("/all/search", async (req, res) => {
  const query = req.query.q;
  console.log(query);

  // SELECT  artists.id, artists.name, artists.birthdate as time FROM artists
  const artistString = /*sql*/ `
       SELECT  * FROM artists
        where artists.name like ?`;

  const trackString = /*sql*/ `SELECT  * FROM tracks
        where tracks.title like ?`;

  const albumString = /*sql*/ ` SELECT  * FROM albums
        where albums.title like ?;`;

  const values = [`%${query}%`];
  const artists = await tryExcecute(artistString, values);
  const tracks = await tryExcecute(trackString, values);
  const albums = await tryExcecute(albumString, values);
  // const all = [... artists, ...tracks, ...albums]
  // console.log("ALL:",all);
  res.json([...artists, ...tracks, ...albums]);
});
