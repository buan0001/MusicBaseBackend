import { Router } from "express";
import connection from "../database.js";

const tracksRouter = Router();

tracksRouter.get("/tracks", (request, response) => {
  const query =
    /*sql*/
    `SELECT  
    FROM tracks`;
  connection.query(query, (error, results, fields) => {
    if (error) {
      console.log(error);
    } else {
      response.json(results);
    }
  });
});