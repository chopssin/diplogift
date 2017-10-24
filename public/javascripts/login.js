(function(){
    var first = true;
    $('.fullscreen-mask').fadeOut(3000);
    $('input').focus(function() {
        $('.wrong').hide();
    });
    $('button#submit').click(function() {
        userInput = $('input#user').val();
        pwdInput = $('input#pwd').val();
        console.log(userInput);
        $('#login-form').hide();
        $('#waiting').show();
        $.ajax({
            type: 'POST',
            url: '/login',
            data: { inputName: userInput, inputPwd: pwdInput },
        }).done(function( response ){
            if ( response.msg === 'OK' ) {
                location.href = '/bg';
            } else {
                $('#login-form').show();
                $('#waiting').hide();
                if (!first) {
                    $('.wrong').show();
                    randomRGB = (function(){
                        var r = Math.floor(Math.random() * 255);
                        var g = Math.floor(Math.random() * 255);
                        var b = Math.floor(Math.random() * 255);
                        return 'rgba(' + r + ', ' + g + ', ' + b + ', 0.7)';
                    })();
                    $('body').css('background', randomRGB);
                    first = false;
                }
            }
        });
    });
    $(window).keyup(function(event) {
        if (event.which === 13 && $('#pwd').val().length > 0) {
            $('#submit').click();
        }
    });
    //$('#submit').click();
})()
