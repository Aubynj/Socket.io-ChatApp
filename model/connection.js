const mysql = require("mysql")

const connect = mysql.createConnection({
    host : "localhost",
    user : "root",
    password : "",
    database : "chatapp"
});

module.exports = connect
