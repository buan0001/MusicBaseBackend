import { Router } from "express";
import connection from "../database.js";
import { tryExcecute } from "../helpers.js";

const artistsRouter = Router();

// READ all artists
artistsRouter.get("/", async (request, response) => {
  const query = /*sql*/ `
   SELECT * FROM artists
   ORDER BY name;
    `;

  // const [results] = await connection.execute(query);
  response.json(await tryExcecute(query));
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
  response.json({ artists: await tryExcecute(query, values) });
});

// READ one artist
artistsRouter.get("/:id", async (request, response) => {
  const id = request.params.id; // tager id fra URL'en
  const query = /*sql*/ `
    SELECT * 
    FROM artists WHERE id=?;
    `;
  const values = [id];

  response.json(await tryExcecute(query, values));
  // const [results] = await connection.execute(query, values);
  // response.json(results);
});

// CREATE artist
artistsRouter.post("/", async (request, response) => {
  const artist = request.body;
  const query = "INSERT INTO artists (name, birthdate) VALUES (?, ?)";
  const values = [artist.name, artist.birthdate];
  response.json(await tryExcecute(query, values));
});

// UPDATE artist
artistsRouter.put("/:id", async (request, response) => {
  const id = request.params.id; // tager id fra URL'en
  const artist = request.body;
  const query = "UPDATE artists SET name = ?, birthdate = ? WHERE id = ?";
  const values = [artist.name, artist.birthdate, id];
  response.json(await tryExcecute(query, values));
});

// DELETE artist
artistsRouter.delete("/:id", async (request, response) => {
  // DELETES EVERYTHING ASSOCIATED TO THIS ARTIST. USE WITH CAUTION!

  const id = request.params.id; // tager id fra URL'en
  const values = [id];
  try {
    // Delete all junction entries - need to do this first to get rid of dependencies
    await deleteJunctionEntries(values);

    // Then the artist themself
    const artistQuery = `DELETE from artists WHERE id = ?`;
    await connection.execute(artistQuery, values);

    // And all their tracks
    const trackQuery = /*sql*/ `DELETE from tracks
    WHERE id NOT IN (SELECT track_id from artists_tracks)`;

    // tryExcecute(trackQuery)
    response.json(await tryExcecute(trackQuery));
  } catch (err) {
    response.json(err);
  }
});

async function deleteJunctionEntries(values) {
  const firstDelete = `DELETE from artists_tracks WHERE artist_id = ?`;
  await connection.execute(firstDelete, values);

  const secondDelete = `DELETE from artists_albums WHERE artist_id = ?`;
  await connection.execute(secondDelete, values);

  // Since artist_id isn't in this table, we can instead look for album_id
  // In the second delete we delete BOTH the artist_id and the album_id
  // We can use this to look for entries where albums_tracks.album_id has no match in artists_albums.album_id
  const thirdDelete = `DELETE from albums_tracks
  WHERE album_id NOT IN (SELECT album_id FROM artists_albums)`;
  await connection.execute(thirdDelete);
}

export default artistsRouter;
