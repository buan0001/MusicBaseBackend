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
  res.json({ artists: artists, tracks: tracks, albums: albums });
});

combinedRouter.get("/search", async (req, res) => {
  const query = req.query.q;
  console.log(query);

  // SELECT  artists.id, artists.name, artists.birthdate as time FROM artists
  const artistString = /*sql*/ `
       SELECT * 
    FROM artists
    WHERE name LIKE ?
    ORDER BY name`;

  const trackString = /*sql*/ `
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
WHERE tracks.title LIKE ?;`

  const albumString = /*sql*/ `
  SELECT DISTINCT albums.*,
      artists.name as artistName,
      artists.id as artistId
    FROM albums
    JOIN artists_albums ON albums.id = artists_albums.album_id
    JOIN artists ON artists_albums.artist_id = artists.id
    WHERE title LIKE ?
    ORDER BY title`;

  const values = [`%${query}%`];
  const artists = await tryExcecute(artistString, values);
  const tracks = await tryExcecute(trackString, values);
  const albums = await tryExcecute(albumString, values);
  res.json({ artists: artists, tracks: tracks, albums: albums });
});

export default combinedRouter;
