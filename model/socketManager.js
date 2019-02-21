const io = require('../server').io
const sessionApp = require('../server').sessionApp
const EVENTS =  require('./Events')
const con = require('./connection')
let connection = []
let users = []


module.exports =  (socket) => {
    let sess = socket.request.session
    let sessionNickname = sess.nickname
    socket.username = sessionNickname
    socket.join(EVENTS.ROOM)
    // getUserId(sessionNickname, (user)=>{
    //     console.log(user.user_id)
    // })

    showPreviousGroupMessage(EVENTS.ROOM, con)
    
    // Send nickname to client
    socket.emit(EVENTS.USER_NAME, {username : socket.username})

    // Connected Users
    connection.push(socket)
    users.push(socket.username)
    console.log("Connected: %s socket connected", connection.length)

    // Send connected user to client
    io.sockets.emit('PERSON_ON', {msg: socket.username})

    // Update Connected Users
    refreshUsers()

    //Disconnected users
    socket.on(EVENTS.USER_DISCONNECTED, (data) => {
        users.splice(users.indexOf(socket.username), 1)
        refreshUsers()
        io.emit(EVENTS.SIGN_OUT, {message: `${socket.username} Sign Out`})
        io.sockets.emit('PERSON_OFF', {msg: socket.username})
        connection.splice(connection.indexOf(socket),1)
        console.log("Disconnected: %s socket connected", connection.length)
    })

    // Socket event for checking if user already in socket
    socket.on(EVENTS.USER_JOINED_NOW, (data) => {
        let user_count = countConnectedUsers(users, data.nickname)
        console.log(user_count)
        console.log(users)
        if (user_count > 1) {
            console.log(`${data.nickname} already in socket`)
            socket.emit(EVENTS.USER_ALREADY_SIGN_IN, {nickname : data.nickname, message: `${data.nickname} already chatting`})
        } else {
            io.emit(EVENTS.JUST_JOINED_RESPONSE, {nickname: sessionNickname, dat: `${new Date().getHours()}:${new Date().getMinutes()} GMT`})            
            refreshUsers()
        }
    })


    // Sending event for user typing 
    socket.on(EVENTS.TYPING, (data)=>{
        socket.broadcast.emit(EVENTS.TYPING_NOW, {user: data})
    })

    // Sendng event for user stop typing
    socket.on(EVENTS.TYPING_STOP, (data)=>{
        socket.broadcast.emit(EVENTS.TYPING_STOP, {user: data})
    })

    // Sending events for new messages and incoming messages
    socket.on(EVENTS.MESSAGE_COMING, (data) => {
        let date = getCurrentDateAndTime()

        getUserId(sessionNickname, (user)=>{

            // Save message into db
            con.query('INSERT INTO messages(user_id,group_name,message_body,time_sent) VALUES(?,?,?,?)',
            [user.user_id, EVENTS.ROOM, data.message, date], (err, rows, fields) => {
                if (rows) {
                    io.emit(EVENTS.NEW_MESSAGE, {message: data.message, user:sessionNickname, date: date})
                }
            })
        })
       
    })

    // Personal message sending 
    socket.on(EVENTS.PERSONAL_MSG, (data) => {
        let date = getCurrentDateAndTime()
        // console.log(data);
        getUserId(sessionNickname, (user)=>{
            // Save message into db
            con.query('INSERT INTO messages(user_id,group_name,message_body,time_sent) VALUES(?,?,?,?)',
            [user.user_id, data.room, data.message, date], (err, rows, fields) => {
                if (rows) {
                    io.sockets.emit(EVENTS.PERSONAL_REV, {
                        message: data.message, 
                        user:sessionNickname, 
                        date: date, 
                        to: data.to, 
                        room : data.room
                    });
                }
            })
        })       
    })

    // Socket event for joining private message to room
    socket.on('personal_join', (data) => {
        socket.join(data.room)
        console.log(data.room + " Room is created")
    })

    // Socket event on server for listening to get-message
    socket.on('get-message', (data)=>{
        let sender = socket.username
        let room = ''
        for(i = 0; i < users.length; i++) {
            if (sender != users[i]){
                if (users[i] < sender) {
                    room = users[i]+'_'+sender
                    con.query('SELECT nickname,message_body,time_sent FROM messages INNER JOIN users on users.user_id = messages.user_id WHERE group_name = ?',
                    [room], (err, rows, fields) => {
                        console.log(rows)
                        if (rows.length > 0) {
                            io.sockets.emit(EVENTS.PERSONAL_HISTORY, {data_messages: rows, title : 'Previous Messages', room: room})
                        }
                    })
                }else{
                    room = sender+'_'+users[i]
                    con.query('SELECT nickname,message_body,time_sent FROM messages INNER JOIN users on users.user_id = messages.user_id WHERE group_name = ?',
                    [room], (err, rows, fields) => {
                        console.log(rows)
                        if (rows.length > 0) {
                            io.sockets.emit(EVENTS.PERSONAL_HISTORY, {data_messages: rows, title : 'Previous Messages', room: room})
                        }
                    })
                }
            }
        }
    })

    // Personal User typing message
    socket.on(EVENTS.TYPING_PERSONAL, (data)=>{
        socket.broadcast.emit(EVENTS.NOW_TYPING, {user: data})
    })

    // Personal User stop typing message
    socket.on(EVENTS.STOP_TYPING_PERSONAL, (data)=>{
        socket.broadcast.emit(EVENTS.STOP_TYPING_PERSONAL_NOW, {user: data})
    })

    // Getting previous group messages for conversation to proceed
    function showPreviousGroupMessage(room, con) {
        con.query('SELECT nickname,message_body,time_sent FROM messages INNER JOIN users on users.user_id = messages.user_id WHERE group_name = ?',
        [room], (err, rows, fields) => {
            if (rows.length > 0) {
                socket.emit(EVENTS.HISTORY, {data_messages: rows, title : 'Previous Messages'})
            }
        })
    }

    // Function to count users from connected socket
    function countConnectedUsers(array, user) {
        let count = 0
        for (i = 0; i < array.length; i++) {
            if (array[i] == user) {
                count++
            }
        }
        return count
    }

    // Function to get all users and refresh them at realtime
    function refreshUsers(){
        io.sockets.emit(EVENTS.GET_NICKNAMES, users)
    }

    // Using the Async mysql, we are getting user_id with a callback
    function getUserId(user, callback){
        con.query('SELECT * FROM users WHERE nickname = ?', [user], (err, rows, fields)=>{
            if (rows.length != 0){
                callback({user_id : rows[0].user_id})
            }
        })
    }

    // Get the current date and time and slice it
    function getCurrentDateAndTime(){
        let date = new Date()
        let getTime = new Date(date.getTime())
        return getTime.toString().slice(0, -14).trim()
    }
}