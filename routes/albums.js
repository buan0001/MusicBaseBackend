import { Router } from "express";
import connection from "../database.js";

const albumsRouter = Router();

// READ all albums
albumsRouter.get("/", (request, response) => {
  const query = /*sql*/ `
    -- SELECT artists.artist_id, artists.artist_name, genres.genre_name FROM artists 
   -- JOIN artist_genre ON artists.artist_id = artist_genre.artist_id
   -- JOIN genres ON artist_genre.genre_id = genres.genre_id;
   SELECT * FROM albums;
    `;
  connection.query(query, (error, results, fields) => {
    if (error) {
      console.log(error);
    } else {
      response.json(results);
    }
  });
});

export default albumsRouter;