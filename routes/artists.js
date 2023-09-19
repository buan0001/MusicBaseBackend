import { Router } from "express";
import connection from "../database.js";

const artistsRouter = Router();

// READ all artists
artistsRouter.get("/", (request, response) => {
  const query = "SELECT * FROM artists";
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
artistsRouter.post("/", (request, response) => {
  const artist = request.body;
  const query = "INSERT INTO artists (name, mail, title, image) VALUES (?, ?, ?, ?)";
  const values = [artist.name, artist.mail, artist.title, artist.image];

  connection.query(query, values, (error, results, fields) => {
    if (error) {
      console.log(error);
    } else {
      response.json(results);
    }
  });
});

/* INDSÆT KORREKT INFORMATION DER SKAL DISPLAYES FOR ARTIST, DVS. IKKE MAIL & TITLE */
// UPDATE artist
artistsRouter.put("/:id", (request, response) => {
  const id = request.params.id; // tager id fra URL'en
  const body = request.body;
  const query = "UPDATE artists SET name = ?, mail = ?, title = ?, image = ? WHERE id = ?";
  const values = [body.name, body.mail, body.title, body.image, id];

  connection.query(query, values, (error, results, fields) => {
    if (error) {
      response.json(error);
    } else {
      response.json(results);
    }
  });
});

// DELETE artist
artistsRouter.delete("/:id", (request, response) => {
  const id = request.params.id; // tager id fra URL'en
  const query = "DELETE from artists WHERE id = ?";
  const values = [id];

  connection.query(query, values, (error, results, fields) => {
    if (error) {
      response.json(error);
    } else {
      response.json(results);
    }
  });
});

export default artistsRouter;
