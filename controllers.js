import connection from "./database.js";

async function getArtists(request, response) {
  console.log("test");
  connection.query("SELECT * FROM `users`", (err, results, fields) => {
    response.json(results);
  });
}

async function getArtistsID(request, response) {
  console.log("getting specific user");
  const id = request.params.id; // tager id fra url'en, så det kan anvendes til at finde den givne bruger med "det" id.
  const query = "SELECT * FROM artists WHERE id = ?";
  const values = [id];
  connection.query(query, values, (err, results, fields) => {
    if (err) {
      response.json(err);
    } else {
      console.log(results);
      response.json(results);
    }
  });
}

async function createArtist(request, response) {
  const newUser = request.body;
  const query = "INSERT INTO artists (name, mail, title, image) VALUES (?, ?, ?, ?)";
  const values = [newUser.name, newUser.mail, newUser.title, newUser.image];
  connection.query(query, values, (err, results, fields) => {
    if (err) {
      response.json(err);
    } else {
      console.log(results);
      response.json(results);
    }
  });
}

async function updateArtist(request, response) {
  const id = request.params.id; // tager id fra url'en, så det kan anvendes til at finde den givne bruger med "det" id.
  const body = request.body;
  const query = "UPDATE artists SET name = ?, mail = ?, title = ?, image = ? WHERE id = ?";
  const values = [body.name, body.mail, body.title, body.image, id];
  connection.query(query, values, (err, results, fields) => {
    if (err) {
      response.json(err);
    } else {
      console.log(results);
      response.json(results);
    }
  });
}

async function deleteArtist(request, response) {
  const id = request.params.id; // tager id fra url'en, så det kan anvendes til at finde den givne bruger med "det" id.
  const query = "DELETE from artists WHERE id = ?";
  const values = [id];
  connection.query(query, values, (err, results, fields) => {
    if (err) {
      response.json(err);
    } else {
      console.log(results);
      response.json(results);
    }
  });
}

export { getArtists, getArtistsID, createArtist, updateArtist, deleteArtist };
