function notificationAction(text, check){
    $("#notify").html("<i class='icon-message fa'></i>");
    if(check === "success"){
        $("#notify").addClass("alert-success").removeClass("alert-danger alert-info");
        $("#notify").addClass("show").removeClass("hide");
        $("#notify").html(text);
        $(".icon-message").addClass("fa-check-circle-o").removeClass("fa-times-circle").css({'color':'#155724','font-size':'18px'});

    }else if(check === "error"){
        $("#notify").addClass("alert-danger").removeClass("alert-success alert-info");
        $("#notify").addClass("show").removeClass("hide");
        $("#notify").html(text);
        $(".icon-message").addClass("fa-times-circle").removeClass("fa-check-circle-o").css({'color':'#721c24','font-size':'18px'});

    }else if(check === "progress"){
        $("#notify").addClass("alert-info").removeClass("alert-success alert-danger");
    }
}