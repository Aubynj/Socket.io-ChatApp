/**
 * Chat Application by AubynJ
 * License under MIT & SAGA (Swedish Ason Group) AB
 * Uploaded on Thu Feb 21, 16:07:08
 */

const mysql = require("mysql")

const connect = mysql.createConnection({
    connectionLimit : 100,
    host : "fdb17.runhosting.com",
    port     :  3306,
    user : "2381642_codexmusik",
    password : "Programming!@1",
    database : "2381642_codexmusik"
});


connect.connect(function(err, success) {
    if (err) {
      console.error('error connecting: ' + err.stack);
      return;
    }
    if (success){
        console.log(success)
    }
})

module.exports = connect
