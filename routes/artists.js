import { Router } from "express";
import connection from "../database.js";
import { tryExecute as tryExecute, deleteJunctionEntries } from "../helpers.js";

const artistsRouter = Router();

// READ all artists
artistsRouter.get("/", async (request, response) => {
  const query =
    /*sql*/
    `
   SELECT * FROM artists
   ORDER BY name;
    `;

  // const [results] = await connection.execute(query);
  response.json(await tryExecute(query));
});

// READ endpoint search string
artistsRouter.get("/search", async (request, response) => {
  const searchString = request.query.q;
  const query = /*sql*/ `
    SELECT * 
    FROM artists
    WHERE name LIKE ?
    ORDER BY name`;
  const values = [`%${searchString}%`];
  // const [results] = await connection.execute(query, values);
  response.json({ artists: await tryExecute(query, values) });
  // response.json(results);
});

// READ one artist
artistsRouter.get("/:id", async (request, response) => {
  const id = request.params.id; // Takes ID from the URL
  const query =
    /*sql*/
    `
    SELECT * 
    FROM artists WHERE id=?;
    `;

  const values = [id];

  response.json(await tryExecute(query, values));
  // const [results] = await connection.execute(query, values);
  // response.json(results);
});

// CREATE artist
artistsRouter.post("/", async (request, response) => {
  console.log("CREATE ARTIST");
  const artist = request.body;
  const query = "INSERT INTO artists (name, birthdate) VALUES (?, ?)";
  const values = [artist.name, artist.birthdate];
  response.json(await tryExecute(query, values));
});

// UPDATE artist
artistsRouter.put("/:id", async (request, response) => {
  const id = request.params.id; // Takes ID from the URL
  const artist = request.body;
  const query = "UPDATE artists SET name = ?, birthdate = ? WHERE id = ?";
  const values = [artist.name, artist.birthdate, id];
  response.json(await tryExecute(query, values));
});

// DELETE artist
artistsRouter.delete("/:id", async (request, response) => {
  console.log("DELETE ARTIST");
  // DELETES EVERYTHING ASSOCIATED TO THIS ARTIST. USE WITH CAUTION!

  const id = request.params.id; // Takes ID from the URL
  const values = [id];
  try {
    // Delete all junction entries - need to do this first to get rid of dependencies
    await deleteJunctionEntries("artist", id);


    const albumsTracksDelete = `DELETE from albums_tracks WHERE album_id NOT IN (SELECT album_id FROM artists_albums)`;
    await connection.execute(albumsTracksDelete);

    // Then the artist
    const artistQuery = `DELETE from artists WHERE id = ?`;
    await connection.execute(artistQuery, values);

    // And all their tracks
    const trackQuery = /*sql*/ `DELETE from tracks
    WHERE id NOT IN (SELECT track_id from artists_tracks)`;

    // tryExecute(trackQuery)
    response.json(await tryExecute(trackQuery));
  } catch (err) {
    response.json(err);
  }
});


export default artistsRouter;
