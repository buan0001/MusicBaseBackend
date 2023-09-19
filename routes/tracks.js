import { Router } from "express";
import connection from "../database.js";

const tracksRouter = Router();

tracksRouter.get("/", (request, response) => {
  const query =
    /*sql*/
    `
    SELECT DISTINCT tracks.*,
    album.name as albumName,
    album.id as albumID,
    artists.name as ArtistName,
    artists.id as ArtistId 
    FROM tracks;
    JOIN albums_tracks ON tracks.id = albums_tracks.track_id
    JOIN albums ON albums_tracks.albums_id = albums.id
    JOIN artists_albums ON albums.id = artists_albums.album_id
    JOIN artists ON artists_albums.artist_id = artists.id
    ORDER BY track.id
    `;
  connection.query(query, (error, results, fields) => {
    if (error) {
      console.log(error);
    } else {
      response.json(results);
    }
  });
});

export default tracksRouter;

/*sql*/ `-- SELECT tracks*, genres.genreName, labels.labelName
    -- FROM tracks
    -- JOIN genres ON tracks.genreId = genres.id
    -- JOIN labels ON tracks.labelId = labels.id;

-- skal ha testet disse

    --SELECT a.artist_id, a.artist_name, g.genre_name, l.labelName
    --FROM artists a
    --JOIN artist_genre ag ON a.artist_id = ag.artist_id
    --JOIN genres g ON ag.genre_id = g.id
    --LEFT JOIN artist_label al ON a.artist_id = al.artist_id
    --LEFT JOIN labels l ON al.label_id = l.id; `