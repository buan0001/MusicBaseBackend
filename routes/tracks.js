import { Router } from "express";
import connection from "../database.js";

const tracksRouter = Router();

tracksRouter.get("/", (request, response) => {
  const query =
    /*sql*/
    `
    -- SELECT tracks*, genres.genreName, labels.labelName
    -- FROM tracks
    -- JOIN genres ON tracks.genreId = genres.id
    -- JOIN labels ON tracks.labelId = labels.id;
    SELECT * FROM tracks;
    `;
  connection.query(query, (error, results, fields) => {
    if (error) {
      console.log(error);
    } else {
      response.json(results);
    }
  });
});

export default tracksRouter;