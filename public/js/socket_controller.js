/**
 * Chat Application by AubynJ
 * License under MIT & SAGA (Swedish Ason Group) AB
 * Created on 
 */

var socket = io.connect(); //Initializing socket for the communication
var username = localStorage.getItem('nickname') //Get user store from localStorage

$(function(){
    var username = localStorage.getItem("nickname")

    // Socket event to get user
    socket.on("USER", (data) => {
        $("#nickname_top").html(data.username)
    })

    // Emit user joining to channel
    socket.emit('USER_JUST_JOINED', {nickname :username})

    // Emit information for user if already in socket
    socket.on('USER_CHATTING', (data) => {
        // console.log(data)
        alert(data.nickname+ " has already login")
        localStorage.removeItem("nickname")
        window.location.href = '/Logout'
    })

    // Channel to receive new messages for general forum
    socket.on('NEW_MESSAGE', (data) => {
        var template  = ''
        var newD
        var cur = new Date()
        var oldD = new Date(data.date)
        var min_2 = 2 * 60 * 1000
        if ((cur - oldD) < min_2){
            newD = "Now"
        } else {
            newD = data.date.toString().slice(16, -3).trim()
        }
        if (username != data.user) {
            template += '<li class="list-group-item box-color" id="message-list-box">' +
                            '<div class="d-flex w-100 justify-content-between">'+
                                '<h6 class="mb-1"><i>'+data.user+'</i></h6> '+'<small>'+newD+'</small>'+
                            '</div>'+
                            // '<img src="/img/user.png" class="online-img-user float-left" alt="online">'+
                            '<span class="mb-1">'+data.message+'</span><br/>'+
                        '</li>';
        } else {
            template += '<li class="list-group-item list-group-item-light box-user" id="message-list-box">' +
                            '<div class="d-flex w-100 justify-content-between">'+
                                '<h6 class="mb-1"><i>You</i></h6> '+ '<small>'+newD+'</small>'+
                            '</div>'+
                            // '<img src="/img/user.png" class="online-img-user float-right" alt="online"> '+
                            '<span class="mb-1">'+data.message+'</span><br/>'+
                        '</li>';
        }
        $("#message-list").append(template)
        $('#chat-box').animate({scrollTop:$('#chat-box').prop("scrollHeight")},1400);
    })
    

    // Event for getting previous message for general room
    socket.on('HISTORY', function(data){
        var title = data.title
        var temp = ''
        for (i = 0; i < data.data_messages.length; i++) {
            if (username != data.data_messages[i].nickname){
                temp += '<li class="list-group-item box-color" id="message-list-box">'+
                        '<div class="d-flex w-100 justify-content-between">'+
                            '<h6 class="mb-1"><i>'+data.data_messages[i].nickname+'</i></h6> '+'<small>'+data.data_messages[i].time_sent+' GMT</small>'+
                        '</div>'+
                            '<span class="mb-1">'+data.data_messages[i].message_body+'</span><br/>'+
                            
                        '</li>'
            } else {
                temp += '<li class="list-group-item box-user" id="message-list-box">'+
                        '<div class="d-flex w-100 justify-content-between">'+
                            '<h6 class="mb-1"><i>You</i></h6> '+'<small>'+data.data_messages[i].time_sent+' GMT</small>'+
                        '</div>'+
                            '<span class="mb-1">'+data.data_messages[i].message_body+'</span><br/>'+
                            
                        '</li>'
            }
            
        }
        $("#message-list").append(temp)
        $("#previous-msg-title").append(title).css('text-align', 'center').fadeOut(2000)
        $('#chat-box').animate({scrollTop:$('#chat-box').prop("scrollHeight")},1400);
    })


    // Event for receiving new messsage
    socket.on('GET_USERS', (data) => {
        let template = ''
        for (i = 0; i < data.length; i++) {
            if (username != data[i]){
                template += '<li class="list-group-item friend-list" onclick="startPrivateMessage(\''+data[i]+ '\');">'+
                                '<img src="/img/user.png" class="online-img-user" alt="online"> '+
                                    '<span>'+data[i] +'</span>'+
                                '<img src="/img/online.png" class="online-img float-right mt-2" alt="online">'+
                            '</li>'
            }else{
                template += '<li class="list-group-item">'+
                            '<img src="/img/user.png" class="online-img-user" alt="online"> <span>You</span>'+

                            '<img src="/img/online.png" class="online-img float-right mt-2" alt="online">'+
                        '</li>'
            }
        }
        $("#online-use").html(template)
    })

    // Response for USER JUST JOINED
    socket.on('USER_JOINED_RESPONSE', (data) => {
        if (username != data.nickname) {
            $("#user_log").append(
                '<li class="list-group-item">'+
                 '<i class="small">'+data.nickname +' Just Joined at ' + data.dat +'</i>'+
                '</li>'
            );
        } else {
            $("#user_log").append(
                '<li class="list-group-item">'+
                '<i>'+'You Just Joined at ' + data.dat +'</i>'+
                '</li>'
            );
        }     
    })

    // Response for USER SIGN OUT
    socket.on('SIGN_OUT', (data) => {
        $("#user_log").append(
            '<li class="list-group-item">'+
            '<i class="small">'+data.message +'</i>'+
            '</li>'
        );
    })

    // Channel for user typing
    $("#message_box").on('keypress', function(e){
        let localnick = localStorage.getItem("nickname");
        socket.emit('TYPING', {user : localnick })
    })

    // Event for getting keyboard lift 
    $("#message_box").on('keyup', function(e){
        let localnick = localStorage.getItem("nickname");
        setTimeout(function(){
        socket.emit('STOP_TYPING', {user : localnick})
        }, 1000)
    })

    // Socket event for listening to user input
    socket.on('TYPING_NOW', function(data){
        console.log(data.user)
        $("#typing_user").html(data.user.user+' is typing now.')
    })

    // Socket event to listening to user stop typing
    socket.on('STOP_TYPING', function(data){
        console.log(data)
        $("#typing_user").html('')
    })


    // Socket event for sending general forum message
    $("#message-form").on('submit', function(e){
        e.preventDefault()
         var message_box = $('#message_box').val().trim()
         message_box = message_box.replace(/</g, "&lt;").replace(/>/g, "&gt;");
         message_box = message_box.charAt(0).toUpperCase() + message_box.substr(1)
         if (message_box == "") {
             $('#notify').html('Message fields is required').css('color', 'red')
         } else {
            // Sending message
            $('#notify').html('')
            // socket event for sending general message
            socket.emit('MESSAGE_SENDING', {message : message_box})
            $('#message-form')[0].reset()
         }
    })

    // Socket event to get private chat from to the receiver
    socket.on('PERSONAL_RECEIVED', (data) => {
        // console.log(data)
        var template  = ''
        var newD
        var cur = new Date()
        var oldD = new Date(data.date)
        var min_2 = 2 * 60 * 1000
        if ((cur - oldD) < min_2){
            newD = "Now"
        } else {
            newD = data.date.toString().slice(16, -3).trim()
        }
        if (username != data.user) {
            template += '<li class="list-group-item box-color" id="message-list-box">' +
                            '<div class="d-flex w-100 justify-content-between">'+
                                '<h6 class="mb-1"><i>'+data.user+'</i></h6> '+'<small>'+newD+'</small>'+
                            '</div>'+
                            // '<img src="/img/user.png" class="online-img-user float-left" alt="online">'+
                            '<span class="mb-1">'+data.message+'</span><br/>'+
                        '</li>';
        } else {
            template += '<li class="list-group-item list-group-item-light box-user" id="message-list-box">' +
                            '<div class="d-flex w-100 justify-content-between">'+
                                '<h6 class="mb-1"><i>You</i></h6> '+ '<small>'+newD+'</small>'+
                            '</div>'+
                            // '<img src="/img/user.png" class="online-img-user float-right" alt="online"> '+
                            '<span class="mb-1">'+data.message+'</span><br/>'+
                        '</li>';
        }
        $("#message-list-personal-"+data.room).append(template)
        $('#personal-chat-area-'+data.room).css({'height':'200px', 'overflow-y': 'scroll'})
        $('#personal-chat-area-'+data.room).animate({scrollTop:$('#personal-chat-area-'+data.room).prop("scrollHeight")},1400);
    })

    // Event for submitting personal private chat
    $(document).on('click', '.send-chat', function(event){
        event.preventDefault();
        var user = $(this).attr('id')
        var room = $(this).attr('pi')

        // Socket event for join private chat into rooms (Not in use)
        socket.emit('personal_join', {room : room})

        var message_box = $("#personal-textarea-"+user+"").val().trim()
        message_box = message_box.charAt(0).toUpperCase() + message_box.substr(1)
        if (message_box != ""){
            // Socket event to send private chat message
            socket.emit('PERSONAL_SENDING', {message : message_box, to : user, room: room})
            $("#personal-textarea-"+user+"").val("")
        }
    })

       

    // ##########################################################################


    // Handling the logout event from here
    $("#logout").on("click", function(e){
        e.preventDefault();
        let localnick = localStorage.getItem("nickname");

        socket.emit('disconnect', {nickname: localnick})
        localStorage.removeItem("nickname")
        window.location.href = '/Logout'
    })
})

