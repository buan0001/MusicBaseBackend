import mysql from "mysql2"
import "dotenv/config"

const connection = mysql.createConnection({
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USER,
    port: process.env.MYSQL_PORT,
    database: process.env.MYSQL_DATABASE,
    password: process.env.MYSQL_PASSWORD,
    multipleStatements: true
})

export default connection