import { Router } from "express";
import connection from "../database.js";

const artistsRouter = Router();

// READ all artists
artistsRouter.get("/", (request, response) => {
  const query = /*sql*/ `
    -- SELECT artists.artist_id, artists.artist_name, genres.genre_name FROM artists 
   -- JOIN artist_genre ON artists.artist_id = artist_genre.artist_id
   -- JOIN genres ON artist_genre.genre_id = genres.genre_id;
   SELECT * FROM artists;
    `;
  connection.query(query, (error, results, fields) => {
    if (error) {
      console.log(error);
    } else {
      response.json(results);
    }
  });
});

// READ one artist
artistsRouter.get("/:id", (request, response) => {
  const id = request.params.id; // tager id fra URL'en
  const query = "SELECT * FROM artists WHERE id = ?";
  const values = [id];

  connection.query(query, values, (error, results, fields) => {
    if (error) {
      console.log(error);
    } else {
      response.json(results[0]);
    }
  });
});

/* INDSÆT KORREKT INFORMATION DER SKAL DISPLAYES FOR ARTIST, DVS. IKKE MAIL & TITLE */
// CREATE artist
artistsRouter.post("/", async (request, response) => {
  const artist = request.body;
  const query = "INSERT INTO artists (name, birthdate) VALUES (?, ?)";
  const values = [artist.name, artist.birthdate];
  try {
    const [results] = await connection.execute(query, values);
    response.json(results);
  } catch (err) {
    response.json(err);
  }
});

/* INDSÆT KORREKT INFORMATION DER SKAL DISPLAYES FOR ARTIST, DVS. IKKE MAIL & TITLE */
// UPDATE artist
artistsRouter.put("/:id", (request, response) => {
  const id = request.params.id; // tager id fra URL'en
  const artist = request.body;
  const query = "UPDATE artists SET name = ?, birthdate = ? WHERE id = ?";
  const values = [artist.name, artist.birthdate, id];

  connection.query(query, values, (error, results, fields) => {
    if (error) {
      response.json(error);
    } else {
      response.json(results);
    }
  });
});

// DELETE artist
artistsRouter.delete("/:id", async (request, response) => {
  const id = request.params.id; // tager id fra URL'en
  const values = [id];

  // DELETE from artists_tracks WHERE artist_id = ?;
  // DELETE from ARTISTS
  try {
    const query = `SELECT track_id from artists_tracks WHERE artist_id = ?;`;
    const [results] = await connection.execute(query, values);
    const associatedTrackIDs = [];

    results.forEach(e => {associatedTrackIDs.push(e.track_id)});
    console.log("test:",associatedTrackIDs.values());
    // const newQuery = `SELECT id from tracks WHERE id in (?);`
    // const [results2] = await connection.execute(newQuery, associatedTrackIDs)
    // console.log(results2);
    // const test = Object.values(results)
    // console.log("test", test);
    // await deleteTrack
    response.json(associatedTrackIDs);
  } catch (err) {
    response.json(err);
  }

  // connection.query(query, values, (error, results, fields) => {
  //   if (error) {
  //     response.json(error);
  //   } else {
  //     response.json(results);
  //   }
  // });
});

export default artistsRouter;
