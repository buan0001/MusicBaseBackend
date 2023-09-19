import { Router } from "express";
import connection from "../database.js";

const albumsRouter = Router();

// READ all albums
albumsRouter.get("/", (request, response) => {
  const query = /*sql*/ `
  -- se både artists + tracks i albums
    SELECT DISTINCT albums.*,
    tracks.title as trackTitle,
    tracks.id as trackId,
    artists.name as ArtistName,
    artists.id as ArtistId
    FROM albums
    JOIN albums_tracks ON albums.id = albums_tracks.albums_id
    JOIN tracks ON albums_tracks.track_id = tracks.id
    JOIN artists_albums ON albums.id = artists_albums.album_id
    JOIN artists ON artists_albums.artist_id = artists.id
    ORDER BY albums.id;
    `;
  connection.query(query, (error, results, fields) => {
    if (error) {
      console.log(error);
    } else {
      response.json(results);
    }
  });
});

albumsRouter.get("/:id", (request, response) => {
  const id = request.params.id;

  const queryString = /*sql*/ `
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

  connection.query(queryString, values, (error, results) => {
    if (error) {
      console.log(error);
    } else {
      if (results[0]) {
        const album = results[0];
        const albumWithSongs = {
          id: album.id,
          title: album.title,
          releaseDate: album.releaseYear,
          artist: album.artistName,
          artistID: album.artistId,
          songs: results.map((song) => {
            return {
              id: song.trackId,
              title: song.trackTitle,
              length: song.trackLengthSEC
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
