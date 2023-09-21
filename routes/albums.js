import { Router } from "express";
import connection from "../database.js";

const albumsRouter = Router();

// READ all albums
albumsRouter.get("/", (request, response) => {
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

  connection.query(query, (error, results, fields) => {
    if (error) {
      console.log(error);
    } else {
      response.json(results);
    }
  });
});

// GET Endpoint "/albums/search?q=something" - get all albums
albumsRouter.get("/search", (request, response) => {
  console.log("search albums get");
  const query = request.query.q;
  const queryString = /*sql*/ `
    SELECT *
    FROM albums
    WHERE title LIKE ?
    ORDER BY title;`;
  const values = [`%${query}%`];
  console.log(queryString);
  connection.query(queryString, values, (error, results) => {
    if (error) {
      console.log(error);
    } else {
      response.json(results);
    }
  });
});

albumsRouter.get("/:id", (request, response) => {
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

  connection.query(query, values, (error, results) => {
    if (error) {
      console.log(error);
    } else {
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
    }
  });
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
