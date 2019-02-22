/**
 * Chat Application by AubynJ
 * License under MIT & SAGA (Swedish Ason Group) AB
 * Uploaded on Thu Feb 21, 16:07:08
 */

const mysql = require("mysql")

const connect = mysql.createConnection({
    host : "fdb17.biz.nf",
    user : "2381642_codexmusik",
    password : "Programming!@1",
    database : "2381642_codexmusik"
});

module.exports = connect
