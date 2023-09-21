import { Router } from "express";
import connection from "../database.js";


const artistsRouter = Router();

// READ all artists
artistsRouter.get("/", async (request, response) => {
  const query = /*sql*/ `
   SELECT * FROM artists
   ORDER BY name;
    `;
  const [results] = await connection.execute(query, values);
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

  const [results] = await connection.execute(query, values);
  response.json(results);
});

/* INDSÆT KORREKT INFORMATION DER SKAL DISPLAYES FOR ARTIST, DVS. IKKE MAIL & TITLE */
// UPDATE artist
artistsRouter.put("/:id", async (request, response) => {
  const id = request.params.id; // tager id fra URL'en
  const artist = request.body;
  const query = "UPDATE artists SET name = ?, birthdate = ? WHERE id = ?";
  const values = [artist.name, artist.birthdate, id];

  const [results] = await connection.execute(query, values);
  response.json(results);
});

// DELETE artist
artistsRouter.delete("/:id", async (request, response) => {
  const id = request.params.id; // tager id fra URL'en
  const query = `SELECT from artists_tracks WHERE artist_id = ?;`;
  const values = [id];

  const [results] = await connection.execute(query, values);
  response.json(results);
});

export default artistsRouter;
