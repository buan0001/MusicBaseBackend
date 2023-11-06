import mysql from "mysql2/promise";
import "dotenv/config";

// Using variables from .env file and creates connection to database
const dbConfig = {
  host: process.env.MYSQL_HOST,
  user: process.env.MYSQL_USER,
  port: process.env.MYSQL_PORT,
  database: testTracks,
  password: process.env.MYSQL_PASSWORD,
  multipleStatements: true,
};

const connection = await mysql.createConnection(dbConfig);

// Export Database Connection
export default connection;
