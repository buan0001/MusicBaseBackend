import { Router } from "express";
import connection from "../database.js";

const tracksRouter = Router();

// Get all tracks
tracksRouter.get("/", (request, response) => {
  const query =
    /*sql*/
    `
    SELECT DISTINCT tracks.*,
       artists.name as ArtistName,
       artists.id as ArtistId
    FROM tracks
    INNER JOIN artists_tracks ON tracks.id = artists_tracks.track_id
    INNER JOIN artists ON artists_tracks.artist_id = artists.id
    ORDER BY artists.id ASC;
    `;
  connection.query(query, (error, results, fields) => {
    if (error) {
      console.log(error);
    } else {
      response.json(results);
    }
  });
});

// Search after track title
tracksRouter.get("/search", (request, response) => {
  const query = request.query.q;
  const queryString = /*sql*/ `
    SELECT DISTINCT tracks.*,
    artists.name as artistName,
    artists.id as artistID,
    albums.title as albumTitle,
    albums.id as albumID
FROM tracks
INNER JOIN artists_tracks ON tracks.id = artists_tracks.track_id
INNER JOIN artists ON artists_tracks.artist_id = artists.id
INNER JOIN albums_tracks ON tracks.id = albums_tracks.track_id
INNER JOIN albums ON albums_tracks.albums_id = albums.id
WHERE tracks.title LIKE ?;
    `;
  const values = [`%${query}%`];
  connection.query(queryString, values, (error, results) => {
    if (error) {
      console.error(error);
      response.status(500).json({ message: "Error occured" });
    } else {
      response.json(results);
    }
  });
});

// Get a single track
tracksRouter.get("/:id", (req, res) => {
  const id = req.params.id;
  const queryString = /* sql */ `
        SELECT tracks.*,
            artists.name AS artistName,
            artists.id AS artistId,
            albums.title as albumTitle,
            albums.id as albumID
            FROM tracks
            INNER JOIN artists_tracks ON tracks.id = artists_tracks.trackID
            INNER JOIN artists ON artists_tracks.artistID = artists.id
            WHERE tracks.id = ?;
    `;
  connection.query(queryString, [id], (error, result) => {
    if (error) {
      console.error(error);
    } else {
      res.json(result);
    }
  });
});

export default tracksRouter;
