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
      artists.name as artistName,
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
      artists.name as artistName,
      artists.id as artistId
    FROM albums
    JOIN artists_albums ON albums.id = artists_albums.album_id
    JOIN artists ON artists_albums.artist_id = artists.id
    WHERE title LIKE ?
    ORDER BY title;
    `;

  const values = [`%${query}%`];
  console.log(queryString);
  response.json({ albums: await tryExecute(queryString, values) });
});

albumsRouter.get("/search/:artistId", async (request, response) => {
  console.log("SEARCH SPECIFIC ARTIST ID");
  const queryString = /*sql*/ `
   -- se albums med artist navn UDEN tracks
    SELECT DISTINCT albums.*,
      artists.name,
      artists.birthdate as birthdate,
      artists.id as artistId
    FROM albums
    JOIN artists_albums ON albums.id = artists_albums.album_id
    JOIN artists ON artists_albums.artist_id = artists.id
    WHERE artists.id = ?
    ORDER BY artists.name;
    `;
  const values = [request.params.artistId];
  response.json(await tryExecute(queryString, values));
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
            tracks.durationSeconds,
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

  // response.json(await tryExecute(query, values));
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
            durationSeconds: track.durationSeconds,
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
  const results = await tryExecute(query, albumValues)

  const newAlbumId = results.insertId;

  const joinAlbumArtistQuery =
    /*sql*/
    `
     -- Inserts artists and albums ID's into junction table
     INSERT INTO artists_albums (artist_id, album_id)
     VALUES (?, ?)
    `;

  const artistAlbumValues = [album.artistId, newAlbumId];

  await connection.execute(joinAlbumArtistQuery, artistAlbumValues);

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

albumsRouter.post("/completeAlbum", async (request, response) => {
  // To use this in postman, you have to use this json blueprint,
  // Note that "trackids" should only be used if you want to add existing tracks, and the same for "artistId".
  // If you want to create new tracks and/or artist(s) you can use "newTracks" and or "newArtists":
  // {
  //   "trackids": [int, int, int,...],
  //   "title": "varchar",
  //   "releaseYear": "int",
  //   "artistId": [int, int, int],
  //   *OPTIONAL*: "newTracks": [
  //     {"title": "varchar", "durationSeconds": int, "artistId":int},
  //     {"title": "varchar", "durationSeconds": int, "artistId":int},
  //     {"title": "varchar", "durationSeconds": int, "artistId":int}
  //   ],
  //   *OPTIONAL*: "newArtists": [
  //     {"title": "varchar", "birthdate": yy-mm-dd},
  //     {"title": "varchar", "birthdate": yy-mm-dd}
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

  console.log("ALBUM RESULTS:", albumResults);
  const trackIDs = request.body.trackids;
  const artistId = request.body.artistId;
  const newTracks = request.body.newTracks;
  const newArtists = request.body.newArtists;
  const newAlbumID = albumResults.insertId;

  console.log(newAlbumID);
  console.log("BODY:@@@@@@@@@@@@@@", album);
  if (newArtists) {
    const newArtistsID = await addNewArtists(newArtists);
    console.log("new artists:", newArtistsID);
    artistId.push(...newArtistsID);
  }
  if (artistId) {
    for (const id of artistId) {
      const joinAlbumArtistQuery = /*sql*/ `
         -- opret join mellem album og artist
         INSERT INTO artists_albums (artist_id, album_id)
         VALUES (?, ?)
        `;
      const artistAlbumValues = [id, newAlbumID];
      const artistAlbumResults = await connection.execute(joinAlbumArtistQuery, artistAlbumValues);
    }
  }
  if (newTracks) {
    const newTrack = await addNewTracks(newTracks);
    // console.log(newTrack);

    const newIds = [];
    newTrack.forEach((track) => newIds.push(track.id));
    // console.log("NEW IDS:", newIds);
    trackIDs.push(...newIds);
    // console.log("TRACK IDS:", trackIDs);
    addTrackToArtist(newTrack);
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

async function addNewArtists(artists) {
  const array = [];
  for (const newArtist of artists) {
    const artistQuery = /*sql*/ `
    INSERT INTO artists (name, birthdate)
    VALUES (?, ?)
    `;
    const artistValues = [newArtist.name, newArtist.birthdate];
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
    const trackValues = [newTrack.title, newTrack.durationSeconds];
    const [trackResults] = await connection.execute(trackQuery, trackValues);
    const newTrackId = trackResults.insertId;
    newTrack.id = newTrackId;
    array.push(newTrack);
  }
  console.log("ADD NEW TRACK ARRAY:", array);
  return array;
}

async function addTrackToArtist(trackIDs) {
  for (const newTrack of trackIDs) {
    const trackQuery = /* sql */ `
      INSERT INTO artists_tracks (artist_id, track_id)
         VALUES (?, ?)
    `;
    const trackValues = [newTrack.artistId, newTrack.id];
    const [trackResults] = await connection.execute(trackQuery, trackValues);
  }
}

export default albumsRouter;
