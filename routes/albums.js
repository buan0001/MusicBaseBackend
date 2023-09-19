import { Router } from "express";
import connection from "../database.js";

const albumsRouter = Router();

albumsRouter.get("/", (request, response) => {
  const query =
    /*sql*/
    `SELECT 
    FROM albums`;
  connection.query(query, (error, results, fields) => {
    if (error) {
      console.log(error);
    } else {
      response.json(results);
    }
  });
});