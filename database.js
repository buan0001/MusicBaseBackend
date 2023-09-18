import mysql from "mysql2";
import fs from "fs";

const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    port: 3306,
    database: "users_db",
    password: "qwer!234",
    multipleStatements: true
})
if(process.env.MYSQL_CERT) {
    dbconfig.ssl = { cs: fs.readFileSync("DigiCertGlobalRootCA.crt.pem") };
}

export default connection