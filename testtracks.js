import { Router } from "express";
import { tryExecute } from "/helpers.js";

const tracksRouter = Router();

// Get a single track
tracksRouter.get("/:id", async (request, response) => {
  const id = request.params.id;
  const queryString =
    /* sql */
    `
        SELECT *
            FROM tracks
            WHERE tracks.id = ?;
    `;

  const values = [id];

  response.json(await tryExecute(queryString, values));
});

// Get all tracks
tracksRouter.get("/", async (request, response) => {
  const queryString =
    /*sql*/
    `
    SELECT DISTINCT *
FROM tracks

ORDER BY tracks.title;
    `;

  response.json(await tryExecute(queryString));
  // const query =
  //   /*sql*/
  //   `
  //   SELECT DISTINCT tracks.*,
  //      artists.name as artistName,
  //      artists.id as artistId
  //   FROM tracks
  //   INNER JOIN artists_tracks ON tracks.id = artists_tracks.track_id
  //   INNER JOIN artists ON artists_tracks.artist_id = artists.id
  //   ORDER BY artists.id ASC;
  //   `;
  // response.json(await tryExecute(query));
});
