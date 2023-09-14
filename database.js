import mysql from "mysql2"

const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    port: 3306,
    database: "users_db",
    password: "qwer!234",
    multipleStatements: true
})

export default connection