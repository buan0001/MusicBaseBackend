import { Router } from "express";
import connection from "../database.js";

const tracksRouter = Router();

// Get all tracks
tracksRouter.get("/", async (request, response) => {
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
    const [results] = await connection.execute(query)
    response.json(results);
});

// Search after track title
tracksRouter.get("/search", async(request, response) => {
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
  const [results] = await connection.execute(queryString, values);
  response.json(results);
});

// Get a single track
tracksRouter.get("/:id", async(request, response) => {
  const id = request.params.id;
  const queryString = /* sql */ `
        SELECT tracks.*,
            artists.name AS artistName,
            artists.id AS artistId,
            albums.title as albumTitle,
            albums.id as albumID
            FROM tracks
            INNER JOIN artists_tracks ON tracks.id = artists_tracks.track_id
            INNER JOIN artists ON artists_tracks.artist_id = artists.id
            INNER JOIN albums_tracks ON tracks.id = albums_tracks.track_id
            INNER JOIN albums ON albums_tracks.albums_id = albums.id
            WHERE tracks.id = ?;
    `;
  const values = [id];
  const [results] = await connection.execute(queryString, values);
  response.json(results);
});

export default tracksRouter;
