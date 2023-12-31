import mysql from "mysql2/promise";
import "dotenv/config";
import fs from "fs";

// Using variables from .env file and creates connection to database
const dbConfig = {
  host: process.env.MYSQL_HOST,
  user: process.env.MYSQL_USER,
  port: process.env.MYSQL_PORT,
  database: process.env.MYSQL_DATABASE,
  password: process.env.MYSQL_PASSWORD,
  multipleStatements: true,
};

if (process.env.MYSQL_CERT) {
  dbConfig.ssl = { ca: fs.readFileSync("DigiCertGlobalRootCA.crt.pem") };
}

const connection = await mysql.createConnection(dbConfig);

// Export Database Connection
export default connection;