// Function to get the personal section chat to open
function openForm(recv) {
    var id = "myForm_"+recv
    document.getElementById(id).style.display = "block";
}
  
// Function to get the close form for personal chat
function closeForm(recv) {
    var id = "myForm_"+recv
    document.getElementById(id).style.display = "none";
}
 
// Function to get the exist form for personal chat
function exitForm(recv) {
    $("#message-draggable_"+recv+"").remove()  
}

// Function techniques to start private chatting 
function startPrivateMessage(to, from=username, soc=socket) {
    var room = ''
    if (to < from) {
        room = to+'_'+from
    }else{
        room = from+'_'+to
    }
    // socket.emit('personal_join', {room : room})
    $('#personal-mesg').append(
        $(
            '<div id="message-draggable_'+to+'">'+
                '<div class="chat-popup" id="myForm_'+to+'">'+
                    '<div class="form-container">'+
                    '<section class="card">'+
                        '<div class="card-header">'+
                        '<span id="on-off-msg-'+to+'"><img src="/img/online.png" class="online-btn" alt="online"></span>'+
                        '    <span>'+to+'</span>'+
                        '    <button type="button" class="close" aria-label="Close" onclick="closeForm(\''+to+'\')">'+
                        '        <span aria-hidden="true">&times;</span>'+
                        '    </button>'+
                        '    <span id="personal-out-typ-'+to+'"></span>'+
                        '</div>'+
                    '</section>'+
                        '<section class="chat_personal" id="personal-chat-area-'+room+'">'+
                        '    <ul class="list-group" id="message-list-personal-'+room+'"></ul>'+
                        '    <ul class="list-group" id="previous-msg-title-personal-'+room+'"></ul>'+
                        '</section>'+
                        '<form id="personal-message">'+
                            '<section class="form-group">'+
                            '    <textarea class="form-control text-area-personal" placeholder="Type message.." id="personal-textarea-'+to+'" required></textarea>'+
                            '</section>'+
                            '<button type="submit" class="btn btn-primary btn-large send-chat" id="'+to+'" pi="'+room+'">Send</button>'+
                        '</form>'+
                        '<!-- <button type="button" class="btn cancel" onclick="closeForm()">Close</button> -->'+
                    '</div>'+
                '</div>'+
                '<div  class="btn btn-primary open-button" id="dragmeover" onclick="openForm(\''+to+'\')">'+
                '<span id="on-off-'+to+'"><img src="/img/online.png" class="online-btn" alt="online"></span> &nbsp;'+
                    to+
                '    <span id="personal-bin-typ-'+to+'"></span>'+
                '    <button type="button" class="close " onclick="exitForm(\''+to+'\')">'+
                '        <span aria-hidden="true">&times;</span>'+
                '    </button>'+
                '</div>'+
            '</div>'
        )
    );
    $("#message-draggable_"+to+"").draggable();
    // $("#on-off-"+to).html('<img src="/img/online.png" class="online-btn" alt="online">')

    // Personal user typing
    $("#personal-textarea-"+to+"").on('keypress', function(e){
        let localnick = localStorage.getItem("nickname");
        soc.emit('TYPING_PERSONAL', {user : localnick })
    })

    $("#personal-textarea-"+to+"").on('keyup', function(e){
        // console.log("stop typing")
        let localnick = localStorage.getItem("nickname");
        setTimeout(function(){
        soc.emit('STOP_TYPING_PERSONAL', {user : localnick})
        }, 1000)
    })
    
    // Personal typing now
    soc.on('NOW_TYPING', function(data){
        // console.log(data)
        $("#personal-out-typ-"+to).html('is typing now')
        $("#personal-bin-typ-"+to).html('is typing now')
    })
    // Personal stop typing now
    soc.on('STOP_TYPING_PERSONAL_NOW', function(data){
        $("#personal-out-typ-"+to).html('')
        $("#personal-bin-typ-"+to).html('')
    })

    // Socket event to get all messages for personal chat
    soc.emit('get-message', {message: 'all message'})

    // Socket event to get person activity for offline 
    soc.on('PERSON_OFF', function(data){
        if (data.msg == to) {
            $("#on-off-"+to).html('<img src="/img/offline.png" class="online-btn" alt="online">')
            $("#on-off-msg-"+to).html('<img src="/img/offline.png" class="online-btn" alt="online">')
        }
    })

    // Socket event to get person activity for online     
    soc.on('PERSON_ON', function(data){
        console.log(data + "online now")
        if (data.msg == to) {
            $("#on-off-"+to).html('<img src="/img/online.png" class="online-btn" alt="online">')
            $("#on-off-msg-"+to).html('<img src="/img/online.png" class="online-btn" alt="online">')
        }
    })

    // Socket event to fetch all private chat history
    soc.on('PERSONAL_HISTORY', function(data){
        var title = data.title
        var temp = ''
        for (i = 0; i < data.data_messages.length; i++) {
            if (username != data.data_messages[i].nickname){
                temp += '<li class="list-group-item box-color" id="message-list-box">'+
                        '<div class="d-flex w-100 justify-content-between">'+
                            '<h6 class="mb-1"><i>'+data.data_messages[i].nickname+'</i></h6> '+'<small>'+data.data_messages[i].time_sent+' GMT</small>'+
                        '</div>'+
                            '<span class="mb-1">'+data.data_messages[i].message_body+'</span><br/>'+
                        '</li>'
            } else {
                temp += '<li class="list-group-item box-user" id="message-list-box">'+
                        '<div class="d-flex w-100 justify-content-between">'+
                            '<h6 class="mb-1"><i>You</i></h6> '+'<small>'+data.data_messages[i].time_sent+' GMT</small>'+
                        '</div>'+
                            '<span class="mb-1">'+data.data_messages[i].message_body+'</span><br/>'+   
                        '</li>'
            }
        }

        $("#message-list-personal-"+data.room).append(temp)
        $("#previous-msg-title-personal-"+data.room).append(title).css('text-align', 'center').fadeOut(12000)
        $('#personal-chat-area-'+data.room).css({'height':'200px', 'overflow-y': 'scroll'})
        $('#personal-chat-area-'+data.room).animate({scrollTop:$('#personal-chat-area-'+data.room).prop("scrollHeight")},1400);
    })
}