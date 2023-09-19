import express from "express";
import fs from "fs/promises";
import cors from "cors";
import connection from "./database.js";

const app = express();
const port = 3333;

app.use(express.json());
app.use(cors());

app.get("/", (request, response) => {
  response.send("MusicBase rest api 🎉");
});

// READ all artists
app.get("/artists", async (request, response) => {
  console.log("test");
  connection.query(
    /*sql*/
    `SELECT artists.artist_id, artists.artist_name, genres.genre_name FROM artists 
    JOIN artist_genre ON artists.artist_id = artist_genre.artist_id
    JOIN genres ON artist_genre.genre_id = genres.genre_id;`,
    function (err, results, fields) {
      response.json(results);
    }
  );
});

// READ one user
app.get("/artists/:id", async (request, response) => {
  console.log("getting specific user");
  const id = request.params.id; // tager id fra url'en, så det kan anvendes til at finde den givne bruger med "det" id.
  const query = "SELECT * FROM artists WHERE id = ?";
  const values = [id];
  connection.query(query, values, function (err, results, fields) {
    if (err) {
      response.json(err);
    } else {
      console.log(results);
      response.json(results);
    }
  });
});

// CREATE user
app.post("/artists", async (request, response) => {
  const newUser = request.body;
  const query =
    "INSERT INTO artists (name, mail, title, image) VALUES (?, ?, ?, ?)";
  const values = [newUser.name, newUser.mail, newUser.title, newUser.image];
  connection.query(query, values, function (err, results, fields) {
    if (err) {
      response.json(err);
    } else {
      console.log(results);
      response.json(results);
    }
  });

  //   console.log(newUser);

  //   const artists = await getartistsFromJSON();
  //   artists.push(newUser);
  //   fs.writeFile("data.json", JSON.stringify(artists));
  //   response.json(artists);
});

// UPDATE user
app.put("/artists/:id", async (request, response) => {
  const id = request.params.id; // tager id fra url'en, så det kan anvendes til at finde den givne bruger med "det" id.
  const body = request.body;
  const query =
    "UPDATE artists SET name = ?, mail = ?, title = ?, image = ? WHERE id = ?";
  const values = [body.name, body.mail, body.title, body.image, id];
  connection.query(query, values, function (err, results, fields) {
    if (err) {
      response.json(err);
    } else {
      console.log(results);
      response.json(results);
    }
  });
});

// DELETE user
app.delete("/artists/:id", async (request, response) => {
  const id = request.params.id; // tager id fra url'en, så det kan anvendes til at finde den givne bruger med "det" id.
  const query = "DELETE from artists WHERE id = ?";
  const values = [id];
  connection.query(query, values, function (err, results, fields) {
    if (err) {
      response.json(err);
    } else {
      console.log(results);
      response.json(results);
    }
  });
});

app.listen(port, () => {
  console.log(`App listening on http://localhost:${port}`);
});
