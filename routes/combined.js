import { Router } from "express";
import connection from "../database.js";
import { tryExcecute } from "../helpers.js";

const combinedRouter = Router();

combinedRouter.get("/", async (req, res) => {
  const artistString = /*sql*/ `SELECT  * FROM artist;`;

  const trackString = /*sql*/ `SELECT  * FROM tracks;`;

  const albumString = /*sql*/ ` SELECT  * FROM albums;`;

  const artists = await tryExcecute(artistString);
  const tracks = await tryExcecute(trackString);
  const albums = await tryExcecute(albumString);
  res.json({"artists":artists, "tracks":tracks, "albums":albums});
});


combinedRouter.get("/search", async (req, res) => {
  const query = req.query.q;
  console.log(query);

  // SELECT  artists.id, artists.name, artists.birthdate as time FROM artists
  const artistString = /*sql*/ `
         SELECT  * FROM artists
          where artists.name like ?
          ORDER by name`;

  const trackString = /*sql*/ `SELECT  * FROM tracks
          where tracks.title like ?
          ORDER by title`;

  const albumString = /*sql*/ ` SELECT  * FROM albums
          where albums.title like ?
          ORDER by title;`;

  const values = [`%${query}%`];
  const artists = await tryExcecute(artistString, values);
  const tracks = await tryExcecute(trackString, values);
  const albums = await tryExcecute(albumString, values);
  res.json({"artists":artists, "tracks":tracks, "albums":albums});
});

export default combinedRouter;
