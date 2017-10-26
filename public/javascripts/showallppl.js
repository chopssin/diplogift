(function() {
    $.ajax({
        type: 'GET',
        url: '/crud/showgivers'
    }).done(function(response) { 
        if (response.msg === 'OK') {
            $('#results').html('<ul></ul>');
            var arr = response.allgivers;
            for (var i = 0; i < arr.length; i++) {
                var hyperlink = '<a target = "_blank" href = "/' + arr[i].id + '">前往頁面</a>';
                switch (arr[i].id < 616 && arr[i].id > 612) {
                    case true: break;
                    default:
                        $('#results ul').append('<li><span style = "color: rgb(201, 152, 23);">' + arr[i].id + '</span><br><span>' + arr[i].name + '</span><br><span>' + arr[i].givenBy + '</span><br>' + hyperlink + '</li>');    
                }
            }
            
            // CSS
            $('ul').css({
                "list-style": "none"
            });
            $('li').css({
                "display": "block",
                "margin-bottom": "40px"
            });
        }
    });   
})()
