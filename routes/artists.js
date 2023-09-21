import { Router } from "express";
import connection from "../database.js";

const artistsRouter = Router();

// READ all artists
artistsRouter.get("/", async (request, response) => {
  const query = /*sql*/ `
   SELECT * FROM artists
   ORDER BY name;
    `;

  const [results] = await connection.execute(query);
  response.json(results);
});

// READ endpoint for what was searched for
artistsRouter.get("/search", async (request, response) => {
  const searchString = request.query.q;
  const query = /*sql*/ `
    SELECT * 
    FROM artists
    WHERE name LIKE ?
    ORDER BY name`;
  const values = [`%${searchString}%`];
  const [results] = await connection.execute(query, values);
  response.json(results);
});

// READ one artist
artistsRouter.get("/:id", async (request, response) => {
  const id = request.params.id; // tager id fra URL'en
  const query = /*sql*/ `
    SELECT * 
    FROM artists WHERE id=?;
    `;
  const values = [id];

  const [results] = await connection.execute(query, values);
  response.json(results);
});

//  SEARCH 1 ARTIST SPECIFIKT??
// artistsRouter.get("/search", (request, response) => {
//   console.log("searching for artist");
//   const query = request.query.q;
//   console.log(query);

//   const queryString = /*sql*/ `
//     SELECT * FROM artists WHERE name LIKE ? ORDER BY name;`;
//   const values = [`%${query}%`];
//   connection.query(queryString, values, (error, results) => {
//     if (error) {
//       console.error(error);
//       response.status(500).json({ message: "Error occured" });
//     } else {
//       response.json(results);
//     }
//   });
// });

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
artistsRouter.put("/:id", async (request, response) => {
  const id = request.params.id; // tager id fra URL'en
  const artist = request.body;
  const query = "UPDATE artists SET name = ?, birthdate = ? WHERE id = ?";
  const values = [artist.name, artist.birthdate, id];
  try
  {const [results] = await connection.execute(query, values);
  response.json(results);}
  catch (err){response.json(err)}
});

// DELETE artist
artistsRouter.delete("/:id", async (request, response) => {
  // DELETES EVERYTHING ASSOCIATED TO THIS ARTIST. USE WITH CAUTION!

  const id = request.params.id; // tager id fra URL'en
  const values = [id];
  try {
    // Delete all junction entries - need to do this first to get rid of dependencies
    await deleteJunctionEntries(values)

    // Then the artist themself
    const artistQuery = `DELETE from artists WHERE id = ?`
    await connection.execute(artistQuery, values);


    // And all their tracks
    const trackQuery = /*sql*/ `DELETE from tracks
    WHERE id NOT IN (SELECT track_id from artists_tracks)`
    const [trackResult] = await connection.execute(trackQuery);

    response.json(trackResult);
  } catch (err) {
    response.json(err);
  }

});

async function deleteJunctionEntries(values) {
  const firstDelete = `DELETE from artists_tracks WHERE artist_id = ?`
  await connection.execute(firstDelete, values);
  
  const secondDelete = `DELETE from artists_albums WHERE artist_id = ?`
  await connection.execute(secondDelete, values);

  const thirdDelete = `DELETE from albums_tracks
  WHERE album_id NOT IN (SELECT album_id FROM artists_albums)`
  await connection.execute(thirdDelete);
}

export default artistsRouter;
