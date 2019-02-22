/**
 * Chat Application by AubynJ
 * License under MIT & SAGA (Swedish Ason Group) AB
 * Uploaded on Thu Feb 21, 16:07:08
 */

const mysql = require("mysql")

const connect = mysql.createConnection({
    connectionLimit : 100,
    host : "remotemysql.com",
    port     :  3306,
    user : "bVdoU1E9sL",
    password : "vNk1cxZnNL",
    database : "bVdoU1E9sL"
});


connect.connect(function(err, success) {
    // if (err) {
    //   console.error('error connecting: ' + err.stack);
    //   return;
    // }
    if (success){
        console.log(success)
    }
})

module.exports = connect
