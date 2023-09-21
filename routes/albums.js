import { Router } from "express";
import connection from "../database.js";

const albumsRouter = Router();

// READ all albums
albumsRouter.get("/", async (request, response) => {
  console.log("all albums get");
  const query = /*sql*/ `
     -- se albums med artist navn UDEN tracks
    SELECT DISTINCT albums.*,
      artists.name as ArtistName,
      artists.id as artistId
    FROM albums
    JOIN artists_albums ON albums.id = artists_albums.album_id
    JOIN artists ON artists_albums.artist_id = artists.id;
    
    `;

  const [results] = await connection.execute(query);
  response.json(results);
});

// GET Endpoint "/albums/search?q=something" - get all albums
albumsRouter.get("/search", async (request, response) => {
  console.log("search albums get");
  const query = request.query.q;
  const queryString = /*sql*/ `
    SELECT *
    FROM albums
    WHERE title LIKE ?
    ORDER BY title`;
  const values = [`%${query}%`];
  console.log(queryString);
  const [results] = await connection.execute(queryString, values);
  response.json(results);
});

albumsRouter.get("/:id", async (request, response) => {
  console.log("one albums get");
  const id = request.params.id;

  const query = /*sql*/ `
        SELECT DISTINCT albums.*,
            tracks.title as trackTitle,
            tracks.id as trackId,
            tracks.durationSeconds trackLengthSEC,
            artists.name as artistName,
            artists.id as artistId
        FROM albums
        JOIN albums_tracks ON albums.id = albums_tracks.albums_id
        JOIN tracks ON albums_tracks.track_id = tracks.id
        JOIN artists_albums ON albums.id = artists_albums.album_id
        JOIN artists ON artists_albums.artist_id = artists.id
        WHERE albums.id = ?
        ORDER BY albums.id;
    `;
  const values = [id];

  const [results] = await connection.execute(query, values);

  if (results[0]) {
    const album = results[0];
    console.log(results);
    const albumWithSongs = {
      id: album.id,
      title: album.title,
      releaseYear: album.releaseYear,
      artist: album.artistName,
      artistID: album.artistId,
      tracks: results.map((track) => {
        return {
          id: track.trackId,
          title: track.trackTitle,
          length: track.trackLengthSEC
        };
      })
    };

    response.json(albumWithSongs);
  } else {
    response.json({ message: "No album found" });
  }
});

albumsRouter.post("/", async (request, response) => {
  console.log("albums post");

  const album = request.body;

  const query = /*sql*/ `
     -- opret album
     INSERT INTO albums (title, releaseYear)
     VALUES (?, ?)
    `;
  const albumValues = [album.title, album.releaseYear];
  const [results] = await connection.execute(query, albumValues);

  const newAlbumId = results.insertId;

  const joinAlbumArtistQuery = /*sql*/ `
     -- opret join mellem album og artist
     INSERT INTO artists_albums (artist_id, album_id)
     VALUES (?, ?)
    `;
  const artistAlbumValues = [album.artistId, newAlbumId];

  const artistAlbumResults = await connection.execute(joinAlbumArtistQuery, artistAlbumValues);
  console.log(artistAlbumResults);

  response.json({ message: "New album created" });
});

export default albumsRouter;

//  const query = /*sql*/ `
//   -- se både artists + tracks i albums
//     SELECT DISTINCT albums.*,
//     tracks.title as trackTitle,
//     tracks.id as trackId,
//     artists.name as ArtistName,
//     artists.id as ArtistId
//     FROM albums
//     JOIN albums_tracks ON albums.id = albums_tracks.albums_id
//     JOIN tracks ON albums_tracks.track_id = tracks.id
//     JOIN artists_albums ON albums.id = artists_albums.album_id
//     JOIN artists ON artists_albums.artist_id = artists.id
//     ORDER BY albums.id;
//     `;
