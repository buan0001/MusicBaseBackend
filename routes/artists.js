import { Router } from "express";
import connection from "../database.js";

const artistsRouter = Router();

// READ all artists
artistsRouter.get("/", (request, response) => {
  const queryString = /*sql*/ `
        SELECT * FROM artists 
        ORDER BY name;
        `;
  connection.query(queryString, (error, results) => {
    if (error) {
      console.error(error);
    } else {
      response.json(results);
    }
  });
});

// READ one artist
artistsRouter.get("/:id", (request, response) => {
  const id = request.params.id;
  const queryString = /*sql*/ `
    SELECT * FROM artists 
    WHERE id = ?;
    `;
    
    connection.query(queryString, [id], (error, results) => {
    if (error) {
      console.error(error);
    } else {
      response.json(results);
    }
  });
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
