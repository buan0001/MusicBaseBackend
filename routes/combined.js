import { Router } from "express";
import connection from "../database.js";
import { tryExecute as tryExecute } from "../helpers.js";

const combinedRouter = Router();

combinedRouter.get("/", async (request, response) => {
  const artistString = /*sql*/ `SELECT  * FROM artist;`;

  const trackString = /*sql*/ `SELECT  * FROM tracks;`;

  const albumString = /*sql*/ `SELECT  * FROM albums;`;

  const artists = await tryExecute(artistString);
  const tracks = await tryExecute(trackString);
  const albums = await tryExecute(albumString);
  response.json({ artists: artists, tracks: tracks, albums: albums });
});

combinedRouter.get("/search", async (request, response) => {
  const query = request.query.q;
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
  const artists = await tryExecute(artistString, values);
  const tracks = await tryExecute(trackString, values);
  const albums = await tryExecute(albumString, values);
  response.json({ artists: artists, tracks: tracks, albums: albums });
});

export default combinedRouter;
