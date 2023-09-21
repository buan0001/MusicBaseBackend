import { Router } from "express";
import connection from "../database.js";

const tracksRouter = Router();

tracksRouter.get("/", (request, response) => {
  console.log("are u workin?");
  const query =
    /*sql*/
    `
    SELECT DISTINCT tracks.*,
       artists.name as ArtistName,
       artists.id as ArtistId
    FROM tracks
    INNER JOIN artists_tracks ON tracks.id = artists_tracks.track_id
    INNER JOIN artists ON artists_tracks.artist_id = artists.id
    ORDER BY tracks.title;
    `;
  connection.query(query, (error, results, fields) => {
    if (error) {
      console.log(error);
    } else {
      response.json(results);
    }
  });
});

// GET A SINGLE TRACK BY ID

tracksRouter.get("/:id", (req, res) => {
  const id = req.params.id;
  const queryString = /* sql */ `
        SELECT tracks.*,
            artists.name AS artistName,
            artists.id AS artistId
            FROM tracks
            INNER JOIN artists_tracks ON tracks.id = artists_tracks.trackID
            INNER JOIN artists ON artists_tracks.artistID = artists.id
            WHERE tracks.id = ?;
    `;
  connection.query(queryString, [id], (error, result) => {
    if (error) {
      console.error(error);
    } else {
      res.json(result);
    }
  });
});

export default tracksRouter;

// tracksRouter.get("/search", (request, response) => {
// 	const query = request.query.q;
// 	const queryString = /*sql*/ `
//     SELECT * FROM tracks WHERE name LIKE ? ORDER BY name;`;
// 	const values = [`%${query}%`];
// 	connection.query(queryString, values, (error, results) => {
// 		if (error) {
// 			console.error(error);
// 			response.status(500).json({ message: "Error occured" });
// 		} else {
// 			response.json(results);
// 		}
// 	});
// });