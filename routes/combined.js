import { Router } from "express";
import connection from "../database.js";
import { tryExcecute } from "../helpers.js";

const combinedRouter = Router();

app.get("/search", async (req, res) => {
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
    res.json([artists, tracks, albums]);
  });
  
  export default combinedRouter