/**
 * Chat Application by AubynJ
 * License under MIT & SAGA (Swedish Ason Group) AB
 * Uploaded on Thu Feb 21, 16:07:08
 */

const mysql = require("mysql")

const connect = mysql.createConnection({
    host : "localhost",
    user : "root",
    password : "",
    database : "chatapp"
});

module.exports = connect
