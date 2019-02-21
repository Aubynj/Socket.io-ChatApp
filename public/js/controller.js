/**
 * Chat Application by AubynJ
 * License under MIT & SAGA (Swedish Ason Group) AB
 * Uploaded on Thu Feb 21, 16:07:08
 */

$(function(){
    const SERVER_URL = {
        SIGN_UP_URL : "/sign_up",
        SIGN_IN_URL : "/sign_in"
    };

    // SVG Animate
    // new Vivus('my-svg-animate', {duration: 200});

    $("#sign_in_form").on("submit", function(e){
        e.preventDefault();
        var email = $("#email_user").val().trim(),
            password = $("#password_user").val().trim();

        if (email === "" || password === ""){
            notificationAction("Email and Password is required", "error")
        } else {
            let credentials = $.param({ email : email, password : password});

            $.post(SERVER_URL.SIGN_IN_URL, credentials, function(response){

                if (response.success) {
                    notificationAction(response.message, "success")
                    localStorage.setItem("nickname", response.nickname)
                    setTimeout(() => {
                        window.location.href = "/chat"                 
                    }, 3000);
                }else{
                    notificationAction(response.message, "error")
                }
            })
        }

        
    });

    $("#sign_up_form").on("submit", function(e){
        e.preventDefault();

        var nickname = $("#nickname").val().trim(),
            email = $("#user_email").val().trim(),
            password = $("#user_pass").val().trim();

        var data = $.param({
            nickname : nickname,
            email : email,
            password : password
        });

        if (nickname === "" || email === "" || password === ""){
            notificationAction("All fields are required", "error")            
        } else {

            $.post(SERVER_URL.SIGN_UP_URL, data, function(response){
                console.log(response)
                if (response.success) {
                    notificationAction(response.message, "success")
                    $("#sign_up_form")[0].reset()
                }else{
                    notificationAction(response.message, "error")
                }
            })
        }

    })


})

function finished(){
    alert("Finished")
}