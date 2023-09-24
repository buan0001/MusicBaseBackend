import connection from "./database.js";

async function tryExecute(query, values) {
  try {
    const [results] = await connection.execute(query, values);
    return results;
  } catch (err) {
    return err;
  }
}

export { tryExecute as tryExcecute };
