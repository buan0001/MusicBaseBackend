import connection from "./database.js";

async function tryExecute(query, values) {
  try {
    console.log("TRY EXECUTE");
    const [results] = await connection.execute(query, values);
    return results;
  } catch (error) {
    return error;
  }
}


 async function deleteJunctionEntries(which, id) {
  const matchingJunctions = { track: ["artists_tracks", "albums_tracks"], album: ["albums_tracks", "artists_albums"], artist: ["artists_tracks", "artists_albums"] };
  const iterable = [...matchingJunctions[which]];
  const whichId = which + "_id"
  
  for (const junction of iterable) {
    console.log("Delete from:", junction, "where", whichId);
      const deleteQuery = `DELETE from ${junction} WHERE ${whichId} = ?`;
    await connection.execute(deleteQuery, [id]);
  }
}

export { tryExecute, deleteJunctionEntries };
