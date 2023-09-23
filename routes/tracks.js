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
       artists.name as artistName,
       artists.id as artistId
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
WHERE tracks.title LIKE ?
ORDER BY tracks.title;
    `;

  const values = [`%${query}%`];

  response.json({ tracks: await tryExcecute(queryString, values) });
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
  try {
    const track = request.body;

    // Create new track
    const trackQuery = /*sql*/ `
      INSERT INTO tracks (title, durationSeconds) VALUES (?, ?)`;
    const trackValues = [track.title, track.durationSeconds];

    const [trackResult] = await connection.execute(trackQuery, trackValues);
    const newTrackId = trackResult.insertId;

    // Create artist-track relations
    const artistTrackQuery = /*sql*/ `
      INSERT INTO artists_tracks (artist_id, track_id) VALUES (?, ?)`;

    // Assuming track.artistIds is an array of artist IDs
    for (const artistId of track.artistIds) {
      const artistTrackValues = [artistId, newTrackId];
      await connection.execute(artistTrackQuery, artistTrackValues);
    }

    // Create album-track relations
    const albumTrackQuery = /* sql */ `
      INSERT INTO albums_tracks (albums_id, track_id) VALUES (?, ?)`;

    // Assuming track.albumIds is an array of album IDs
    for (const albumId of track.albumIds) {
      const albumTrackValues = [albumId, newTrackId];
      await connection.execute(albumTrackQuery, albumTrackValues);
    }

    // Response after all operations are completed
    response.json({ message: "New track created!" });
  } catch (error) {
    console.error("Error:", error);
    response.status(500).json({ error: "Internal Server Error" });
  }
});

// Updates a track
tracksRouter.put("/:id", async (request, response) => {
  console.log("tracks put");
  const id = request.params.id;
  const track = request.body;
  const query = "UPDATE tracks SET title = ?, durationSeconds = ? WHERE id = ?";
  const values = [track.title, track.durationSeconds, id];
  response.json(await tryExcecute(query, values));
});

export default tracksRouter;
