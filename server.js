/**
 * Chat Application by AubynJ
 * License under MIT & SAGA (Swedish Ason Group) AB
 * Uploaded on Thu Feb 21, 16:07:08
 */

const express = require('express')
const app = express()
const path = require('path')
const server = require('http').createServer(app)
const io = module.exports.io = require("socket.io").listen(server)
const ConEvent = require('./model/Events')
const sessions = require('express-session')
const SocketManager = require('./model/socketManager')
const con = require('./model/connection')
const bcrypt = require('bcrypt')
const bodyParser = require('body-parser')

const sessionMiddleWare = sessions({
    secret : 'fde93cabcfc242898c0e719c9b8e7e1f',
    cookie: { maxAge: 600000 },
    resave: true,
    saveUninitialized: false
})

// App sessions goes here
let sessionApp = module.exports.sessionApp
app.use(sessionMiddleWare)

// Socket.io session with middleware
io.use((socket,next) => {
	sessionMiddleWare(socket.request, socket.request.res, next)
});


app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));


server.listen(process.env.PORT || 3000)
console.log("Server running at PORT ", 3000)

io.on(ConEvent.USER_CONNECTED, SocketManager)

// Get method for user chat dashboard
app.get('/Chat', (req, res) => {
    sessionApp = req.session
    // console.log(sessionApp)
    if (sessionApp.uniqueID){
        res.sendFile(__dirname + '/Chat/index.html')
    }else{
        res.redirect('/')
    }   
})

// Get method for landing page
app.get("/", (req, res) => {
    sessionApp = req.session
    if (sessionApp.uniqueID){
        res.redirect('/Chat')
    }else{
        res.sendFile(__dirname + '/index.html')
    }
    // res.sendFile(__dirname + '/index.html')
});


// app.get("/password", (req, res) => {
//     res.sendFile(__dirname + '/password.html')
// });


// Get method for redirecting to Registration page
app.get("/join", (req, res) => {
    res.sendFile(__dirname + "/join.html")
})

// Post method for signing in user
app.post("/sign_in", (req, res) => {
    sessionApp = req.session
    let email = req.body.email
    let password = req.body.password
    
    // check if email and password exist
    con.query("SELECT * FROM users WHERE email = ?", [email], function(err, rows, fields){
        if (rows.length != 0){
            let hash = rows[0].pass_word
            if(bcrypt.compareSync(password, hash)) {
                // Passwords match
                sessionApp.uniqueID = req.body.email
                sessionApp.login = true
                sessionApp.nickname = rows[0].nickname
                res.send({id : rows[0].user_id, nickname : rows[0].nickname, "code":200, "success": true, message:"You have login successfully. Please wait..."});
               } else {
                // Password do not match
                res.send({"code":204, "success": false, message:"Password is incorrect" });
               }
        }else{
            res.send({"code":204, "success": false, message:"Email/Password combination is incorrect"   });
        }
    })
})

// Get method for login out user
app.get('/Logout', (req, res) => {
    req.session.destroy()
    res.session = null
    res.redirect('/')
})

// Post method for signing up
app.post("/sign_up", (req, res) => {
    let nickname = req.body.nickname
    let email = req.body.email
    let hash = bcrypt.hashSync(req.body.password, 10)
    let date = getCurrentDateAndTime()

    checkEmailAndNickname(email, nickname, con, (response) =>{
        // console.log(data)
        if (response.data === true){
            // Check if nickname and username exist
            for(var i = 0; i < response.details.length; i++) {
                if (response.details[i].nickname == nickname) {
                    res.send({"code":204, "success": false, message:"Nickname already exists" });
                    break;
                }
                if (response.details[i].email == email) {
                    res.send({"code":204, "success": false, message:"Email already exists" });
                    break;
                }
            }
        }else{
            // Insert into MYSQL DB
            con.query("INSERT INTO users(nickname, email, pass_word, date_creation) VALUES (?, ?, ?, ?)", [nickname, email, hash, date], function(err, rows, fields){
                if (err) throw err
                res.send({"code":200,success:true, message:"Account created Successfully. Login now"})
            })
        }
    })
})


// Functions to check if nickname and email exist in mysql db
function checkEmailAndNickname(email, nick, con, callback) {
    // Connect to mysql DB
    con.query("SELECT * FROM users WHERE email = ? or nickname = ?", [email, nick], function(err, rows, fields){
        if (rows.length != 0){
            callback({data : true, details : rows})
        }else{
            callback(false)
        }
    })  
}

// Functions to get current date and time
function getCurrentDateAndTime(){
    let date = new Date()
    let getTime = new Date(date.getTime())
    return getTime.toString().slice(0, -14).trim()
}
