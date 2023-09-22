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

// GET Endpoint "/albums/search?q=something"
albumsRouter.get("/search", async (request, response) => {
  console.log("search albums get");
  const query = request.query.q;
  const queryString = /*sql*/ `
   -- se albums med artist navn UDEN tracks
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

  // Here LEFT JOIN does so we can still see albums even if it doesn't have artist or/and tracks
  const query = /*sql*/ `
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

  const [results] = await connection.execute(query, values);
  // console.log("album med id results ", results);

  if (results[0]) {
    const album = results[0];
    console.log(results);
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

  const artistAlbumResults = await connection.execute(
    joinAlbumArtistQuery,
    artistAlbumValues
  );
  console.log(artistAlbumResults);
  response.json({ message: "New album created" });
});

albumsRouter.put("/:id", async (request, response) => {
  console.log("albums put");
  const id = request.params.id; // tager id fra URL'en
  const album = request.body;
  const query = "UPDATE albums SET title = ?, releaseYear = ? WHERE id = ?";
  const values = [album.title, album.releaseYear, id];
  try {
    const [results] = await connection.execute(query, values);
    response.json(results);
  } catch (err) {
    response.json({ message: "Couldn't update Album" });
  }
});

export default albumsRouter;