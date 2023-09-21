import { Router, response } from "express";
import connection from "../database.js";
import { tryExcecute } from "../helpers.js";

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
//   const [results] = await connection.execute(query);
  response.json(await tryExcecute(query));
});

// Search after track title
tracksRouter.get("/search", async (request, response) => {
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
  
  response.json(await tryExcecute(queryString,values));
});

// Get a single track
tracksRouter.get("/:id", async (request, response) => {
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
  
  response.json(await tryExcecute(queryString, values));
});

tracksRouter.post("/", async (request, response) => {
  const track = request.body;

  // create new song
  const trackQuery = /*sql*/ `
    INSERT INTO tracks (title, durationSeconds) VALUES(?, ?)`;
  const trackValues = [track.title, track.durationSeconds];

  const [trackResult] = await connection.execute(trackQuery, trackValues);
  // id of newly created song
  const newTrackId = trackResult.insertId;

  // create new arist-song relation in artists_songs
  const artistTrackQuery = /*sql*/ `
    INSERT INTO artists_tracks (artist_id, track_id) VALUES(?, ?)`;
  const artistTrackValues = [track.artistId, newTrackId];

  // Måske også post ind i album_tracks junctiontable

  response.json(await tryExcecute(artistTrackQuery, artistTrackValues));
//   response.json({ message: "New track created!" });
});

tracksRouter.put("/:id", async (request, response) => {
  const id = request.params.id;
  const track = request.body;
  const query = "UPDATE tracks SET title = ?, durationSeconds = ? WHERE id = ?";
  const values = [track.name, track.birthdate, id];
  response.json(await tryExcecute(query,values))
});

export default tracksRouter;
