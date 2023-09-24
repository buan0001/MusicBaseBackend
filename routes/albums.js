import { Router } from "express";
import connection from "../database.js";

const albumsRouter = Router();

// READ all albums
albumsRouter.get("/", async (request, response) => {
  // console.log("all albums get");
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

  await connection.execute(joinAlbumArtistQuery, artistAlbumValues);

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

albumsRouter.post("/completeAlbum", async (request, response) => {
  // to use this in postman, you have to use this json blueprint,
  // note that "trackids" should only be used if you want to add existing tracks, and the same for "artistId". If you want to create new tracks and/or artist(s) you can use "newTracks" and or "newArtists":
  // {
  //   "trackids": [xx, xx, xx, xx...],
  //   "title": "xxx",
  //   "releaseYear": "xxxx",
  //   "artistId": [x, x, x],
  //   "newTracks": [
  //     {"title": "xxxx", "durationSeconds": xxx},
  //     {"title": "xxx", "durationSeconds": xxx},
  //     {"title": "xxx", "durationSeconds": xxx}
  //   ],
  //   "newArtists": [
  //     {"title": "xxx", "durationSeconds": xxx},
  //     {"title": "xxx", "durationSeconds": xxx}
  //   ]
  // }

  console.log("complete album posted");

  const album = request.body;
  const albumQuery = /*sql*/ `
     -- creates album
     INSERT INTO albums (title, releaseYear)
     VALUES (?, ?)
    `;
  const albumValues = [album.title, album.releaseYear];
  const [albumResults] = await connection.execute(albumQuery, albumValues);

  const trackIDs = request.body.trackids;
  const artistId = request.body.artistId;
  const newTracks = request.body.newTracks;
  const newArtists = request.body.newArtists;
  const newAlbumID = albumResults.insertId;

  if (newArtists) {
    const newArtist = await addNewArtists(newArtists);
    console.log(newArtist);
    artistId.push(...newArtist);
  }
  if (artistId) {
    for (const artistId of newArtist) {
      const joinAlbumArtistQuery = /*sql*/ `
         -- opret join mellem album og artist
         INSERT INTO artists_albums (artist_id, album_id)
         VALUES (?, ?)
        `;
      const artistAlbumValues = [artistId.artistId, newAlbumID];
      const artistAlbumResults = await connection.execute(
        joinAlbumArtistQuery,
        artistAlbumValues
      );
    }
  }
  if (newTracks) {
    const newTrack = await addNewTracks(newTracks);
    console.log(newTrack);
    trackIDs.push(...newTrack);
  }
  if (trackIDs) {
    for (const trackID of trackIDs) {
      const joinAlbumTrackQuery = /*sql*/ `
    INSERT INTO albums_tracks (albums_id, track_id)
    VALUES (?, ?)
    `;

      const albumTrackValues = [newAlbumID, trackID];

      await connection.execute(joinAlbumTrackQuery, albumTrackValues);
    }
  }

  response.json({ message: "New album created" });
});

async function addNewArtists(artist) {
  const array = [];
  for (const newArtist of artist) {
    const artistQuery = /*sql*/ `
    INSERT INTO artists (name, birthdate)
    VALUES (?, ?)
    `;
    const artistValues = (newArtist.name, newArtist.birthdate);
    const [artistResults] = await connection.execute(artistQuery, artistValues);
    const newArtistId = artistResults.insertId;
    array.push(newArtistId);
  }
  return array;
}

async function addNewTracks(track) {
  const array = [];
  for (const newTrack of track) {
    const trackQuery = /* sql */ `
    INSERT INTO tracks (title, durationSeconds)
    VALUES (?, ?)
    `;
    const trackValues = (newTrack.title, newTrack.durationSeconds);
    const [trackResults] = await connection.execute(trackQuery, trackValues);
    const newTrackId = trackResults.insertId;
    array.push(newTrackId);
  }

  return array;
}

export default albumsRouter;
