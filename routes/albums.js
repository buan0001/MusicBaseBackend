import { Router } from "express";
import connection from "../database.js";
import { tryExecute } from "../helpers.js";

const albumsRouter = Router();

// READ all albums
albumsRouter.get("/", async (request, response) => {
  // console.log("all albums get");
  const query =
    /*sql*/
    `
     -- See albums with artist without tracks
    SELECT DISTINCT albums.*,
      artists.name as ArtistName,
      artists.id as artistId
    FROM albums
    JOIN artists_albums ON albums.id = artists_albums.album_id
    JOIN artists ON artists_albums.artist_id = artists.id;
    `;

  response.json(await tryExecute(query));
});

// GET Endpoint "/albums/search?q=something"
albumsRouter.get("/search", async (request, response) => {
  console.log("search albums get");
  const query = request.query.q;
  const queryString =
    /*sql*/
    `
   -- See albums with artist name without tracks
    SELECT DISTINCT albums.*,
      artists.name as ArtistName,
      artists.id as artistId
    FROM albums
    JOIN artists_albums ON albums.id = artists_albums.album_id
    JOIN artists ON artists_albums.artist_id = artists.id
    WHERE title LIKE ?
    ORDER BY title;
    `;

  const values = [`%${query}%`];
  console.log(queryString);

  const [results] = await connection.execute(queryString, values);
  // response.json(results);
  if (results.length) {
    response.json(results);
  } else {
    response.json({ message: "No album found" });
  }
});

albumsRouter.get("/:id", async (request, response) => {
  console.log("one albums get");
  const id = request.params.id;

  // const album = request.params;
  // console.log("ALBUM UD FRA ID ", album);

  // LEFT JOIN to still see albums even if it doesn't have an artist and/or tracks
  const query =
    /*sql*/
    `
        SELECT DISTINCT albums.*,
            tracks.title as trackTitle,
            tracks.id as trackId,
            tracks.durationSeconds trackLengthSEC,
            artists.name as artistName,
            artists.id as artistId
        FROM albums
        LEFT JOIN albums_tracks ON albums.id = albums_tracks.albums_id
        LEFT JOIN tracks ON albums_tracks.track_id = tracks.id
        LEFT JOIN artists_albums ON albums.id = artists_albums.album_id
        LEFT JOIN artists ON artists_albums.artist_id = artists.id
        WHERE albums.id = ?
        ORDER BY albums.id;
    `;

  const values = [id];

  response.json(await tryExecute(query, values));
  // console.log("album med id results ", results);

  if (results[0]) {
    const album = results[0];
    const albumWithSongs = {
      id: album.id,
      title: album.title,
      releaseYear: album.releaseYear,
      artist: album.artistName,
      artistID: album.artistId,
      tracks: results
        .filter((track) => track.trackId !== null) // Filter out null tracks (albums without tracks)
        .map((track) => {
          return {
            id: track.trackId,
            title: track.trackTitle,
            length: track.trackLengthSEC,
          };
        }),
    };

    response.json(albumWithSongs);
  } else {
    response.json({ message: "No album found" });
  }
});

albumsRouter.post("/", async (request, response) => {
  console.log("albums post");

  const album = request.body;

  const query =
    /*sql*/
    `
     -- Create album
     INSERT INTO albums (title, releaseYear)
     VALUES (?, ?)
    `;

  const albumValues = [album.title, album.releaseYear];
  response.json(await tryExecute(query, albumValues));

  const newAlbumId = results.insertId;

  const joinAlbumArtistQuery =
    /*sql*/
    `
     -- Inserts artists and albums ID's into junction table
     INSERT INTO artists_albums (artist_id, album_id)
     VALUES (?, ?)
    `;

  const artistAlbumValues = [album.artistId, newAlbumId];

  const artistAlbumResults = await connection.execute(joinAlbumArtistQuery, artistAlbumValues);

  response.json({ message: "New album created" });
});

albumsRouter.put("/:id", async (request, response) => {
  console.log("albums put");
  const id = request.params.id; // Takes ID from the URL
  const album = request.body;
  const query = "UPDATE albums SET title = ?, releaseYear = ? WHERE id = ?";
  const values = [album.title, album.releaseYear, id];
  response.json(await tryExecute(query, values));
});

export default albumsRouter;
albumsRouter.post("/completeAlbum", async (request, response) => {
  // to use this in postman, you have to use this json blueprint:
  // {
//   "trackids": [xx, xx, xx, xx, xx],
//   "title": "XXX",
//   "releaseYear": "XXXX",
//   "artistId": "X"
// // }

  console.log("complete album posted");

  const album = request.body;
  const albumQuery = /*sql*/ `
     -- creates album
     INSERT INTO albums (title, releaseYear)
     VALUES (?, ?)
    `;
  const albumValues = [album.title, album.releaseYear];
  const [albumResults] = await connection.execute(albumQuery, albumValues);

  const trackIDs = request.body.trackids
  const newAlbumID = albumResults.insertId;

  for (const trackID of trackIDs) {
    const joinAlbumTrackQuery = /*sql*/ `
    INSERT INTO albums_tracks (albums_id, track_id)
    VALUES (?, ?)
    `;
    
    const albumTrackValues = [newAlbumID, trackID];

    const [trackResults] = await connection.execute(joinAlbumTrackQuery, albumTrackValues);
    
  }
  
  const joinAlbumArtistQuery = /*sql*/ `
     -- opret join mellem album og artist
     INSERT INTO artists_albums (artist_id, album_id)
     VALUES (?, ?)
    `;
  const artistAlbumValues = [album.artistId, newAlbumID];

  const artistAlbumResults = await connection.execute(
    joinAlbumArtistQuery,
    artistAlbumValues
  );

  response.json({ message: "New album created" });
});

export default albumsRouter;
